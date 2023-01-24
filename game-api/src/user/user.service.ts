import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { User, UserStatus } from 'db-interface/Core';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

import { IToken } from '../interface/token.interface';

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
		private readonly jwtService: JwtService
	  ) {}

	private logger: Logger = new Logger('UserService(Game)');

	checkToken(token: any)
	{
		if (typeof token != "string")
			throw new HttpException(`Invalid token type`, HttpStatus.FORBIDDEN);
		let validated;
		try {
			validated = this.jwtService.verify(token);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.FORBIDDEN);
		}
		if (!validated)
			throw new HttpException(`Invalid token`, HttpStatus.FORBIDDEN);
		return validated;
	}

	async getUserByToken(token: string)
	{ 
		const decoded = this.jwtService.decode(token) as IToken;
		const users = await this.usersRepository.find({
			relations: { stats: true },
			where: { login: decoded.login }
		});
		if (users.length == 0)
			throw new HttpException(`User ${decoded.login} not found`, HttpStatus.NOT_FOUND);
		return users[0];
	}

	async getUserByLogin(login: string)
	{ 
		const user = await this.usersRepository.findOneBy({ login: login });
		if (!user)
			throw new HttpException(`User ${login} not found`, HttpStatus.NOT_FOUND);
		return user
	}

	async updateUserSocket(user: User, socketId: string)
	{
		user.gameSocketId = socketId;
		this.usersRepository.save(user);
	}

	async updateUserStatus(user: User, status: UserStatus)
	{
		user.status = status;
		await this.usersRepository.save(user);
	}
}
