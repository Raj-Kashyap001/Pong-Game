import Ball from "./Ball.js";
import Paddle from "./Paddle.js";

const canvas = document.querySelector("#canvas");
const playerScore = document.querySelector("#playerOneScore");
const computerScore = document.querySelector("#computerScore");
const touchBtns = document.querySelector("#touchButtons");
const upButton = document.querySelector("#upButton");
const downButton = document.querySelector("#downButton");
const rotationNotificationElm = document.querySelector(
  ".orientation-notification"
);
const pauseButton = document.querySelector(".pause-btn");
const resumeButton = document.querySelector(".resume-btn");
const resetButton = document.querySelector(".reset-btn");

canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext("2d");

const keys = {};

let initialBallVelocity = 7;
let initialRightPaddleVelocity = 7;

const ball = new Ball(200, 200, 10, initialBallVelocity, initialBallVelocity);
const paddleLeft = new Paddle(10, canvas.height / 2, 90, 10, 10);
const paddleRight = new Paddle(
  canvas.width - 20,
  canvas.height / 2,
  90,
  10,
  initialRightPaddleVelocity
);

//Audio Imports
const collisionSound = new Audio();
collisionSound.src = "./sounds/ball-bounce.wav";
const wooshSound = new Audio();
wooshSound.src = "./sounds/whoosh.mp3";

let upBottonPressed = false;
let downButtonPressed = false;

let gamePaused = false;

let animationFrameId = null;
let lastTime = 0;

// Function to start the game
function startGame() {
  animationFrameId = requestAnimationFrame(gameLoop);
}

// Function to pause the game
function pauseGame() {
  gamePaused = true;
  cancelAnimationFrame(animationFrameId);
  resumeButton.style.display = "block";
}

// Function to resume the game
function resumeGame() {
  gamePaused = false;
  lastTime = 0;
  requestAnimationFrame(gameLoop);
  resumeButton.style.display = "none";
}

// Function to restart the game
function resetGame() {
  cancelAnimationFrame(animationFrameId);
  lastTime = 0;
  paddleLeft.score = 0;
  paddleRight.score = 0;
  playerScore.innerText = formatScore(0);
  computerScore.innerText = formatScore(0);
  paddleLeft.reset(10, canvas.height / 2);
  paddleRight.reset(canvas.width - 20, canvas.height / 2);
  ball.reset(canvas);
  startGame();
}

// Function to respond to the ball hitting the wall
function respondBall(ball) {
  if (ball.velocity.X > 0) {
    ball.position.x = canvas.width - 150;
    ball.position.y = Math.random() * (canvas.height - 200) + 100;
  }
  if (ball.velocity.X < 0) {
    ball.position.x = 150;
    ball.position.y = Math.random() * (canvas.height - 200) + 100;
  }
  ball.velocity.X *= -1;
  ball.velocity.Y *= -1;
}

// Function to control the AI for the right paddle
function playerAI(ball, paddle) {
  if (ball.velocity.X > 0) {
    if (ball.position.y > paddle.position.y) {
      paddle.position.y += paddle.velocity;

      if (paddle.position.y + paddle.height >= canvas.height) {
        paddle.position.y = canvas.height - paddle.height;
      }
    }
    if (ball.position.y < paddle.position.y) {
      paddle.position.y -= paddle.velocity;
      if (paddle.position.y <= 0) {
        paddle.position.y = 0;
      }
    }
  }
}

// Function to handle paddle collisions with the top and bottom edges
function paddleCollisionWithEdges(paddle) {
  // Top edge collision
  if (paddle.position.y <= 0) {
    paddle.position.y = 0;
  }
  // Bottom edge collision
  if (paddle.position.y + paddle.height >= canvas.height) {
    paddle.position.y = canvas.height - paddle.height;
  }
}

// Function to update the scores and respond when the ball goes off the boundary
function updateScore(ball, paddleLeft, paddleRight) {
  if (ball.position.x <= -ball.radius) {
    paddleRight.score++;
    computerScore.textContent = formatScore(paddleRight.score);
    respondBall(ball);
    wooshSound.play();
  }
  if (ball.position.x >= canvas.width + ball.radius) {
    paddleLeft.score++;
    playerScore.textContent = formatScore(paddleLeft.score);
    respondBall(ball);
    wooshSound.play();
  }
}

// Function to format the displayed score with leading zeros
function formatScore(score) {
  return score < 10 ? `0${score}` : `${score}`;
}

// Function to handle ball-paddle collisions
function ballPaddleCollision(ball, paddle) {
  const dx = Math.abs(ball.position.x - paddle.center.x);
  const dy = Math.abs(ball.position.y - paddle.center.y);

  if (
    dx <= ball.radius + paddle.halfWidth &&
    dy <= paddle.halfHeight + ball.radius
  ) {
    if (
      ball.velocity.X > 0 &&
      ball.position.x >= paddle.position.x - ball.radius
    ) {
      ball.velocity.X *= -1;
      ball.position.x = paddle.position.x - ball.radius;
      collisionSound.play();
    } else if (
      ball.velocity.X < 0 &&
      ball.position.x <= paddle.position.x + paddle.width + ball.radius
    ) {
      ball.velocity.X *= -1;
      ball.position.x = paddle.position.x + paddle.width + ball.radius;
      collisionSound.play();
    }
  }
}

//Check for device orientation
function isPortrait() {
  return innerWidth < innerHeight;
}

//functon for drawing game objects on canvas
function gameDraw() {
  ball.draw(c);
  paddleLeft.draw(c);
  paddleRight.draw(c);
}

// Set initial device orientation (portrait or landscape)
if (isPortrait()) {
  document.body.dataset.orientation = "portrait";
} else {
  document.body.dataset.orientation = "landscape";
}

// Function to update canvas dimensions
function updateCanvasDimensions() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

// Initial canvas size setup
updateCanvasDimensions();

let orientationChangeTimer;

// Function to handle orientation changes
function handleOrientationChange() {
  clearTimeout(orientationChangeTimer);
  orientationChangeTimer = setTimeout(() => {
    updateCanvasDimensions();

    if (isPortrait()) {
      document.body.dataset.orientation = "portrait";
      touchBtns.style.display = "none";

      // Update the orientation-notification dialog's width and height for portrait mode
      rotationNotificationElm.style.width = innerWidth + "px";
      rotationNotificationElm.style.height = innerHeight + "px";
      paddleRight.position.x = canvas.width - 20;

      // Pause the game when in portrait mode
      if (!gamePaused) {
        pauseGame();
      }
    } else {
      document.body.dataset.orientation = "landscape";
      rotationNotificationElm.style.width = innerWidth + "px";
      rotationNotificationElm.style.height = innerHeight + "px";
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        touchBtns.style.display = "block";
      }

      // Resume the game when in landscape mode
      if (gamePaused) {
        resumeGame();
      }

      paddleRight.position.x = canvas.width - 20;
    }
  }, 500);
}

handleOrientationChange();

// Function to update game state
function gameUpdate() {
  ball.update();
  paddleLeft.update(keys, upBottonPressed, downButtonPressed);
  playerAI(ball, paddleRight);
  ballPaddleCollision(ball, paddleLeft);
  ballPaddleCollision(ball, paddleRight);
  updateScore(ball, paddleLeft, paddleRight);
  paddleCollisionWithEdges(paddleLeft);
}

// Function for continuously update and render the game
function gameLoop() {
  c.fillStyle = "hsla(0, 0%, 0%, 0.5)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  gameUpdate();
  gameDraw();
  startGame();
}

//Event listener for orientation change
addEventListener("orientationchange", handleOrientationChange);
//Keyboard Events
addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

addEventListener("keyup", (e) => {
  keys[e.key] = false;
});
//Touch Events
upButton.addEventListener("touchstart", () => {
  upBottonPressed = true;
});
upButton.addEventListener("touchend", () => {
  upBottonPressed = false;
});
downButton.addEventListener("touchstart", () => {
  downButtonPressed = true;
});
downButton.addEventListener("touchend", () => {
  downButtonPressed = false;
});

//Game Control Events ----------------------------------------------------

// Event listener for the pause button
pauseButton.addEventListener("click", () => {
  pauseGame();
  resumeButton.classList.toggle("hidden");
});

// Event listener for the resume button
resumeButton.addEventListener("click", () => {
  resumeGame();
});

// Event listener for the reset button
resetButton.addEventListener("click", () => {
  resetGame();
});

// --------------------------------------------------------------------------

// Start the game loop
gameLoop();
