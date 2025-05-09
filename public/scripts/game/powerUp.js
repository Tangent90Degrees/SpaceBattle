class PowerUp extends GameObject {
    constructor(sprite, pos = { x: 50, y: 50 }, scale = 1, players = []) {
        super(false, sprite, pos, scale)
        this.collider = new Box(-11, 11, -8, 9)

        this.pool = null
        this.health = 1
        this.bulletPool = null
        this.players = players
        this.speed = 30
        this.age = 300
    }

    update(time, delta) {
        this.age -= this.speed * delta

        if (this.age <= 0 && this.pool) {
            this.health = 1
            this.age = 300
            this.pool.release(this)
            return
        }

        if (this.health <= 0 && this.pool) {
            this.health = 1
            this.age = 300
            this.pool.release(this)
            return
        }

        this.players.forEach(player => {
            if (this.area && player.area && Box.intersects(this.area, player.area)) {
                player.health += 1
                this.health = 1
                this.age = 300
                this.pool.release(this)
                return true
            }
        })
    }
}