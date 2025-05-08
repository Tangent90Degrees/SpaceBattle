/**
 *
 */
class Sprite {
    /**
     * The constructor of sprites.
     * @param ctx A canvas context for drawing.
     * @param texture The file name of the sprite sheet.
     * @param samples The array of sprite samples.
     * @param loop If the sprite sequence is looped.
     */
    constructor(ctx, texture, samples = [], loop = false) {
        this._sheet = new Image
        this._sheet.src = texture

        this._ctx = ctx
        this._samples = samples.length === 0 ? [
            {
                pos:    { x: 0, y: 0 },
                size:   { width: this._sheet.width, height: this._sheet.height },
                pivot:  { x: this._sheet.width / 2, y: this._sheet.height / 2 },
                timing: 0
            }
        ] : samples
        this._loop = loop

        this._index = 0
        this._lastUpdate = 0
    }

    get index() {
        return this._index
    }

    set index(value) {
        this._index = this._loop
            ? value % this._samples.length
            : Math.min(value, this._samples.length - 1)
    }

    get sample() {
        return this._samples[this.index]
    }

    /**
     * Draw this sprite on the canvas.
     * @param pos The position of the pivot of the sprite on the canvas.
     * @param scale The scale of the sprite.
     */
    draw(pos, scale) {
        this._ctx.save()
        this._ctx.imageSmoothingEnabled = false
        this._ctx.drawImage(
            this._sheet,
            this.sample.pos.x,
            this.sample.pos.y,
            this.sample.size.width,
            this.sample.size.height,
            pos.x - this.sample.pivot.x * scale,
            pos.y - this.sample.pivot.y * scale,
            this.sample.size.width * scale,
            this.sample.size.height * scale
        )
        this._ctx.restore()
        return this
    }

    /**
     * Set the sprite sequence.
     * @param time The current time of the game.
     * @param pos The position of the pivot of the sprite on the canvas.
     * @param scale The scale of the sprite.
     */
    update(time, pos, scale) {
        if (this._lastUpdate === 0) this._lastUpdate = time
        if (time - this._lastUpdate > this.sample.timing) {
            this.index++
            this._lastUpdate = time
        }
        this.draw(pos, scale)

        // if (this.index < this._samples.length - 1 || this._loop) {
        //     requestAnimationFrame(this.update)
        // }
        return this
    }
}
