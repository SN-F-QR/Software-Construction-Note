const SNAKE_SPEED = 5;

const gameBoard = document.getElementById("game-board");
let isGameOver = false;

const main = () => {
  update();
  draw();
  if (isGameOver) {
    alert("Game Over\nPress R to restart");
    clearInterval(gameLoop);
  }
};

let gameLoop = setInterval(main, 1000 / SNAKE_SPEED);

const update = () => {
  console.log("Updating");
  updateSnake();
  updateFood();
  isGameOver = checkGameOver();
};

const draw = () => {
  gameBoard.innerHTML = "";
  drawSnake(gameBoard);
  drawFood(gameBoard);
};

const checkGameOver = () => {
  return snakeOutOfBounds() || snakeIntersectSelf();
};

const resetGame = () => {
  if (!isGameOver) {
    clearInterval(gameLoop);
  }
  console.log("clear");
  isGameOver = false;
  resetSnake();
  resetDirection();

  gameLoop = setInterval(main, 1000 / SNAKE_SPEED);
};
