export default class Ball {
  constructor(x, y, radius, velocityX, velocityY) {
    this.radius = radius;
    this.position = { x, y };
    this.velocity = { X: velocityX, Y: velocityY };
  }

  update() {
    this.position.x += this.velocity.X;
    this.position.y += this.velocity.Y;
    collitionWithBall(this);
  }

  draw(context) {
    context.fillStyle = "white";
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }
  reset(canvas) {
    this.position.x = Math.random() * (canvas.height - 200) + 100;
    this.position.y = Math.random() * (canvas.height - 200) + 100;
  }
}

function collitionWithBall(obj) {
  if (obj.position.y - obj.radius <= 0) {
    obj.velocity.Y *= -1;
  }
  if (obj.position.y + obj.radius >= canvas.height) {
    obj.velocity.Y *= -1;
  }
}
