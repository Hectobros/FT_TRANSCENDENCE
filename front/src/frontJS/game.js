export class Sprite {
    constructor({
      position,
      framesMax = 1,
      offset = { x: 0, y: 0 },
      height,
      width,
      coord = { top: 0, left: 0, right: 0, bottom: 0, center: { x: 0, y: 0 } },
      display = true,
      ctx = 0,
    }) {
      this.width = width;
      this.height = height;
      this.position = position;
      this.coord = coord;
      this.display = display;
      this.ctx = ctx;
      this.coord.top = this.position.y;
      this.coord.right = this.position.x + this.width;
      this.coord.bottom = this.position.y + this.height;
      this.coord.left = this.position.x;
      this.coord.center = {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height / 2,
      };
      }
  
    getCoord() {
      this.coord.top = this.position.y;
      this.coord.right = this.position.x + this.width;
      this.coord.bottom = this.position.y + this.height;
      this.coord.left = this.position.x;
      this.coord.center = {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height / 2,
      };
    }
}
  
export class paddle extends Sprite {
    constructor({
      position,
      velocity = { x: 0, y: 0 },
      speed = 9,
      height = 0,
      width = 0,
    }) {
      super({
        position,
        height,
        width,
      });
      this.velocity = velocity;
      this.speed = speed;
    }
    update(ctx, canvas) {
      // movement paddle
      if (
        !(this.position.y + this.velocity.y + this.height > canvas.height) &&
        this.position.y + this.velocity.y >= 0
      )
        this.position.y += this.velocity.y;
  
      this.velocity.y = 0;
    }
    reset() {
      this.speed = 9;
    }
  }
  
export class ball extends Sprite {
    constructor({
      position,
      velocity,
      width,
      height,
      speed,
    }) {
      super({
        position,
        width,
        height,
      });
      this.width = width;
      this.height = height;
      this.velocity = velocity;
      this.radius = this.height / 2;
      this.speed = speed;
    }
}