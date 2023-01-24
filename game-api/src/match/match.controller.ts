import { Controller } from '@nestjs/common';
import { Post, Get, Body, Param, ValidationPipe, Headers } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { MatchStatus, UserStatus } from 'db-interface/Core';

import { UserService } from 'src/user/user.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { GetMatchesDto } from './dto/get-matches.dto';
import { MatchService } from './match.service';

import { generateUUID } from 'src/game/utils';
import { AcceptMatchDto } from './dto/accept-match.dto';

@Controller('match')
export class MatchController {

	constructor(
		private macthService: MatchService,
		private userService: UserService,
	) { }

	@Get('/game/:gameCode')
	async getOne(@Param('gameCode') gameCode: string) {
		return await this.macthService.findByGameCode(gameCode);
	}


	@Get('/getGame')
	async getGame(@Headers('token') token: string) {
		let user;
		try {
			this.userService.checkToken(token);
			user = await this.userService.getUserByToken(token);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.FORBIDDEN);
		}
		const res = await this.macthService.getGame(user);
		return res;
	}


	@Get('/isingame')
	async isInGame(@Headers('token') token: string) {
		let user;
		try {
			this.userService.checkToken(token);
			user = await this.userService.getUserByToken(token);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.FORBIDDEN);
		}
		const res = await this.macthService.isInGame(user);
		return { isInGame: res };
	}

	@Get('/isingame/:login')
	async isUserInGame(@Param('login') login: string, @Headers('token') token: string) {
		try {
			this.userService.checkToken(token);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.FORBIDDEN);
		}
		const player = await this.userService.getUserByLogin(login);
		const res = await this.macthService.isPlayerInGame(player);
		return res;
	}

	@Get('/history/:login')
	async getMatchHistory(@Param('login') login: string, @Headers('token') token: string) {

		try {
			this.userService.checkToken(token);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.FORBIDDEN);
		}
		const user = await this.userService.getUserByLogin(login);
		return await this.macthService.getUserMatchHistory(user);
	}

	@Get('/live')
	async getLiveMatches(@Headers('token') token: string) {
		try {
			this.userService.checkToken(token);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.FORBIDDEN);
		}
		return await this.macthService.findLiveMatches();
	}

	@Post('/create')
	async createMatch(@Body() body: CreateMatchDto) {
		const token = body.token;
		let userOne;
		try {
			this.userService.checkToken(token);
			userOne = await this.userService.getUserByToken(token);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.FORBIDDEN);
		}
		if (userOne.status == UserStatus.offline)
			throw new HttpException(`You cannot create game if you are offline`, HttpStatus.FORBIDDEN);

		const userTwo = await this.userService.getUserByLogin(body.login);
		if (userTwo.status == UserStatus.offline)
			throw new HttpException(`${userTwo.login} is offline`, HttpStatus.FORBIDDEN);

		let currentMatches = await this.macthService.findCurrentMatchesByUser(userOne);
		if (currentMatches.length != 0)
			throw new HttpException(`You have already one match in live, pending or invited. Finish it before !`, HttpStatus.FORBIDDEN);

		currentMatches = await this.macthService.findCurrentMatchesByUser(userTwo);
		if (currentMatches.length != 0)
			throw new HttpException(`${userTwo.login} have already one match in live, pending or invited`, HttpStatus.FORBIDDEN);

		const gameCode = await this.macthService.generateGameCode();
		const custom = body.custom;
		let match = await this.macthService.create(userOne, gameCode, custom);
		await this.macthService.updateMatchCreation(match, userTwo);
		await this.macthService.updateMatchStatus(match, MatchStatus.requested);
		return match;
	}

	@Post('/accept')
	async acceptMatch(@Body() body: AcceptMatchDto) {
		const token = body.token;
		let userTwo;
		try {
			this.userService.checkToken(token);
			userTwo = await this.userService.getUserByToken(token);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.FORBIDDEN);
		}
		let match = await this.macthService.findByGameCode(body.gameCode);

		if (match.playerTwo != userTwo) {
			await this.macthService.removeByGameCode(body.gameCode)
			throw new HttpException(`${userTwo.login} is not invited at this match`, HttpStatus.FORBIDDEN);
		}

		if (userTwo.status == UserStatus.offline) {
			await this.macthService.removeByGameCode(body.gameCode)
			throw new HttpException(`${userTwo.login} is offline`, HttpStatus.FORBIDDEN);
		}
		if (match.playerOne.status == UserStatus.offline) {
			await this.macthService.removeByGameCode(body.gameCode)
			throw new HttpException(`${match.playerOne.login} is offline`, HttpStatus.FORBIDDEN);
		}

		if (body.accepted == true) {
			await this.macthService.updateMatchStatus(match, MatchStatus.live)
			return match;
		}
		else {
			await this.macthService.removeByGameCode(body.gameCode)
			throw new HttpException(`${userTwo.login} has refused the invitation`, HttpStatus.NOT_ACCEPTABLE);
		}
	}

}
