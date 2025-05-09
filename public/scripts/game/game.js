class Game {

    static FRAME_RATE = 60

    constructor() {
        this._canvas = $("#game-canvas").get(0)
        this._context = this._canvas.getContext("2d")

        this._timer = new Timer(0, Game.FRAME_RATE)
        this._countDown = new Timer(180, 1, true) // 3 minutes timer

        this.playerId = 0;

        this.totalScore = 0;

        let player1Sprite = new Sprite(this._context, 'resources/player/player1.png')
        this._player1 = new Player(player1Sprite, { x: 60, y: 120 }, 0.5)

        let player2Sprite = new Sprite(this._context, 'resources/player/player1.png')
        this._player2 = new Player(player2Sprite, { x: this._canvas.width - 60, y: 120 }, 0.5)

        let enemyBulletSprite = new Sprite(this._context, 'resources/enemies/bullet.png')
        this._enemyBullets = new ObjectPool(function (pos) {
            let bullet =
                new Bullet(enemyBulletSprite, pos, 0.5, { x: 0, y: 1 }, [game._player1, game._player2], 0)
            bullet.speed = 60
            return bullet
        })

        let enemySprite = new Sprite(this._context, 'resources/enemies/scout.png')
        let enemies = this._enemies
            = new EnemySpawner(enemySprite, [this._player1, this._player2], this._enemyBullets, this.playerId)

        let playerBulletSprite = new Sprite(this._context, 'resources/player/bullet.png')

        let powerUpSprite = new Sprite(this._context, 'resources/heal.png')
        this._powerup = this._powerup
            = new PowerUpSpawner(powerUpSprite, [this._player1, this._player2], this.playerId)

        this._player1.bulletPool = new ObjectPool(function (pos) {
            return new Bullet(playerBulletSprite, pos, 0.5, { x: 0, y: -1 }, enemies, 1)
        })
        this._player2.bulletPool = new ObjectPool(function (pos) {
            return new Bullet(playerBulletSprite, pos, 0.5, { x: 0, y: -1 }, enemies, 2)
        })

        if (this.playerId === 1) {
            this.updateLivesDisplay(this._player1.health); // Update the player1 lives display
        }
        else {
            this.updateLivesDisplay(this._player2.health); // Update the player2 lives display
        }


        let game = this
        $(document).on('keydown', function (event) {
            switch (event.keyCode) {
                case 38:
                case 87:
                    if (game.playerId === 1) {
                        game._player1.direction.y = -1
                        Socket.updatePlayerPosition("y", -1, 1)
                    } else {
                        game._player2.direction.y = -1
                        Socket.updatePlayerPosition("y", -1, 2)
                    }
                    break
                case 40:
                case 83:
                    if (game.playerId === 1) {
                        game._player1.direction.y = 1
                        Socket.updatePlayerPosition("y", 1, 1)
                    } else {
                        game._player2.direction.y = 1
                        Socket.updatePlayerPosition("y", 1, 2)
                    }
                    break
                case 37:
                case 65:
                    if (game.playerId === 1) {
                        game._player1.direction.x = -1
                        Socket.updatePlayerPosition("x", -1, 1)
                    } else {
                        game._player2.direction.x = -1
                        Socket.updatePlayerPosition("x", -1, 2)
                    }
                    break
                case 39:
                case 68:
                    if (game.playerId === 1) {
                        game._player1.direction.x = 1
                        Socket.updatePlayerPosition("x", 1, 1)
                    } else {
                        game._player2.direction.x = 1
                        Socket.updatePlayerPosition("x", 1, 2)
                    }
                    break
                case 32:
                    if (game.playerId === 1) {
                        game._player1.shoot()
                        Socket.updatePlayerShoot(game._player1.pos, 1)
                    } else {
                        game._player2.shoot()
                        Socket.updatePlayerShoot(game._player2.pos, 2)
                    }
                    break
                case 66:
                    if (game.playerId === 1) {
                        game._player1.speed = 120
                        Socket.updateSpeed(game._player1.speed, 1)
                    } else {
                        game._player2.speed = 120
                        Socket.updateSpeed(game._player2.speed, 2)
                    }
                    break
            }
        })

        $(document).on('keyup', function (event) {
            switch (event.keyCode) {
                case 38:
                case 40:
                case 87:
                case 83:
                    if (game.playerId === 1) {
                        game._player1.direction.y = 0
                        Socket.updatePlayerPosition("y", 0, 1)
                    } else {
                        game._player2.direction.y = 0
                        Socket.updatePlayerPosition("y", 0, 2)
                    }
                    break
                case 37:
                case 39:
                case 65:
                case 68:
                    if (game.playerId === 1) {
                        game._player1.direction.x = 0
                        Socket.updatePlayerPosition("x", 0, 1)
                    } else {
                        game._player2.direction.x = 0
                        Socket.updatePlayerPosition("x", 0, 2)
                    }
                    break
                case 66:
                    if (game.playerId === 1) {
                        game._player1.speed = 60
                        Socket.updateSpeed(game._player1.speed, 1)
                    } else {
                        game._player2.speed = 60
                        Socket.updateSpeed(game._player2.speed, 2)
                    }
                    break
            }
        })
    }

    updateLivesDisplay(lives) {
        const livesContainer = $("#game-lives");
        livesContainer.empty(); // Clear existing lives
        for (let i = 0; i < lives; i++) {
            livesContainer.append('<div class="life-icon"></div>');
        }
    }

    endGame() {
        alert("Game Over!");
        // this.stop(); // Stop the game logic
        const resultData = {
            p1Score: this._player1.score,
            p2Score: this._player2.score,
            id: this.playerId,
        }
        Ranking.show(resultData);
    }

    start(playerId) {
        this.playerId = playerId;

        this._countDown.start(function (time) {
                let minutes = Math.floor(time / 60).toString().padStart(2, '0');
                let seconds = (time % 60).toString().padStart(2, '0');
                $("#timer").text(`${minutes}:${seconds}`);
            }
        )

        let game = this
        this._timer.start(function (time, delta) {
            game.update(time, delta)
            game.render(time)
        })
    }

    update(time, delta) {
        this._player1.update(time, delta)
        this._player2.update(time, delta)
        this._player1.bulletPool.update(time, delta)
        this._player2.bulletPool.update(time, delta)
        this._enemyBullets.update(time, delta)
        this._enemies.update(time, delta)
        this._powerup.update(time, delta)
        if (this.playerId === 1) this.updateLivesDisplay(this._player1.health)
        if (this.playerId === 2) this.updateLivesDisplay(this._player2.health)
        if (this.playerId === 1) {
            this._enemies.hostUpdate(time, delta)
            this._powerup.hostUpdate(time, delta)
        }
        this.totalScore = this._player1.score + this._player2.score
        $("#sumScore").text(`${this.totalScore}`)
        $("#p1Score").text(`${this._player1.score}`)
        $("#p2Score").text(`${this._player2.score}`)

        if (this.playerId === 1 && this._player1.health <= 0) {
            Socket.die(1)
        }
        else if (this.playerId === 2 && this._player2.health <= 0) {
            Socket.die(2)
        }
    }

    render(time) {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
        this._enemyBullets.render(time)
        this._player1.bulletPool.render(time)
        this._player2.bulletPool.render(time)
        this._enemies.render(time)
        this._powerup.render(time)
        this._player1.render(time)
        this._player2.render(time)
    }
}

let game = new Game

