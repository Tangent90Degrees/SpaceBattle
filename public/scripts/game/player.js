/**
 * Player class
 */
class Player extends GameObject {

    /**
     * Creates an instance of Player.
     * @param sprite The sprite of the player.
     * @param pos The position of the player.
     * @param scale The scale of the player.
     */
    constructor(sprite, pos = { x: 0, y: 0 }, scale = 1) {
        super(true, sprite, pos, scale)

        this.direction = { x: 0, y: 0 }
        this.speed = 60

        this.health = 3
        this.bulletPool = null
    }

    update(time, delta) {
        this.pos.x += this.direction.x * this.speed * delta
        this.pos.y += this.direction.y * this.speed * delta
    }

    shoot() {
        return this.bulletPool.get({ ...this.pos })
    }
}

