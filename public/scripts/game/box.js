class Box {
    constructor(left, right, up, bottom) {
        this.left = left
        this.right = right
        this.up = up
        this.bottom = bottom
    }

    transform(pos, scale) {
        return new Box(
            this.left * scale + pos.x,
            this.right * scale + pos.x,
            this.up * scale + pos.y,
            this.bottom * scale + pos.y
        )
    }

    cover(pos) {
        return pos.x >= this.left && pos.x <= this.right && pos.y >= this.up && pos.y <= this.bottom
    }

    static intersects(a, b) {
        return a.left < b.right && a.right > b.left && a.up < b.bottom && a.bottom > b.up
    }
}
