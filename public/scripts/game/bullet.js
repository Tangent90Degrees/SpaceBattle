class Bullet extends GameObject {
    constructor(sprite, pos, scale = 1, pool = null) {
        super(false, sprite, pos, scale)
        this.pool = null
        this.speed = 200
    }

    update(time, delta) {
        this.pos.y -= this.speed * delta

        if (this.pos.y < 0 && this.pool) {
            this.pool.release(this)
        }
    }
}
