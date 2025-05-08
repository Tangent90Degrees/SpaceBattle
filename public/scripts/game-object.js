
/**
 * The base class for all game objects.
 */
class GameObject {
    constructor(enabled = true, sprite, pos = { x: 0, y: 0 }, scale = 1) {
        this.enabled = enabled;
        this.sprite = sprite;
        this.pos = pos;
        this.scale = scale;
    }

    draw() {
        this.sprite.draw(this.pos, this.scale);
    }

    update(time) {
        this.sprite.update(time, this.pos, this.scale);
    }
}