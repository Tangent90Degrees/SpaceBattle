class EnemySpawner extends GameObject {
    constructor(sprite, players, enemyBullets, playerId) {
        super()
        this._pool = new ObjectPool(function (pos) {
            let enemy = new Alien(sprite, pos, 0.5, players)
            enemy.bulletPool = enemyBullets
            return enemy
        })

        this.countDown = 3
    }

    update(time, delta) {
        this._pool.update(time, delta)
        this.countDown -= delta

        if (this.countDown < 0) {
            this.countDown = 2 + 2 * Math.random()
            this.spawn({ x: 20 + Math.random() * 260, y: -20 })
        }
    }

    forEach(callback) {
        this._pool.forEach(callback)
    }

    render(time) {
        this._pool.render(time)
    }

    spawn(pos) {
        Socket.spawnEnemy(pos, playerId)
        return this._pool.get(pos)
    }
}