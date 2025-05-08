class Bullet extends GameObject {
    constructor(sprite, objectPos = { x: 0, y: 0 }, scale = 1) {
        super(true, sprite, { x: objectPos.x, y: objectPos.y }, scale); // Set bullet position to player's position

        this.direction = { x: 0, y: 0 }
        this.speed = 10;
    }

    update(time) {
        this.pos.x += this.direction.x * this.speed;
        this.pos.y += this.direction.y * this.speed;
        this.sprite.update(time, this.pos, this.scale);
    }
}
