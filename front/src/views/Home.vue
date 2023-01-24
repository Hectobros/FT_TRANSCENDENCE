<template>
  <div id="background_game" className="absolute flex justify-center h-full w-full overflow-auto">
    <div style="width: 100%; height: 100%">
    <div id="app" class="container" style="width: 100%; justify-content: center;"></div>
    <div id="initialScreen" style="display: none;">
        <div style="margin: 0%; width: 100%; justify-content: center; align-items: center; flex-direction: column; position: relative; display: flex;">
          <div style="margin: 2vh;">
            <button class="btn-1" id = "findGameBtn">Play Normal Mode  </button>
          </div>
          <div style="margin: 2vh;">
            <button class="btn-1" id = "findGameCustomBtn" style="top: 60%;" >Play Custom Mode</button>
          </div>
        </div>
			</div>
			<div class="queueScreen" id="queueScreen" >
				In Queue . . .
			</div>
			<div id= "gameScreen" style="width: 100%;">
				<!-- width and height SHOULD BE SET DYNAMICALLY -->
				<div class = 'ui' style="position: relative; display: flex; width: 60%;">
					<div class='player_1_name'> <span id ="NamePlayer1" class='textInBox'>Joueur 1</span></div>
					<!-- player 1 score -->
					<div class='player_score' style="border-top-right-radius: 5px;border-bottom-right-radius: 5px;border-left-width: 0px;"><span id="score_1" class='textInBox'> 0 </span></div>
          <!-- blank space -->
          <div style="width: 5%;"></div>
					<!-- player 2 score -->
					<div class='player_score' style="border-top-left-radius: 5px;border-bottom-left-radius: 5px;border-right-width: 0px;"><span id="score_2" class='textInBox'> 0 </span></div>
					<!-- player 2 name -->
					<div class='player_2_name'> <span id ="NamePlayer2" class='textInBox'>Joueur 2 </span></div>
				</div>
				<div>
					<canvas ref="convas"
							id="board"
							width="640"
							height="480"
							class="board"
							style="border: 1px solid black ;" >
					</canvas>
        </div>
			</div>
	</div>

  </div>
</template>

<script>
//fix background color
import io from 'socket.io-client';
import {Sprite, ball, paddle } from "../frontJS/game.js"
let f;
export default {
  name: 'gameComp',
  data() {
    return {
      title: 'BLOCK GAME',
      socket: {},
      context: {},
      board: {},
      square: {},
      position: {},
      background: {},
      paddle1: {},
      paddle2: {},
      ball: {},
      score1: {},
      score2: {},

      then: {},
      now: {},
      elapsed: {},
      startTime: {},
      fpsInterval: {},

      gameCodeDisplay: {},
      gameScreen: {},
      queueScreen: {},
      initialScreen: {},
      newGameBtn: {},
      joinGameBtn: {},
      NamePlayer1: {},
      NamePlayer2: {},
      findGameBtn: {},
      findGameCustomBtn: {},
      returnGameBtn: {},
    };
  },
  methods: {
    newGame() {
      this.socket.emit('newGame');
      this.startAnimating(60);
    },/*
    specGame() {
      const code = SpecGameCodeInput.value;
      this.socket.emit('specGame', code);
      this.startAnimating(60);
    },*/
    findGame() {
      this.socket.emit('findGame');
      this.setScreen("queue");
    },
    findGameCustom() {
      this.socket.emit('findGameCustom');
      this.setScreen("queue");
    },
    reset() {
      this.setScreen("initial");
    },
    leaveGame() {
      this.setScreen("initial");
      this.socket.emit('leaveGame');
    },
    startAnimating(fps) {
      this.setScreen("game");
      // this.initialScreen.style.display = 'none';
      // this.queueScreen.style.display = 'block';
      // this.gameScreen.style.display = 'none';

      this.fpsInterval = 1000 / fps;
      this.then = Date.now();
      this.startTime = this.then;

      this.getSizeToServe();

      // this.background.imageSrc = require('../assets/game/SpaceBackground.png');
      // this.background.update(this.context);
      this.game();
    },
    setScreen(State) {
      switch (State) {
        case "initial":
        this.initialScreen.style.display = 'block';
        this.queueScreen.style.display = 'none';
        this.gameScreen.style.display = 'none';
          break;
        case "queue":
        this.initialScreen.style.display = 'none';
        this.queueScreen.style.display = 'block';
        this.gameScreen.style.display = 'none';
          break;
        case "game":
        this.initialScreen.style.display = 'none';
        this.queueScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
          break;
        default:
          break;
      }
    },
    game() {
      window.requestAnimationFrame(this.game);

      this.now = Date.now();
      this.elapsed = this.now - this.then;

      if (this.elapsed > this.fpsInterval) {
        // Get ready for next frame by setting this.then=this.now, but also adjust for your
        // specified this.fpsInterval not being a multiple of RAF's interval (16.7ms)
        this.then = this.now - (this.elapsed % this.fpsInterval);

        // Put your drawing code here
        //this.getSizeToServe();
        this.context.clearRect(0, 0, this.board.width, this.board.height);
        this.context.fillStyle = '#000000';
        this.context.fillRect(0, 0, this.board.width, this.board.height);
        // this.background.draw(this.context);
        this.context.fillStyle = '#FFFFFF';
        this.context.fillRect(this.ball.position.x, this.ball.position.y, this.ball.width, this.ball.height);
        // this.ball.update(this.context);
        // this.paddle1.draw(this.context);
        this.context.fillRect(this.paddle1.position.x, this.paddle1.position.y, this.paddle1.width, this.paddle1.height);
        // this.paddle2.draw(this.context);
        this.context.fillRect(this.paddle2.position.x, this.paddle2.position.y, this.paddle2.width, this.paddle2.height);
      }
    },
    sendInstruction(instruction) {
      this.socket.emit('positionToServer', instruction);
    },
    sendPaddleMove(instruction) {
      this.socket.emit('MovePaddleToServer', instruction);
    },
    // getInfo() {
    //   this.socket.emit('getInfoToServer');
    // },
    getSizeToServe() {
      this.socket.emit('getSizeToServer');
    },
    sendCode()
    {
      this.socket.emit('InvGame', this.gamesecret);
    },
    reconnectGame()
    {
      this.socket.emit('reconnectGame');
    }
  },
  
  unmounted() {
    this.socket.disconnect();
    window.removeEventListener('keydown', f)
  },
  created() {
    const authPayload = { auth: { token: this.$cookies.get("trans_access") } };
    this.socket = io("http://" + process.env.VUE_APP_IP + ":3005", authPayload);
 
    window.addEventListener('keydown', f = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          this.sendPaddleMove('up');
          break;
        case 'ArrowDown':
          this.sendPaddleMove('down');
          break;
      }
    });
  },
  mounted() {
    this.queueScreen = document.getElementById('queueScreen');
    this.initialScreen = document.getElementById('initialScreen');
    this.gameScreen = document.getElementById('gameScreen');
    // this.newGameBtn = document.getElementById('newGameBtn');
    // this.specGameBtn = document.getElementById('specGameBtn');
    this.NamePlayer1 = document.getElementById('NamePlayer1');
    this.NamePlayer2 = document.getElementById('NamePlayer2');
    this.findGameBtn = document.getElementById('findGameBtn');
    this.findGameCustomBtn = document.getElementById('findGameCustomBtn');

    this.setScreen("initial");
    // this.newGameBtn.addEventListener('click', this.newGame);
    

    // ----------------------------------------------
    this.socket.on(`test`, (data) => {
      this.test();
    });

    // this.socket.on(`errFindGame`, (data) => {
    // });

    this.socket.on(`init`, (data) => {
      this.NamePlayer1.innerText = data.userName1;
      this.NamePlayer2.innerText = data.userName2;
    });
    this.socket.on(`gameData`, (data) => {
      this.canvas = data.canvas;
    });
    this.socket.on('gameCode', (gameCode) => {
      this.gameCodeDisplay.innerText = gameCode;
    });
    
    this.score1 = document.getElementById('score_1');
    this.score2 = document.getElementById('score_2');
    this.board = document.getElementById('board');

    var heightRatio = 0.75;
    this.board.height = this.board.width * heightRatio;
    this.context = this.board.getContext('2d');

    // this.socket.on(`paddle1ToClient`, (data) => {
    // });
    // this.socket.on(`getInfoToClient`, (data) => {
    //   this.paddle1.position = data.paddle1.position;
    //   this.paddle2.position = data.paddle2.position;
    //   this.ball.position = data.ball.position;
    // });

    this.socket.on(`gameState`, (data) => {
      this.paddle1.position = data.paddle1.position;
      this.paddle2.position = data.paddle2.position;
      this.paddle1.height = data.paddle1.height;
      this.paddle2.height = data.paddle2.height;
      this.ball.position = data.ball.position;
      this.score1.innerText = data.score.player1;
      this.score2.innerText = data.score.player2;
    });

    this.socket.on('gameOver', (data) => {
      this.reset();
      this.$router.push('/home');
      // alert('you loose ?');
    });

    this.socket.on('getSizeToClient', (data) => {
      this.paddle1.width = data.paddle1.width;
      this.paddle1.height = data.paddle1.height;
      this.paddle2.width = data.paddle2.width;
      this.paddle2.height = data.paddle2.height;
      this.ball.width = data.ball.width;
      this.ball.height = data.ball.height;
    });

    this.socket.on('unknownGame', (data) => {
      this.reset();
    });

    this.socket.on('startGame', (data) => {
      // this.setScreen("game");
      this.startAnimating(60);
    });

    this.socket.on('startGameCustom', (data) => {
      // this.setScreen("game");
      this.startAnimating(60);
    });

    this.socket.on('fullGame', (data) => {
      // this.returnGameBtn.style.display = 'block';
      this.reset();
      // alert('you loose ?');
    });

    this.background = new Sprite({
      position: {
        x: 0,
        y: 0,
      },
      width: this.board.width,
      height: this.board.height,
      ctx: this.context,
    });

    this.paddle1 = new paddle({
      position: {
        x: 0,
        y: 0,
      },
      canvas: this.board,
    });

    this.paddle2 = new paddle({
      position: {
        x: this.board.width - parseInt(this.board.width / 34, 10),
        y: 0,
      },
      canvas: this.board,
    });

    this.ball = new ball({
      position: {
        x: (this.board.width - parseInt(this.board.height / 19.2, 10)) / 2,
        y: (this.board.height - parseInt(this.board.height / 19.2, 10)) / 2,
      },
      velocity: {
        x: 0,
        y: 0,
      },
      coord: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      width: parseInt(this.board.height / 19.2, 10),
      height: parseInt(this.board.height / 19.2, 10),
      speed: 4,
      framesMax: 10,
    });

    this.getSizeToServe();
    
    if ( this.$route?.params.id )
    {
      this.socket.emit('InvGame', this.$route?.params.id);
    }
    else
      this.reconnectGame();

    this.findGameCustomBtn.addEventListener('click', this.findGameCustom);
    this.findGameBtn.addEventListener('click', this.findGame);
  },
};
</script>

<style>
    @import '../assets/css/style.css';
    @import '../assets/css/boutton.css';
</style>
