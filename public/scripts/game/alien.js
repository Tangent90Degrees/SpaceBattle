class Alien extends GameObject {
    constructor(sprite, pos = { x: 0, y: 0 }, scale = 1) {
        super(true, sprite, pos, scale)

        this.direction = { x: 0, y: 0 }
        this.speed = 1

        this.health = 1
    }

    update(time) {
        this.pos.x += this.direction.x * this.speed
        this.pos.y += this.direction.y * this.speed
        this.sprite.update(time, this.pos, this.scale)
    }

    shoot(sprite, bulletScale = 1) {
        return new Bullet(sprite, { x: this.pos.x, y: this.pos.y }, bulletScale); // Create a bullet at the player's position
    }
}