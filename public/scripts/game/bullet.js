class Bullet extends GameObject {
    constructor(sprite, pos = { x: 0, y: 0 }, scale = 1) {
        super(false, sprite, pos, scale); // Set bullet position to player's position
        this.speed = 10;
    }

    update(time) {
        this.pos.x += this.direction.x * this.speed;
        this.pos.y += this.direction.y * this.speed;
        this.sprite.update(time, this.pos, this.scale);
    }
}
