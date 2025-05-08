
/**
 * The base class for all game objects.
 */
class GameObject {
    constructor(enabled = true, sprite = null, pos = { x: 0, y: 0 }, scale = 1) {
        this.enabled = enabled
        this.sprite = sprite
        this.pos = pos
        this.scale = scale

        this.collider = null
    }

    render(time) {
        if (this.sprite) this.sprite.update(time, this.pos, this.scale)
    }

    get area() {
        if (this.collider) return this.collider.transform(this.pos, this.scale)
        return null
    }
}