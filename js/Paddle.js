export default class Paddle {
  constructor(x, y, height, width, velocity) {
    this.score = 0;
    this.height = height;
    this.width = width;
    this.position = { x, y };
    this.velocity = velocity;
  }

  get halfWidth() {
    return this.width / 2;
  }

  get halfHeight() {
    return this.height / 2;
  }

  get center() {
    return {
      x: this.halfWidth + this.position.x,
      y: this.halfHeight + this.position.y,
    };
  }

  update(keys, upButtonPressed, downButtonPressed) {
    if (keys.ArrowUp || upButtonPressed) {
      this.moveUp();
    }
    if (keys.ArrowDown || downButtonPressed) {
      this.moveDown();
    }
  }

  moveUp() {
    this.position.y -= this.velocity;
  }

  moveDown() {
    this.position.y += this.velocity;
  }

  draw(context) {
    context.fillStyle = "#002f9e";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reset(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
}
