/**
 * This function defines a Sprite module.
 * @param ctx A canvas context for drawing.
 * @param textureFile The file name of the sprite sheet.
 * @param samples The array of sprite samples.
 * @param loop If the sprite sequence is looped.
 * @returns The sprite object.
 */
const Sprite = function (ctx, textureFile, samples = [], loop = false) {

    /**
     * This is the image object for the sprite sheet.
     */
    let sheet = new Image
    sheet.src = textureFile

    /**
     * An array containing the sprite sequence information used by the sprite containing.
     */
    let sequence = samples.length === 0 ? [
        {
            pos:    { x: 0, y: 0 },
            size:   { width: sheet.width, height: sheet.height },
            pivot:  { x: sheet.width / 2, y: sheet.height / 2 },
            timing: 0
        }
    ] : samples

    /**
     * The index indicating the current sprite sample used in the sprite sequence.
     * @type {number}
     */
    let index = 0;

    /**
     * The updated time of the current sprite image. Used to determine the timing to switch to the next sprite image.
     * @type {number}
     */
    let lastUpdate = 0;

    /**
     * Draw this sprite on the canvas.
     * @param pos The position of the pivot of the sprite on the canvas.
     * @param scale The scale of the sprite.
     */
    function draw(pos, scale) {
        ctx.save()
        ctx.imageSmoothingEnabled = false
        let sample = sequence[index]
        ctx.drawImage(
            sheet,
            sample.pos.x,
            sample.pos.y,
            sample.size.width,
            sample.size.height,
            pos.x - sample.pivot.x * scale,
            pos.y - sample.pivot.y * scale,
            sample.size.width * scale,
            sample.size.height * scale
        )
        ctx.restore()
        return this
    }

    /**
     * Set the sprite sequence.
     * @param time The current time of the game.
     * @param pos The position of the pivot of the sprite on the canvas.
     * @param scale The scale of the sprite.
     */
    const update = function (time, pos, scale) {
        if (lastUpdate === 0) lastUpdate = time
        let sample = sequence[index]
        if (time - lastUpdate > sample.timing) {
            ctx.clearRect(
                sample.pos.x,
                sample.pos.y,
                sample.size.width,
                sample.size.height
            )
            draw(pos, scale)

            index++
            if (index === sequence.length) {
                index = loop ? 0 : sequence.length - 1
            }
            lastUpdate = time
        }

        if (index < sequence.length - 1 || loop) {
            requestAnimationFrame(update)
        }
        return this
    }

    return { draw, update }
}
