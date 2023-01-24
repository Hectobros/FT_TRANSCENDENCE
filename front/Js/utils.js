function Goal(ball, player) {
  ball.reset();
  ball.velocity.x = 0;
  // reset paddle speed
  paddle1.reset();
  paddle2.reset();

  player.GoalAnim.display = true;
  player.GoalSound.play();

  setTimeout(() => {
    player.GoalAnim.display = false;
  }, 2000);

  setTimeout(() => {
    if (gameState === "On") {
      player.GoalSound.pause();
      player.GoalSound.currentTime = 0;
      player === paddle1 ? (ball.velocity.x = 5) : (ball.velocity.x = -5);
    }
  }, 3000);
}
