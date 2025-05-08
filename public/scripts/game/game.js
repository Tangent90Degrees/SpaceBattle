class Game {

    static FRAME_RATE = 60

    constructor() {
        this._canvas = $("#game-canvas").get(0)
        this._context = this._canvas.getContext("2d")

        this._timer = new Timer(0, Game.FRAME_RATE)
        this._countDown = new Timer(180, 1, true) // 3 minutes timer

        let player1Sprite = new Sprite(this._context, 'resources/player/player1.png')
        this._player1 = new Player(player1Sprite, { x: 60, y: 120 }, 0.5)

        let enemyBulletSprite = new Sprite(this._context, 'resources/enemies/bullet.png')
        this._enemyBullets = new ObjectPool(function (pos) {
            let bullet =
                new Bullet(enemyBulletSprite, pos, 0.5, { x: 0, y: 1 }, [game._player1])
            bullet.speed = 60
            return bullet
        })

        let enemySprite = new Sprite(this._context, 'resources/enemies/scout.png')
        let enemies = this._enemies
            = new EnemySpawner(enemySprite, [this._player1], this._enemyBullets)

        let playerBulletSprite = new Sprite(this._context, 'resources/player/bullet.png')
        this._playerBullets = new ObjectPool(function (pos) {
            return new Bullet(playerBulletSprite, pos, 0.5, { x: 0, y: -1 }, enemies)
        })
        this._player1.bulletPool = this._playerBullets


        let game = this
        $(document).on('keydown', function (event) {
            switch (event.keyCode) {
                case 38:
                case 87:
                    game._player1.direction.y = -1
                    break
                case 40:
                case 83:
                    game._player1.direction.y = 1
                    break
                case 37:
                case 65:
                    game._player1.direction.x = -1
                    break
                case 39:
                case 68:
                    game._player1.direction.x = 1
                    break
                case 32:
                    game._player1.shoot()
            }
        })

        $(document).on('keyup', function (event) {
            switch (event.keyCode) {
                case 38:
                case 40:
                case 87:
                case 83:
                    game._player1.direction.y = 0
                    break
                case 37:
                case 39:
                case 65:
                case 68:
                    game._player1.direction.x = 0
                    break
            }
        })
    }

    start() {
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
        this._playerBullets.update(time, delta)
        this._enemyBullets.update(time, delta)
        this._enemies.update(time, delta)
    }

    render(time) {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
        this._enemyBullets.render(time)
        this._playerBullets.render(time)
        this._enemies.render(time)
        this._player1.render(time)
    }
}

let game = new Game
