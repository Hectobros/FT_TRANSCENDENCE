import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { BannedChan, Channel, Message, User } from 'db-interface/Core';

@Injectable()
export class BannedChanService {
	constructor(
		@InjectRepository(BannedChan)
		private readonly bannedChansRepository: Repository<BannedChan>,
		@InjectRepository(Channel)
		private readonly channelsRepository: Repository<Channel>,
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
	) { }

	private logger: Logger = new Logger('BannedChanService');

	async create(userId: number, channelId: number, expirationDate: number = null) {

		const channel = await this.channelsRepository.findOneBy({ id: channelId });
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		const user = await this.usersRepository.findOneBy({ id: userId });
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);

		const bannedChans = await this.bannedChansRepository.find(
			{
				relations: {
					channel: true,
					user: true,
				},
				where: {
					channel: {
						id: channelId,
					},
					user: {
						id: userId,
					},
				},
			})
		if (bannedChans.length != 0)
			throw new HttpException(`user ${bannedChans[0].user.login} is already ban fron ${bannedChans[0].channel.name} until ${bannedChans[0].expirationDate}`
				, HttpStatus.FORBIDDEN);
		let bannedChan = new BannedChan;
		bannedChan.channel = channel;
		bannedChan.user = user;
		bannedChan.expirationDate = expirationDate;
		this.bannedChansRepository.save(bannedChan);
	}


	async findByUserAndChan(userId: number, chanId: number) {
		const user = await this.usersRepository.findOneBy({ id: userId });
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		const channel = await this.channelsRepository.findOneBy({ id: chanId });
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);

		const bannedChans = await this.bannedChansRepository.find(
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
		return bannedChans;
	}

	async isExpiredBanForUserInChan?(userId: number, chanId: number): Promise<boolean> {
		const user = await this.usersRepository.findOneBy({ id: userId });
		if (!user)
			return false;
		const channel = await this.channelsRepository.findOneBy({ id: chanId });
		if (!channel)
			return false;
		const bannedChans = await this.bannedChansRepository.find(
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
		if (bannedChans.length == 0)
			return false;
		const bannedChan = bannedChans[0];
		if (bannedChan.expirationDate != null)
			return false;
		if (bannedChan.expirationDate < Date.now())
			return false;
		return true;
	}

	async isExpiredBan?(bannedUserId: number): Promise<boolean> {
		const bannedChan = await this.bannedChansRepository.findOneBy({ id: bannedUserId });
		if (!bannedChan)
			return false;
		if (bannedChan.expirationDate < Date.now())
			return false;
		return true;
	}

	async bannedChanGuard(userId: number, chanId: number, allowed: boolean = false) 
	{
		const bannedChans = await this.findByUserAndChan(userId, chanId);
		if (bannedChans.length == 0)
			return;
		const bannedChan = bannedChans[0];

		if (!allowed && bannedChan.expirationDate == null)
			throw new HttpException(`user ${bannedChan.user.login} is banned from ${bannedChan.channel.name}`, HttpStatus.FORBIDDEN);
		if (!allowed && bannedChan.expirationDate > Date.now())
		{
			let delay = (bannedChan.expirationDate - Date.now()) / 60000;
			let unit = 'minutes';
			if (delay < 1)
			{
				delay *= 60;
				unit = 'seconds'
			}
			delay = Math.trunc(delay);
			throw new HttpException(`user ${bannedChan.user.login} is banned from ${bannedChan.channel.name} for ${delay} ${unit}`, HttpStatus.FORBIDDEN);
		}
		else
			this.remove(bannedChan.id);
	}

	async remove(id: number) {
		const bannedChannel = await this.bannedChansRepository.findOneBy({ id: id })
		if (!bannedChannel)
			throw new HttpException('bannedChannel not found', HttpStatus.NOT_FOUND);
		await this.bannedChansRepository.delete(id);
	}
}
