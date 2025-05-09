/**
 * Player class
 */
class Player extends GameObject {

    /**
     * Creates an instance of Player.
     * @param sprite The sprite of the player.
     * @param deadSprite
     * @param pos The position of the player.
     * @param scale The scale of the player.
     */
    constructor(sprite, deadSprite, pos = { x: 0, y: 0 }, scale = 1) {
        super(true, sprite, pos, scale)
        this.collider = new Box(-10, 10, -10, 10)

        this.direction = { x: 0, y: 0 }
        this.speed = 60

        this.health = 6
        this.score = 0
        this.bulletPool = null

        this._sprites = {
            'alive': sprite,
            'dead': deadSprite
        }

        this.teammate = null
    }

    update(time, delta) {
        if (this.health > 0) {
            this.pos.x += this.direction.x * this.speed * delta
            this.pos.y += this.direction.y * this.speed * delta

            this.pos.x = Math.max(this.pos.x, 20)
            this.pos.x = Math.min(this.pos.x, 280)
            this.pos.y = Math.max(this.pos.y, 20)
            this.pos.y = Math.min(this.pos.y, 130)

            if (this.teammate && this.teammate.health <= 0 && Box.intersects(this.area, this.teammate.area)) {
                this.teammate.health = 1
            }
        }
    }

    render(time) {
        let state = this.health > 0 ? 'alive' : 'dead'
        this.sprite = this._sprites[state]
        super.render(time);
    }

    shoot() {
        if (this.health > 0) {
            Sound.play("playerShoot")
            return this.bulletPool.get({ ...this.pos })
        }
    }
}

