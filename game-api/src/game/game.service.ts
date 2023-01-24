import { ConsoleLogger, Injectable } from '@nestjs/common';

import { Position, Dimension } from './game_interface';

import { Sprite, paddle, ball } from './gameClass';
import { MatchService } from 'src/match/match.service';

@Injectable()
export class GameService 
{
	constructor(private matchService: MatchService) {}

	game_data =
	{
		gameState: 'off',
		score:
		{
			player1: 0,
			player2: 0,
		},
		idPlayers:
		{
			player1: 0,
			userName1: 0,
			player2: 0,
			userName2: 0,
		},
		canvas:
		{
			width: 640,
			height: 480
		},
		mode: 0,
		paddle1 : new paddle({
			width: 15,
			height: 160,
			position: {
				x: 10,
				y: 200,
			},
			canvasDim: {
				width: 640,
				height: 480
			}
		}),
		paddle2 : new paddle({
			width: 15,
			height: 160,
			position: {
				x: 640 - 25,
				y: 200,
			},
			canvasDim: {
				width: 640,
				height: 480
			}
		}),
		ball : new ball({
			width: 15,
			height: 15,
			position: {
				x: 640/2,
				y: 480/2
			},
			velocity: {
				x: 5,
				y: 0
			},
			speed: 3,
			canvasDim: {
				width: 640,
				height: 480
			}
		}),
	}

	movementPaddle(paddle: paddle, instruction: string) {
		switch (instruction) {
			case "up":
				paddle.velocity.y = -20;
			// this.game_data.paddle1.move();
					break;
			case "down":
				paddle.velocity.y = 20;
				// this.game_data.paddle1.move();
					break;
		}
	}


	gameLoop(state) {
		let ret;
		// console.log(this.game_data.ball.position);
		// this.game_data.paddle1.update();
		state.game_data.paddle1.update();
		state.game_data.paddle2.update();
		ret = state.game_data.ball.update(state.game_data.paddle1, state.game_data.paddle2);
		if (ret === 2){
			state.game_data.score.player1 += 1;
			if (state.game_data.mode === "custom")
				state.game_data.paddle1.height = state.game_data.paddle1.height * 0.8;
			ret = 0;
		} else if (ret === 1) {
			state.game_data.score.player2 += 1;
			if (state.game_data.mode === "custom")
				state.game_data.paddle2.height = state.game_data.paddle2.height * 0.8;
			ret = 0;
		}
		if (state.game_data.score.player1 > 5) {
			return (1);
		} else if (state.game_data.score.player2 > 5) {
			return (2);
		}
		// console.log(this.game_data.score);
	}
}
