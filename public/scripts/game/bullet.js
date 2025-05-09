class Bullet extends GameObject {
    constructor(sprite, pos, scale = 1, direction = { x: 0, y: -1 }, targets = null, id) {
        super(false, sprite, pos, scale)
        this.collider = new Box(-2, 2, -4, 4)

        this.direction = direction
        this.pool = null
        this.speed = 200
        this.id = id

        this.targets = targets
    }

    update(time, delta) {
        this.pos.x += this.direction.x * this.speed * delta
        this.pos.y += this.direction.y * this.speed * delta

        if ((this.pos.y < 0 || this.pos.y > 180) && this.pool) {
            this.pool.release(this)
            return
        }

        if (this.targets && this.pool) {
            this.targets.forEach((enemy) => {
                if (this.area && enemy.area && Box.intersects(this.area, enemy.area)) {
                    enemy.health -= 1

                    // Update player score
                    if (this.id === 1) {
                        game._player1.score += 10
                        if (enemy.health <= 0) {
                            game._player1.score += 50
                        }
                        $("#p1Score").css("color", "green")
                        setTimeout(() => {
                            $("#p1Score").css("color", "white")
                        }, 1000)
                    }
                    else if (this.id === 2) {
                        game._player2.score += 10
                        if (enemy.health <= 0) {
                            game._player2.score += 50
                        }
                        $("#p2Score").css("color", "green")
                        setTimeout(() => {
                            $("#p2Score").css("color", "white")
                        }, 1000)
                    }
                    else {
                        enemy.score -= 10
                        if (enemy === game._player1) {
                            $("#p1Score").css("color", "red")
                            setTimeout(() => {
                                $("#p1Score").css("color", "white")
                            }, 1000)
                        }
                        else if (enemy === game._player2) {
                            $("#p2Score").css("color", "red")
                            setTimeout(() => {
                                $("#p2Score").css("color", "white")
                            }, 1000)
                        }
                    }
                    this.pool.release(this)
                    return true
                }
            })
        }
    }
}
