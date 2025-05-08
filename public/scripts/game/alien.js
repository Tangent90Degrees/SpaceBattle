class Alien extends GameObject {
    constructor(sprite, pos = { x: 0, y: 0 }, scale = 1) {
        super(false, sprite, pos, scale)
        this.collider = new Box(-11, 11, -8, 9)

        this.speed = 30

        this.pool = null
        this.health = 3
        this.bulletPool = null
    }

    update(time, delta) {
        this.pos.y += this.speed * delta
        this.sprite.update(time, this.pos, this.scale)

        if (this.pos.y > 180 && this.pool) {
            this.pool.release(this)
        }
    }

    shoot(sprite, bulletScale = 1) {
        return new Bullet(sprite, { x: this.pos.x, y: this.pos.y }, bulletScale); // Create a bullet at the player's position
    }
}