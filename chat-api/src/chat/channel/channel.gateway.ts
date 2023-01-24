import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UsePipes } from '@nestjs/common';
import { WSPipe } from 'src/exception/websockets/ws-exception-filter'
import { HttpException, HttpStatus } from '@nestjs/common';
import { Channel, ChannelType, User, UserChannel, UserChannelRole } from 'db-interface/Core';
import { JoinChannelDto } from './dto/join-channel.dto';
import { UserService } from '../user/user.service';
import { UserChannelService } from '../user-channel/user-channel.service';
import { CreateUserChannelDto } from '../user-channel/dto/create-user-channel.dto';
import { KickUserDto } from './dto/kick-user.dto';
import { GrantUserDto } from './dto/grant-user.dto';
import { BannedChanService } from '../banned-chan/banned-chan.service';
import { DirectMessageDto } from './dto/direct-message.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UserChannelDto } from './dto/user-channel.dto';
import { MuteUserDto } from './dto/mute-user.dto';
import { BlockerBlockedService } from '../blocker-blocked/blocker-blocked.service';
import { BlockUserDto } from './dto/block-user.dto';

@UsePipes(WSPipe)
@WebSocketGateway({ cors: { origin: '*' } })
export class ChannelGateway {
	constructor(private channelService: ChannelService,
		private userService: UserService,
		private userChannelService: UserChannelService,
		private bannedChanService: BannedChanService,
		private blockerBlockedService: BlockerBlockedService
	) { }

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('ChannelGateway');

	@SubscribeMessage('createChannel')
	async createNewChan(client: any, payload: CreateChannelDto): Promise<void> {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);
			let new_chan = await this.channelService.create(payload, user);

			const userChannelData: CreateUserChannelDto =
			{
				userId: user.id,
				channelId: new_chan.id
			}
			await this.userChannelService.create(userChannelData, UserChannelRole.owner);

			const sentPayload =
			{
				channelId: new_chan.id,
				locked: false,
				messages: [],
			}

			new_chan = await this.channelService.findWithUserChan(new_chan.id);
			this.server.to(client.id).emit('redirectChan', { channel: new_chan })
			this.server.to(client.id).emit('allChanMessagesToClient', sentPayload);

			this.sendAllChan(client)
		} catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}

	@SubscribeMessage('quitChannel')
	async quitChan(client: any, payload: JoinChannelDto): Promise<void> {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			let userchannels = await this.userChannelService.findByUserAndChan(user.id, payload.id)
			for (let userchannel of userchannels) {
				await this.userChannelService.remove(userchannel.id);
			}

			const sentPayload =
			{
				channelId: payload.id,
				locked: true,
				messages: [],
			}

			const channel = await this.channelService.findOne(payload.id);
			
			// case for DM
			if (channel.type == ChannelType.direct) {
				userchannels = await this.userChannelService.findByChanId(channel.id)
				for (let userchannel of userchannels) {
					await this.userChannelService.remove(userchannel.id);
				}
				const userOne = channel.userOne;
				const userTwo = channel.userTwo;
				this.server.to(userOne.chatSocketId).emit('allChanMessagesToClient', sentPayload);
				this.server.to(userTwo.chatSocketId).emit('allChanMessagesToClient', sentPayload);
				const userchandatas =
				{
					channelId: channel.id,
					userchannels: {}
				}
				this.server.to(userOne.chatSocketId).emit('channelUsersToClient', userchandatas);
				this.server.to(userTwo.chatSocketId).emit('channelUsersToClient', userchandatas);

				this.server.to(userOne.chatSocketId).emit('redirectChan', {channelFromId: payload.id, channel: null })
				this.server.to(userTwo.chatSocketId).emit('redirectChan', {channelFromId: payload.id, channel: null })


				await this.channelService.remove(payload.id);
				this.server.to(client.id).emit('redirectChan', { channel: null })
				await this.sendAllChan(client);
				return;
			}
			
			this.server.to(client.id).emit('allChanMessagesToClient', sentPayload);
			this.server.to(client.id).emit('redirectChan', { channel: null })
			await this.sendAllChan(client);
			await this.sendChannelUsers(client, payload);

		}
		catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}


	@SubscribeMessage('getAllChannels')
	async sendAllChan(client: Socket) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const all_chan = await this.channelService.findAll();
			this.server.emit('allChansToClient', all_chan);
		} catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}

	@SubscribeMessage('getChannelUsers')
	async sendChannelUsers(client: Socket, payload: UserChannelDto) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const userchannels = await this.userChannelService.findByChanId(payload.id);
			const sentDatas =
			{
				channelId: payload.id,
				userchannels: userchannels
			}
			for (let userchan of userchannels) {
				this.server.to(userchan.user.chatSocketId).emit('channelUsersToClient', sentDatas);
			}
		}
		catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}

	@SubscribeMessage('joinChannel')
	async sendChanMessages(client: Socket, payload: JoinChannelDto, allowed: boolean = false) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);
			let channel = await this.channelService.findChanWithCreator(payload.id)

			if (channel.type == ChannelType.direct && (channel.userOne.login != user.login && channel.userTwo.login != user.login))
			{
				this.server.to(client.id).emit('redirectChan', { channel: null });
				throw new HttpException(`You are not authorized to join direct_channel #${channel.name}`, HttpStatus.FORBIDDEN);
			}

			const userchannels = await this.userChannelService.findByUserAndChan(user.id, payload.id);
			if (userchannels.length == 0) {
				try {
					await this.bannedChanService.bannedChanGuard(user.id, payload.id, allowed);
				} catch (error) {
					this.server.to(client.id).emit('redirectChan', { channel: null });
					throw new HttpException(error.message, HttpStatus.FORBIDDEN);
				}

				await this.channelService.checkChanValidity(payload);
				const userChannelData: CreateUserChannelDto =
				{
					userId: user.id,
					channelId: payload.id
				}
				
				if (channel.creator && channel.creator.login == user.login)
					await this.userChannelService.create(userChannelData, UserChannelRole.owner)
				else
					await this.userChannelService.create(userChannelData)
			}

			const chanMessages = await this.channelService.selectMessagesForUser(payload.id, user)
			const sentPayload =
			{
				channelId: payload.id,
				locked: false,
				messages: chanMessages,
			}

			this.server.to(client.id).emit('allChanMessagesToClient', sentPayload);
			channel = await this.channelService.findChanWithCreator(payload.id)
			this.server.to(client.id).emit('getCurrentChannel', {channel: channel});

			await this.sendChannelUsers(client, payload);
			await this.sendAllChan(client);
		} catch (error) {
			this.server.to(client.id).emit('allChanMessagesToClient', { channelId: payload.id, locked: true, messages: {} });
			this.server.to(client.id).emit('chatError', error.message);
		}
	}

	@SubscribeMessage('kickUser')
	async kickUserFromChan(client: Socket, payload: KickUserDto) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);
			if (user.id == payload.userId)
				throw new HttpException(`You can't kick yourself`, HttpStatus.FORBIDDEN);

			const channel = await this.channelService.findOne(payload.channelId);
			if (channel.type == ChannelType.direct)
				return;
			let userChannels: UserChannel[] = await this.userChannelService.findByUserAndChan(user.id, payload.channelId);
			if (userChannels.length == 0) {
				this.server.to(client.id).emit('chatError', `you are not connected to channel ${channel.name} to use this privilege`);
				return;
			}
			let userChannel = userChannels[0];
			if (userChannel.role == UserChannelRole.member) {
				this.server.to(client.id).emit('chatError', `you have not enough rights inside channel ${channel.name} to use this privilege`);
				return;
			}
			const kickedUser = await this.userService.getUserById(payload.userId);
			const kickedUserChannels = await this.userChannelService.findByUserAndChan(kickedUser.id, payload.channelId);
			if (kickedUserChannels.length == 0) {
				this.server.to(client.id).emit('chatError', `${kickedUser.login} is not in channel ${channel.name} `);
				return;
			}
			if (kickedUserChannels[0].role == UserChannelRole.owner || (kickedUserChannels[0].role == UserChannelRole.admin && userChannel.role == UserChannelRole.admin)) {
				this.server.to(client.id).emit('chatError', `you can't ban ${kickedUser.login} in ${channel.name} `);
				return;
			}
			await this.userChannelService.remove(kickedUserChannels[0].id)
			const sentPayload =
			{
				channelId: channel.id,
				locked: true,
				messages: [],
			}

			this.bannedChanService.create(kickedUser.id, channel.id, payload.expirationDate);
			this.server.to(kickedUser.chatSocketId).emit('redirectChan', { channel: null });
			this.server.to(kickedUser.chatSocketId).emit('chatError', `You have been banned from ${channel.name} by ${user.login}`);
			await this.sendChannelUsers(client, { id: payload.channelId });
			this.sendAllChan(client);
		}
		catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}


	@SubscribeMessage('grantUser')
	async transferPrivilegeToUser(client: Socket, payload: GrantUserDto) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			if (user.id == payload.userId)
				throw new HttpException(`you can't grant yourself`, HttpStatus.FORBIDDEN);

			const channel = await this.channelService.findOne(payload.channelId);
			if (channel.type == ChannelType.direct)
				return;

			let userChannels: UserChannel[] = await this.userChannelService.findByUserAndChan(user.id, payload.channelId);

			if (userChannels.length == 0)
				throw new HttpException(`you are not connected to channel ${channel.name} to use this privilege`, HttpStatus.FORBIDDEN);

			let userChannel = userChannels[0];
			if (userChannel.role == UserChannelRole.member)
				throw new HttpException(`you have not enough rights inside channel ${channel.name} to use this privilege`, HttpStatus.FORBIDDEN);

			const grantedUser = await this.userService.getUserById(payload.userId);
			const grantedUserChannels = await this.userChannelService.findByUserAndChan(grantedUser.id, payload.channelId);
			if (grantedUserChannels.length == 0)
				throw new HttpException(`${grantedUser.login} is not in channel #${channel.name}`, HttpStatus.FORBIDDEN);

			if (grantedUserChannels[0].role == UserChannelRole.owner || grantedUserChannels[0].role == UserChannelRole.admin)
				throw new HttpException(`${grantedUserChannels[0].user.login} is already ${grantedUserChannels[0].role} of channel #${channel.name}`, HttpStatus.FORBIDDEN);

			for (let userchannel of grantedUserChannels) {
				await this.userChannelService.update(userchannel.id, payload.role)
			}

			this.server.to(client.id).emit('chatMsg', `${grantedUserChannels[0].user.login} has been promoted ${payload.role} in channel #${channel.name}`);
			this.server.to(grantedUserChannels[0].user.chatSocketId).emit('chatMsg', `You have been promoted ${payload.role} in channel #${channel.name}`);
			this.sendChannelUsers(client, { id: payload.channelId });
		}
		catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}

	@SubscribeMessage('directMessage')
	async createDirectMessage(client: Socket, payload: DirectMessageDto) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const sender = await this.userService.getUserByToken(token);
			const receiver = await this.userService.getUserByLogin(payload.login);

			if (sender.login == receiver.login)
				throw new HttpException(`You can't DM yourself`, HttpStatus.FORBIDDEN);

			const isblocked: boolean = await this.blockerBlockedService.isBlockedBy(sender, receiver);
			if (isblocked)
				throw new HttpException(`You can't send a direct-message to ${receiver.login} because you are blocked by him.`, HttpStatus.FORBIDDEN);

			const DMChannels = await this.channelService.findDMChannel(sender.id, receiver.id);
			if (DMChannels.length != 0) {
				this.server.to(client.id).emit('chatError', `There is already a conversation between ${sender.login} and ${receiver.login}`);
				return;
			}

			let chan = await this.channelService.createDMChannel(sender, receiver);
			const userChannelData: CreateUserChannelDto =
			{
				userId: sender.id,
				channelId: chan.id
			}
			await this.userChannelService.create(userChannelData, UserChannelRole.member);
			userChannelData.userId = receiver.id;
			await this.userChannelService.create(userChannelData, UserChannelRole.member);

			chan = await this.channelService.findWithUserChan(chan.id);
			this.server.to(client.id).emit('redirectChan', { channel: chan })
			this.server.to(receiver.chatSocketId).emit('chatMsg', `${sender.login} wants to talk to you in a direct_message channel`);
			this.sendAllChan(client);
		}
		catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}

	@SubscribeMessage('muteUser')
	async muteUser(client: Socket, payload: MuteUserDto) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const admin = await this.userService.getUserByToken(token);
			const muted = await this.userService.getUserByLogin(payload.userLogin);
			const channel = await this.channelService.findOne(payload.channelId);

			if (admin.login == muted.login)
				throw new HttpException(`You can't mute yourself`, HttpStatus.FORBIDDEN);

			const requesterUserChannels = await this.userChannelService.findByUserAndChan(admin.id, channel.id);
			if (requesterUserChannels.length == 0)
				throw new HttpException(`You are not in the channel #${channel.name} to mute somebody`, HttpStatus.FORBIDDEN);

			const mutedUserChannels = await this.userChannelService.findByUserAndChan(muted.id, channel.id);
			if (mutedUserChannels.length == 0)
				throw new HttpException(`${muted.login} is not in channel ${channel.name} `, HttpStatus.FORBIDDEN);

			if (requesterUserChannels[0].role == UserChannelRole.member)
				throw new HttpException(`You have not enougth priviledge to (un)mute ${muted.login}`, HttpStatus.FORBIDDEN);

			if (requesterUserChannels[0].role == UserChannelRole.admin && (mutedUserChannels[0].role == UserChannelRole.owner || mutedUserChannels[0].role == UserChannelRole.admin))
				throw new HttpException(`You have not enougth priviledge to (un)mute ${muted.login}`, HttpStatus.FORBIDDEN);

			await this.userChannelService.update(mutedUserChannels[0].id, mutedUserChannels[0].role, payload.muted);
			this.sendChannelUsers(client, { id: payload.channelId });
		}
		catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}

	}

	@SubscribeMessage('inviteUser')
	async inviteUser(client: Socket, payload: InviteUserDto) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			const invited = await this.userService.getUserByLogin(payload.userLogin);
			const chan = await this.channelService.findOne(payload.channelId)

			if (user.login == invited.login)
				throw new HttpException(`You can't invite yourself`, HttpStatus.FORBIDDEN);

			if (chan.type == ChannelType.direct)
				throw new HttpException(`You can't invite someone else in a direct message channel`, HttpStatus.FORBIDDEN);

			const requesterUserChannels = await this.userChannelService.findByUserAndChan(user.id, chan.id);
			if (requesterUserChannels.length == 0)
				throw new HttpException(`You are not in the channel #${chan.name} to invite somebody`, HttpStatus.FORBIDDEN);

			const bannedChannelsInvited = await this.bannedChanService.findByUserAndChan(invited.id, chan.id)
			if (bannedChannelsInvited.length != 0)
				await this.bannedChanService.remove(bannedChannelsInvited[0].id)

			const userChannels = await this.userChannelService.findByUserAndChan(invited.id, chan.id);
			if (userChannels.length)
				throw new HttpException(`${invited.login} is already in the channel #${chan.name}`, HttpStatus.FORBIDDEN);

			const userchannel = await this.userChannelService.create({ userId: invited.id, channelId: chan.id });

			this.sendChannelUsers(client, { id: chan.id })
			this.sendAllChan(client)
			this.server.to(client.id).emit('chatMsg', `Invitation in channel #${chan.name} sent to ${invited.login} `);
			this.server.to(invited.chatSocketId).emit('chatMsg', `You have been invited by ${user.login} in channel #${chan.name}`);


		}
		catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}


	@SubscribeMessage('updateChannel')
	async updateChannel(client: Socket, payload: UpdateChannelDto) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);

			const user = await this.userService.getUserByToken(token);
			const channel = await this.channelService.findOne(payload.id);

			const userChannels = await this.userChannelService.findByUserAndChan(user.id, payload.id);
			if (userChannels[0].role == UserChannelRole.member)
				throw new HttpException(`You have not enougth privileges in channel #${channel.name} to update settings. Only owner and admin are authorized`, HttpStatus.FORBIDDEN);

			await this.channelService.update(payload);
			this.server.to(client.id).emit('chatMsg', `channel ${channel.name} updated !`);
			this.sendAllChan(client);
		}
		catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}

	@SubscribeMessage('blockUser')
	async blockUser(client: Socket, payload: BlockUserDto) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			let blocker = await this.userService.getUserByToken(token);
			const blocked = await this.userService.getUserByLogin(payload.login);
			await this.blockerBlockedService.create(blocker, blocked);
			this.server.to(client.id).emit('chatMsg', `You have blocked ${blocked.login}`);

			const userBlockList = await this.blockerBlockedService.userBlockList(blocker);
			this.server.to(client.id).emit('updateBlockList', { blockList: userBlockList });
			await this.sendChanMessages(client, { id: payload.channelId, password: null });
		}
		catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}

	@SubscribeMessage('unBlockUser')
	async unBlockUser(client: Socket, payload: BlockUserDto) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			let blocker = await this.userService.getUserByToken(token);
			const blocked = await this.userService.getUserByLogin(payload.login);
			const blockerBlockeds = await this.blockerBlockedService.findByBlockerAndBlocked(blocker, blocked);
			await this.blockerBlockedService.remove(blockerBlockeds[0].id);
			this.server.to(client.id).emit('chatMsg', `You have unblocked ${blocked.login}`);

			const userBlockList = await this.blockerBlockedService.userBlockList(blocker);
			this.server.to(client.id).emit('updateBlockList', { blockList: userBlockList });
			await this.sendChanMessages(client, { id: payload.channelId, password: null });
		}
		catch (error) {
			this.server.to(client.id).emit('chatError', error.message);
		}
	}

}
