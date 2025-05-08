class PowerUp extends GameObject {
    constructor(sprite, pos = { x: 0, y: 0 }, scale = 1) {
        super(true, sprite, pos, scale);
        this.type = null; // Type of power-up (e.g., speed, health)
        this.duration = 5; // Duration of the power-up effect
        this.active = false; // Whether the power-up is currently active
        this.age = 0; // Age of the power-up
    }

    update(time) {
        this.sprite.update(time, this.pos, this.scale);
    }
}