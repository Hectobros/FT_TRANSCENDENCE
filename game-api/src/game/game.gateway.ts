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

import { Position } from './game_interface';
import { GameService } from './game.service';
import { makeid, generateUUID } from './utils';
import { Sprite } from './gameClass';
import { fips } from 'crypto';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { UserService } from 'src/user/user.service';
import { MatchService } from 'src/match/match.service';
import { MatchStatus, User, UserStatus } from 'db-interface/Core';

import { UsePipes } from '@nestjs/common';
import { WSPipe } from 'src/exception/websockets/ws-exception-filter'

@UsePipes(WSPipe)
@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private gameService: GameService,
		private userService: UserService,
		private matchService: MatchService) { }

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('GameGateway');

	state = {};
	clientRooms = {};
	openRooms: string[] = [];

	stateCustom = {};
	clientRoomsCustom = {};
	openRoomsCustom: string[] = [];



	async updateStatus(userLogin: string, status: UserStatus) {
		const user: User = await this.userService.getUserByLogin(userLogin);
		this.userService.updateUserStatus(user, status)
		this.server.emit('userStatus', { login: user.login, status: user.status });
	}

	async sendLiveMatches() {
		const matches = await this.matchService.findLiveMatches();
		await this.server.emit('liveMatches', matches);
	}

	updateLiveMatches() {
		this.server.emit('updateLiveMatches', { id: 0 });
	}

	@SubscribeMessage('MovePaddleToServer')
	async handlePaddle(client: Socket, instruction: any): Promise<void> {

		if (typeof instruction != 'string')
			return;
		// if (instruction != 'up' && instruction != 'down')
		// 	return;

		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);
			if (this.state[this.clientRooms[user.login]]) {
				if (user.login === this.state[this.clientRooms[user.login]].game_data.idPlayers.player1) {
					this.state[this.clientRooms[user.login]].movementPaddle(this.state[this.clientRooms[user.login]].game_data.paddle1, instruction);
					this.server.to(this.clientRooms[user.login]).emit(`paddle1ToClient`, this.state[this.clientRooms[user.login]].game_data);
				} else if (user.login === this.state[this.clientRooms[user.login]].game_data.idPlayers.player2) {
					this.state[this.clientRooms[user.login]].movementPaddle(this.state[this.clientRooms[user.login]].game_data.paddle2, instruction);
					this.server.to(this.clientRooms[user.login]).emit(`paddle2ToClient`, this.state[this.clientRooms[user.login]].game_data);
				}
			} else if (this.stateCustom[this.clientRoomsCustom[user.login]]) {
				if (user.login === this.stateCustom[this.clientRoomsCustom[user.login]].game_data.idPlayers.player1) {
					this.server.to(this.clientRoomsCustom[user.login]).emit(`paddle1ToClient`, this.stateCustom[this.clientRoomsCustom[user.login]].game_data);
					this.stateCustom[this.clientRoomsCustom[user.login]].movementPaddle(this.stateCustom[this.clientRoomsCustom[user.login]].game_data.paddle1, instruction);
				} else if (user.login === this.stateCustom[this.clientRoomsCustom[user.login]].game_data.idPlayers.player2) {
					this.server.to(this.clientRoomsCustom[user.login]).emit(`paddle2ToClient`, this.stateCustom[this.clientRoomsCustom[user.login]].game_data);
					this.stateCustom[this.clientRoomsCustom[user.login]].movementPaddle(this.stateCustom[this.clientRoomsCustom[user.login]].game_data.paddle2, instruction);
				}
			}
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}


	}

	@SubscribeMessage('getInfoToServer')
	async GetInfos(client: Socket): Promise<void> {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			if (this.clientRooms[user.login]) {
				if (this.state[this.clientRooms[user.login]]) {
					this.server.to(this.clientRooms[user.login]).emit(`getInfoToClient`, this.state[this.clientRooms[user.login]].game_data);
				}
			} else if (this.clientRoomsCustom[user.login]) {
				if (this.stateCustom[this.clientRoomsCustom[user.login]]) {
					this.server.to(this.clientRoomsCustom[user.login]).emit(`getInfoToClient`, this.stateCustom[this.clientRoomsCustom[user.login]].game_data);
				}
			}
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}

	@SubscribeMessage('newGame')
	async handleNewGame(client: Socket): Promise<void> {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			if (this.clientRooms[user.login]) {
				return;
			}

			let roomName = await this.matchService.generateGameCode();
			this.clientRooms[user.login] = roomName;
			client.emit('gameCode', roomName);

			// create match in db
			const match = await this.matchService.create(user, roomName, false);
			this.updateStatus(user.login, UserStatus.in_game);

			this.state[roomName] = new GameService(this.matchService);

			this.state[roomName].game_data.idPlayers.player1 = user.login;
			this.state[roomName].game_data.idPlayers.userName1 = user.userName;
			client.join(roomName);
			this.server.to(roomName).emit('init', this.state[roomName].game_data.idPlayers);
			this.openRooms.push(roomName);
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}

	@SubscribeMessage('getSizeToServer')
	async GetSize(client: Socket): Promise<void> {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			if (this.state[this.clientRooms[user.login]])
				this.server.to(this.clientRooms[user.login]).emit(`getSizeToClient`, this.state[this.clientRooms[user.login]].game_data);
			else if (this.stateCustom[this.clientRoomsCustom[user.login]]) {
				this.server.to(this.clientRoomsCustom[user.login]).emit(`getSizeToClient`, this.stateCustom[this.clientRoomsCustom[user.login]].game_data);
			}
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}

	@SubscribeMessage('joinGame')
	async handleJoinGame(client: Socket, gameCode: any): Promise<void> {

		if (typeof gameCode != 'string')
			return;

		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			// if game doesn't exist 
			if (!this.state[gameCode]) {
				client.emit('unknownGame', this.clientRooms);
				return;
			}
			// if game is full
			if (this.state[gameCode].game_data.idPlayers.player2 &&
				this.state[gameCode].game_data.idPlayers.player2 != user.login) {
				client.emit('fullGame');
				return;
			}

			this.clientRooms[user.login] = gameCode;
			client.join(gameCode);
			this.state[gameCode].game_data.idPlayers.player2 = user.login;
			this.state[gameCode].game_data.idPlayers.userName2 = user.userName;

			this.server.to(gameCode).emit('init', this.state[gameCode].game_data.idPlayers);
			// client.emit('startGame');
			if (this.state[gameCode].game_data.idPlayers.player1 && this.state[gameCode].game_data.idPlayers.player2) {
				setTimeout(() => {
					this.startGameInterval(client, this.state[gameCode], gameCode, this.clientRooms);
				}, 500);
			}
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}

	@SubscribeMessage('specGame')
	async handleSpecGame(client: Socket, gameCode: any): Promise<void> {

		if (typeof gameCode != 'string')
			return;

		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			if (!this.state[gameCode] && !this.stateCustom[gameCode]) {
				client.emit('unknownGame');
				return;
			}
			if (this.clientRooms[user.login] || this.clientRoomsCustom[user.login]) {
				client.emit('alreadyingame');
				return;
			}
			if (this.state[gameCode]) {
				this.clientRooms[user.login] = gameCode;
				client.join(gameCode);
				this.server.to(gameCode).emit('init', this.state[gameCode].game_data.idPlayers);
			} else if (this.stateCustom[gameCode]) {
				this.clientRoomsCustom[user.login] = gameCode;
				client.join(gameCode);
				this.server.to(gameCode).emit('init', this.stateCustom[gameCode].game_data.idPlayers);
			}
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}


	@SubscribeMessage('InvGame')
	async handleInvGame(client: Socket, gameCode: string): Promise<void> {

		if (typeof gameCode != 'string')
			return;
			
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);
			//----------------------//
			if (!gameCode) {
				return;
			}
			if (this.clientRooms[user.login] || this.clientRoomsCustom[user.login]) {
				//ici
				this.matchService.removeByGameCode(gameCode);
				return;
			}

			const match = await this.matchService.findByGameCode(gameCode);
			await this.matchService.updateMatchStatus(match, MatchStatus.live);
			this.sendLiveMatches();
			this.updateStatus(user.login, UserStatus.in_game);

			if (!this.state[gameCode]) {
				this.clientRooms[user.login] = gameCode;


				this.state[gameCode] = new GameService(this.matchService);

				this.state[gameCode].game_data.idPlayers.player1 = match.playerOne.login;
				this.state[gameCode].game_data.idPlayers.userName1 = match.playerOne.userName;
				client.join(gameCode);
				this.server.to(gameCode).emit('init', this.state[gameCode].game_data.idPlayers);
			}
			else {
				this.clientRooms[user.login] = gameCode;
				client.join(gameCode);
				this.state[gameCode].game_data.idPlayers.player2 = match.playerTwo.login;
				this.state[gameCode].game_data.idPlayers.userName2 = match.playerTwo.userName;


				this.server.to(gameCode).emit('init', this.state[gameCode].game_data.idPlayers);
				this.server.to(gameCode).emit(`startGame`);
				if (this.state[gameCode].game_data.idPlayers.player1 && this.state[gameCode].game_data.idPlayers.player2) {
					setTimeout(() => {
						this.startGameInterval(client, this.state[gameCode], gameCode, this.clientRooms);
					}, 500);
				}
			}
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}

	@SubscribeMessage('findGame')
	async handleFindGame(client: Socket): Promise<void> {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			let gameCode = "";
			if (this.clientRooms[user.login] || this.clientRoomsCustom[user.login]) {
				client.emit('gameOver');
				this.handleReconnectGame(client);
				return;
			}
			if (!this.clientRooms[user.login]) {
				if (!this.openRooms.length) {
					this.handleNewGame(client);
					return;
				}
				if (!this.openRooms[0]) {
					client.emit("errFindGame");
					return;
				}
				gameCode = this.openRooms[0];

				const match = await this.matchService.findByGameCode(gameCode);
				await this.matchService.updateMatchCreation(match, user);
				await this.matchService.updateMatchStatus(match, MatchStatus.live)
				this.updateStatus(user.login, UserStatus.in_game);
				this.sendLiveMatches();

				this.clientRooms[user.login] = gameCode;
				this.state[gameCode].game_data.idPlayers.player2 = user.login;
				this.state[gameCode].game_data.idPlayers.userName2 = user.userName;
				this.openRooms.shift();
				client.join(gameCode);
				this.server.to(gameCode).emit('init', this.state[gameCode].game_data.idPlayers);
				this.server.to(this.clientRooms[user.login]).emit(`startGame`);
				setTimeout(() => {
					this.startGameInterval(client, this.state[gameCode], gameCode, this.clientRooms);
				}, 500);
			} else {

				//reconnect
				gameCode = this.clientRooms[user.login];
				this.updateStatus(user.login, UserStatus.in_game);
				client.join(gameCode);
				this.server.to(gameCode).emit('init', this.state[gameCode].game_data.idPlayers);
				if (this.state[this.clientRooms[user.login]].game_data.gameState === 'on')
					this.server.to(this.clientRooms[user.login]).emit(`startGame`);
			}
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}

	@SubscribeMessage('reconnectGame')
	async handleReconnectGame(client: Socket): Promise<void> {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);
			if (this.clientRooms[user.login]) {
				let gameCode = this.clientRooms[user.login];
				this.updateStatus(user.login, UserStatus.in_game);
				client.join(gameCode);
				this.server.to(gameCode).emit('init', this.state[gameCode].game_data.idPlayers);
				if (this.state[this.clientRooms[user.login]].game_data.gameState === 'on')
					this.server.to(this.clientRooms[user.login]).emit(`startGame`);
			} else if (this.clientRoomsCustom[user.login]) {
				let gameCode = this.clientRoomsCustom[user.login];
				this.updateStatus(user.login, UserStatus.in_game);
				client.join(gameCode);
				this.server.to(gameCode).emit('init', this.stateCustom[gameCode].game_data.idPlayers);
				if (this.stateCustom[this.clientRoomsCustom[user.login]].game_data.gameState === 'on')
					this.server.to(this.clientRoomsCustom[user.login]).emit(`startGame`);
			}

		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}



	async startGameInterval(client, state, gameCode, clientRooms) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);
			this.state[gameCode].game_data.gameState = 'on';
			const intervalID = setInterval(() => {
				const winner = state.gameLoop(state);
				if (!winner) {
					this.server.to(clientRooms[user.login]).emit('gameState', state.game_data);
				}
				else {
					this.server.to(clientRooms[user.login]).emit('gameOver');

					
					if (this.clientRooms[this.state[gameCode].game_data.idPlayers.player1]) {
						this.clientRooms[this.state[gameCode].game_data.idPlayers.player1] = null;
						delete this.clientRooms[this.state[gameCode].game_data.idPlayers.player1];
					}
					if (this.clientRooms[this.state[gameCode].game_data.idPlayers.player2]) {
						this.clientRooms[this.state[gameCode].game_data.idPlayers.player2] = null;
						delete this.clientRooms[this.state[gameCode].game_data.idPlayers.player2];
					}

					for (let login in this.clientRooms)
					{
						if (this.clientRooms[login] === gameCode)
							delete this.clientRooms[login];
					}

					this.matchService.updateFinishedGame2(gameCode, state.game_data.idPlayers, state.game_data.score);

					const login1 = this.state[gameCode].game_data.idPlayers.player1;
					const login2 = this.state[gameCode].game_data.idPlayers.player2;
					this.updateStatus(login1, UserStatus.online);
					this.updateStatus(login2, UserStatus.online);



					if (this.state[gameCode]) {
						delete this.state[gameCode].game_data.ball;
						delete this.state[gameCode].game_data.paddle1;
						delete this.state[gameCode].game_data.paddle2;
						delete this.state[gameCode];
					}
					this.updateLiveMatches();
					clearInterval(intervalID);
				}
			}, 1000 / 60);
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}

	//---------------------------------------------------------------------------

	@SubscribeMessage('newGameCustom')
	async handleNewGameCustom(client: Socket): Promise<void> {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			if (this.clientRoomsCustom[user.login]) {
				return;
			}

			let roomName = await this.matchService.generateGameCode();
			this.clientRoomsCustom[user.login] = roomName;
			client.emit('gameCode', roomName);

			// create match in db
			const match = await this.matchService.create(user, roomName, true);
			this.updateStatus(user.login, UserStatus.in_game);

			this.stateCustom[roomName] = new GameService(this.matchService);

			this.stateCustom[roomName].game_data.mode = "custom";
			this.stateCustom[roomName].game_data.idPlayers.player1 = user.login;
			this.stateCustom[roomName].game_data.idPlayers.userName1 = user.userName;
			client.join(roomName);
			this.server.to(roomName).emit('init', this.stateCustom[roomName].game_data.idPlayers);
			this.openRoomsCustom.push(roomName);
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}

	@SubscribeMessage('findGameCustom')
	async handleFindGameCustom(client: Socket): Promise<void> {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			let gameCode = "";
			if (this.clientRooms[user.login] || this.clientRoomsCustom[user.login]) {
				client.emit('gameOver');
				this.handleReconnectGame(client);
				return;
			}
			if (!this.clientRoomsCustom[user.login]) {
				if (!this.openRoomsCustom.length) {
					this.handleNewGameCustom(client);
					return;
				}
				if (!this.openRoomsCustom[0]) {
					client.emit("errFindGame");
					return;
				}
				gameCode = this.openRoomsCustom[0];

				const match = await this.matchService.findByGameCode(gameCode);
				await this.matchService.updateMatchCreation(match, user);
				await this.matchService.updateMatchStatus(match, MatchStatus.live)
				this.updateStatus(user.login, UserStatus.in_game);
				this.sendLiveMatches();

				this.clientRoomsCustom[user.login] = gameCode;
				this.stateCustom[gameCode].game_data.idPlayers.player2 = user.login;
				this.stateCustom[gameCode].game_data.idPlayers.userName2 = user.userName;
				this.openRoomsCustom.shift();
				client.join(gameCode);
				this.server.to(gameCode).emit('init', this.stateCustom[gameCode].game_data.idPlayers);
				this.server.to(this.clientRoomsCustom[user.login]).emit(`startGame`);
				setTimeout(() => {
					this.startGameIntervalCustom(client, this.stateCustom[gameCode], gameCode, this.clientRoomsCustom);
				}, 500);
			} else {

				//reconnect
				gameCode = this.clientRoomsCustom[user.login];
				this.updateStatus(user.login, UserStatus.in_game);
				client.join(gameCode);
				this.server.to(gameCode).emit('init', this.stateCustom[gameCode].game_data.idPlayers);
				if (this.stateCustom[this.clientRoomsCustom[user.login]].game_data.gameState === 'on')
					this.server.to(this.clientRoomsCustom[user.login]).emit(`startGame`);
			}
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}

	async startGameIntervalCustom(client, state, gameCode, clientRooms) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);
			this.stateCustom[gameCode].game_data.gameState = 'on';
			const intervalID = setInterval(() => {
				const winner = state.gameLoop(state);
				if (!winner) {
					this.server.to(clientRooms[user.login]).emit('gameState', state.game_data);
				}
				else {
					this.server.to(clientRooms[user.login]).emit('gameOver');

					if (this.clientRoomsCustom[this.stateCustom[gameCode].game_data.idPlayers.player1]) {
						this.clientRoomsCustom[this.stateCustom[gameCode].game_data.idPlayers.player1] = null;
						delete this.clientRoomsCustom[this.stateCustom[gameCode].game_data.idPlayers.player1];
					}
					if (this.clientRoomsCustom[this.stateCustom[gameCode].game_data.idPlayers.player2]) {
						this.clientRoomsCustom[this.stateCustom[gameCode].game_data.idPlayers.player2] = null;
						delete this.clientRoomsCustom[this.stateCustom[gameCode].game_data.idPlayers.player2];
					}

					for (let login in this.clientRoomsCustom)
					{
						if (this.clientRoomsCustom[login] === gameCode)
							delete this.clientRoomsCustom[login];
					}

					this.matchService.updateFinishedGame2(gameCode, state.game_data.idPlayers, state.game_data.score);

					const login1 = this.stateCustom[gameCode].game_data.idPlayers.player1;
					const login2 = this.stateCustom[gameCode].game_data.idPlayers.player2;
					this.updateStatus(login1, UserStatus.online);
					this.updateStatus(login2, UserStatus.online);



					if (this.stateCustom[gameCode]) {
						delete this.stateCustom[gameCode].game_data.ball;
						delete this.stateCustom[gameCode].game_data.paddle1;
						delete this.stateCustom[gameCode].game_data.paddle2;
						delete this.stateCustom[gameCode];
					}
					this.updateLiveMatches();
					clearInterval(intervalID);
				}
			}, 1000 / 60);
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}


	///-------------------connection----------------------------------------------------

	async handleConnection(client: Socket, ...args: any[]) {
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);
			this.userService.updateUserSocket(user, client.id);
			this.logger.log(`connexion[${client.id}][${user.login}]`);
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}

		this.server.emit(`gameData`, this.gameService.game_data);
		this.server.emit(`positionToClient`, this.gameService.game_data);
	}

	async handleDisconnect(client: Socket, ...args: any[]) {
		
		
		// console.log("[clientRoom]",this.clientRooms);
		// console.log("[clientRoomCustom]",this.clientRoomsCustom);
		// console.log("[state]",this.state)
		// console.log("[stateCustom]", this.stateCustom)
		this.logger.log(`disconnexion[${client.id}]`);
		try {
			const token = client.handshake.auth.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			if (this.clientRoomsCustom[user.login])
				var tmpCustom = this.clientRoomsCustom[user.login];
			if (this.clientRooms[user.login])
				var tmp = this.clientRooms[user.login];
						

			
			if (tmp && this.state[tmp] && this.state[tmp].game_data.gameState === 'off') {
				this.clientRooms[this.state[tmp].game_data.idPlayers.player1] = null;
				delete this.clientRooms[this.state[tmp].game_data.idPlayers.player1];
				this.state[tmp] = null;
				delete this.state[tmp];
				const index = this.openRooms.indexOf(tmp);
				if (index > -1) { // only splice array when item is found
					this.openRooms.splice(index, 1); // 2nd parameter means remove one item only
				}
				// remove empty deleted match
				this.matchService.removeByGameCode(tmp);
				this.updateStatus(user.login, UserStatus.online);
			}
			else if (tmpCustom && this.stateCustom[tmpCustom] && this.stateCustom[tmpCustom].game_data.gameState === 'off' ) {
				
				this.clientRoomsCustom[this.stateCustom[tmpCustom].game_data.idPlayers.player1] = null;
				delete this.clientRoomsCustom[this.stateCustom[tmpCustom].game_data.idPlayers.player1];
				this.stateCustom[tmpCustom] = null;
				delete this.stateCustom[tmpCustom];
				const index = this.openRoomsCustom.indexOf(tmpCustom);
				if (index > -1) { // only splice array when item is found
					this.openRoomsCustom.splice(index, 1); // 2nd parameter means remove one item only
				}
				// remove empty deleted match
				this.matchService.removeByGameCode(tmpCustom);
				this.updateStatus(user.login, UserStatus.online);
			}
			
			if (this.clientRooms[user.login]) {
				if (this.state[this.clientRooms[user.login]].game_data.idPlayers.player1 != user.login && this.state[this.clientRooms[user.login]].game_data.idPlayers.player2 != user.login) {
					delete this.clientRooms[user.login];
				}
			} else if (this.clientRoomsCustom[user.login]) {
				if (this.stateCustom[this.clientRoomsCustom[user.login]].game_data.idPlayers.player1 != user.login && this.stateCustom[this.clientRoomsCustom[user.login]].game_data.idPlayers.player2 != user.login) {
					delete this.clientRoomsCustom[user.login];
				}
			}
		}
		catch (error) {
			this.server.to(client.id).emit('gameError', error.message);
			client.disconnect();
		}
	}

	afterInit(server: Server) { }
}
