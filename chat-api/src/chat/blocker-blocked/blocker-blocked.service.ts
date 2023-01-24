import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockerBlocked, User } from 'db-interface/Core';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class BlockerBlockedService {

	constructor(
		@InjectRepository(BlockerBlocked)
		private readonly blockerBlockedRepository: Repository<BlockerBlocked>,
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>
	) {}

	private logger: Logger = new Logger('BlockerBlocked');

	async create(blocker: User, blocked: User) {
		const found = await this.blockerBlockedRepository.find(
			{
				relations: {
					blocker: true,
					blocked: true,
				},
				where: {
					blocker: {
						id: blocker.id,
					},
					blocked: {
						id: blocked.id,
					},
				},
			}
		)
		if (found.length > 0)
			throw new HttpException(`${blocked.login} is already blocked by ${blocker.login}`, HttpStatus.NOT_FOUND);

		const blockerblocked = new BlockerBlocked;
		blockerblocked.blocker = blocker;
		blockerblocked.blocked = blocked;
		await this.blockerBlockedRepository.save(blockerblocked);
	}

	async findByBlockerAndBlocked(blocker: User, blocked: User) {
		const found = await this.blockerBlockedRepository.find(
			{
				relations: {
					blocker: true,
					blocked: true,
				},
				where: {
					blocker: {
						id: blocker.id,
					},
					blocked: {
						id: blocked.id,
					},
				},
			}
		)
		if (found.length == 0)
			throw new HttpException(`${blocked.login} is not blocked by ${blocker.login}`, HttpStatus.NOT_FOUND);
		return found;
	}
	
	async isBlockedBy(user: User, blocker: User): Promise<boolean>
	{
		const found = await this.blockerBlockedRepository.find(
			{
				relations: {
					blocker: true,
					blocked: true,
				},
				where: {
					blocker: {
						id: blocker.id,
					},
					blocked: {
						id: user.id,
					},
				},
			}
		)
		return (found.length > 0)
	}

	async userBlockList(user: User)
	{
		const found = await this.blockerBlockedRepository.find(
			{
				relations: {
					blocked: true,
				},
				where: {
					blocker: {
						id: user.id,
					},
				},
			}
		)
		return found;
	}

	async remove(id: number) {
		const bannedChannel = await this.blockerBlockedRepository.findOneBy({ id: id })
		if (!bannedChannel)
			throw new HttpException('blockerBlocked not found', HttpStatus.NOT_FOUND);
		await this.blockerBlockedRepository.delete(id);
	}

}
