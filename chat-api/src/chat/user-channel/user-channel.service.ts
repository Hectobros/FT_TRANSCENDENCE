import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { CreateUserChannelDto } from './dto/create-user-channel.dto';
import { UserChannel, Channel, User } from 'db-interface/Core';
import { Logger } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserChannelRole } from 'db-interface/Core';

@Injectable()
export class UserChannelService {

	constructor(
		@InjectRepository(UserChannel)
		private readonly userChannelsRepository: Repository<UserChannel>,
		@InjectRepository(Channel)
		private readonly channelsRepository: Repository<Channel>,
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
	) { }

	private logger: Logger = new Logger('ChannelService');


	async create(createUserChannelDto: CreateUserChannelDto, role?: UserChannelRole) {

		const channel = await this.channelsRepository.findOneBy({ id: createUserChannelDto.channelId });
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);

		const user = await this.usersRepository.findOneBy({ id: createUserChannelDto.userId });
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);

		const toFind = await this.userChannelsRepository.find(
			{
				relations: {
					channel: true,
					user: true,
				},
				where: {
					channel: {
						id: createUserChannelDto.channelId,
					},
					user: {
						id: createUserChannelDto.userId
					}
				},
			})
		if (toFind.length)
			return;

		const userChannel = new UserChannel();
		userChannel.user = user;
		userChannel.channel = channel;
		if (role)
			userChannel.role = role;
		else
			userChannel.role = UserChannelRole.member;
		await this.userChannelsRepository.save(userChannel);
	}

	async findAll() {
		return await this.userChannelsRepository.find();
	}

	async findOne(id: number) {
		const userChannel = await this.userChannelsRepository.findOneBy({ id: id });
		if (!userChannel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
	}

	async findByChanId(chanId: number) {
		const channel = await this.channelsRepository.findOneBy({ id: chanId });
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);

		const userChannels = await this.userChannelsRepository.find(
			{
				relations: {
					channel: true,
					user: true,
				},
				where: {
					channel: {
						id: chanId,
					},
				},
			})
		return userChannels;
	}

	async findByUserAndChan(userId: number, chanId: number) {
		const user = await this.usersRepository.findOneBy({ id: userId });
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);

		const channel = await this.channelsRepository.findOneBy({ id: chanId });
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);

		const userChannels = await this.userChannelsRepository.find(
			{
				relations: {
					channel: true,
					user: true,
				},
				where: {
					channel: {
						id: chanId,
					},
					user: {
						id: userId,
					},
				},
			})
		return userChannels;
	}

	async getAllUsersFromChan(chanId: number) {
		const userChannels = await this.userChannelsRepository.find(
			{
				relations: {
					channel: true,
					user: true,
				},
				where: {
					channel: {
						id: chanId,
					},
				},
			})

		let userList: User[] = [];
		for (let userChannel of userChannels)
			userList.push(userChannel.user)
		return userList
	}

	getAllChansFromUser(user: User) {
		const userChannels = user.userChannels;
		let chansList: Channel[];
		for (let userChannel of userChannels)
			chansList.push(userChannel.channel)
		return chansList
	}

	async update(id: number, role?: UserChannelRole, muted = false) {
		const userChannel = await this.userChannelsRepository.findOneBy({ id: id })
		if (!userChannel)
			throw new HttpException('userChannel not found', HttpStatus.NOT_FOUND);
		userChannel.role = role;
		userChannel.muted = muted;
		await this.userChannelsRepository.save(userChannel);
	}

	async remove(id: number) {
		const userChannel = await this.userChannelsRepository.findOneBy({ id: id })
		if (!userChannel)
			throw new HttpException('userChannel not found', HttpStatus.NOT_FOUND);
		await this.userChannelsRepository.delete(id);
	}

}
