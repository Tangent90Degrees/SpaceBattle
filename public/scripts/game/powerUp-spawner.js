class PowerUpSpawner extends GameObject {
    constructor(sprite, players, id) {
        super()
        this._pool = new ObjectPool(function (pos) {
            return new PowerUp(sprite, pos, 0.05, players)
        })
        this.id = id
        this.countDown = 20
    }

    update(time, delta) {
        this._pool.update(time, delta)
    }

    hostUpdate(time, delta) {
        this.countDown -= delta

        if (this.countDown < 0) {
            this.countDown = 20
            Socket.spawnPowerUp({ x: 20 + Math.random() * 260, y: 20 + Math.random() * 100 })
        }
    }

    forEach(callback) {
        this._pool.forEach(callback)
    }

    render(time) {
        this._pool.render(time)
    }

    spawn(pos) {
        return this._pool.get(pos)

    }
}