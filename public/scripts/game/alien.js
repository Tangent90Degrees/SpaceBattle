class Alien extends GameObject {
    constructor(sprite, pos = { x: 0, y: 0 }, scale = 1, players = []) {
        super(false, sprite, pos, scale)
        this.collider = new Box(-11, 11, -8, 9)

        this.speed = 30

        this.pool = null
        this.health = 3
        this.score = 0
        this.bulletPool = null
        this.players = players

        this._nextShootRemaining = 0
    }

    update(time, delta) {
        this.pos.y += this.speed * delta
        this.sprite.update(time, this.pos, this.scale)

        this._nextShootRemaining -= delta
        if (this._nextShootRemaining < 0) {
            this._nextShootRemaining = 1
            this.shoot()
        }

        if (this.pos.y > 180 && this.pool) {
            this.health = 3
            this.pool.release(this)
            return
        }

        if (this.health <= 0 && this.pool) {
            this.health = 3
            this.pool.release(this)
            return
        }

        this.players.forEach(player => {
            if (this.area && player.area && Box.intersects(this.area, player.area)) {
                player.health -= 2
                this.health = 3
                this.pool.release(this)
                return true
            }
        })
    }

    shoot() {
        let left = this.bulletPool.get({ ...this.pos })
        left.direction = { x: -0.5, y: 1 }
        let right = this.bulletPool.get({ ...this.pos })
        right.direction = { x: 0.5, y: 1 }
    }
}