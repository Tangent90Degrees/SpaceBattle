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
    }

    update(time, delta) {
        this.pos.x += this.direction.x * this.speed * delta
        this.pos.y += this.direction.y * this.speed * delta

        this.pos.x = Math.max(this.pos.x, 20)
        this.pos.x = Math.min(this.pos.x, 280)
        this.pos.y = Math.max(this.pos.y, 20)
        this.pos.y = Math.min(this.pos.y, 130)
    }

    render(time) {
        let state = this.health > 0 ? 'alive' : 'dead'
        this.sprite = this._sprites[state]
        super.render(time);
    }

    shoot() {
        return this.bulletPool.get({ ...this.pos })
    }
}

