class PowerUp extends GameObject {
    constructor(sprite, pos = { x: 50, y: 50 }, scale = 1, players = []) {
        super(false, sprite, pos, scale)
        this.collider = new Box(-11, 11, -8, 9)

        this.pool = null
        this.health = 1
        this.bulletPool = null
        this.players = players
        this.age = 3
    }

    update(time, delta) {
        this.age -= delta

        if (this.age <= 0 && this.pool) {
            this.health = 1
            this.age = 3
            this.pool.release(this)
            return
        }

        if (this.health <= 0 && this.pool) {
            this.health = 1
            this.age = 3
            this.pool.release(this)
            return
        }

        this.players.forEach(player => {
            if (this.area && player.area && Box.intersects(this.area, player.area)) {
                if (player.health >= 6) {
                    this.pool.release(this)
                    return
                }
                Sound.play("powerUp")
                player.health += 1
                this.health = 1
                this.age = 3
                this.pool.release(this)
                return true
            }
        })
    }
}