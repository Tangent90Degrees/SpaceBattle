class Bullet extends GameObject {
    constructor(sprite, pos, scale = 1, direction = -1, targets = null) {
        super(false, sprite, pos, scale)
        this.collider = new Box(-2, 2, -4, 4)

        this.direction = direction
        this.pool = null
        this.speed = 200

        this.targets = targets
    }

    update(time, delta) {
        this.pos.y += this.direction * this.speed * delta

        if (this.pos.y < 0 && this.pool) {
            this.pool.release(this)
            return
        }

        if (this.targets && this.pool) {
            this.targets.forEachEnemy((enemy) => {
                if (this.area && enemy.area && Box.intersects(this.area, enemy.area)) {
                    enemy.health -= 1
                    this.pool.release(this)
                    return true
                }
            })
        }
    }
}
