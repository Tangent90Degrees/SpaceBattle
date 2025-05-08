let Game = function () {
    let canvas = $("#game-canvas").get(0)
    let context = canvas.getContext("2d")

    let timer = new Timer(0, 60)
    let countDown = new Timer(180, 1, true) // 3 minutes timer

    let player1Sprite = new Sprite(context, 'resources/player1.png')
    let player1 = new Player(player1Sprite)

    let player2;
    let aliens = [];
    let bullets = [];
    const alienSpawnInterval = 2000; // Spawn a new alien every 2 seconds
    const bulletSpeed = 5;
    const alienSpeed = 2;

    let gameInterval, alienSpawnTimer;
    let timerInterval;
    let remainingTime = 180;
    let player1Score = 0;
    let player2Score = 0;
    let totalScore = 0; // Total score = player1Score + player2Score
    let gameLives = 5; // Initial number of lives

    // Start the game loop
    const start = function (playerId) {
        // Initialize game lives display
        updateGameLivesDisplay();

        countDown.start(function (time) {
                let minutes = Math.floor(time / 60).toString().padStart(2);
                let seconds = (time % 60).toString().padStart(2);
                $("#timer").text(`${minutes}:${seconds}`);
            }
        )

        timer.start(function (time) {
            player1Sprite.update(time, { x: 0, y: 0 }, 10)
            // player1.update(time)
        })
    }

    // Update the game lives display
    const updateGameLivesDisplay = function () {
        const gameLivesContainer = $("#game-lives");
        gameLivesContainer.empty(); // Clear existing lives

        for (let i = 0; i < gameLives; i++) {
            gameLivesContainer.append($("<div class='life-icon'></div>")); // Append life icons
        }
    };

    // Shoot a bullet
    const shootBullet = function (player) {
        const { x, y } = player.getBoundingBox().getPoints().topRight;
        bullets.push({
            x:      x - 2.5,
            y:      y,
            width:  5,
            height: 10,
            color:  "yellow",
        });

        // Play shooting sound
        Sound.play("shoot");
    };

    // Decrease a life
    const loseLife = function () {
        if (gameLives > 0) {
            gameLives--;
            updateGameLivesDisplay();

            if (gameLives === 0) {
                stopGame(); // End the game if no lives are left
            }
        }
    };

    // Spawn a new alien
    const spawnAlien = function () {
        const x = Math.random() * (canvas.width - 30);
        const alien = Alien(context, x, 0, "green");
        aliens.push(alien);
    };

    // Update game objects
    const update = function () {
        // Update players
        Socket.updatePlayerPosition(player1, 1); // Pass playerId 1 for player1
        Socket.updatePlayerPosition(player2, 2); // Pass playerId 2 for player2

        // Move bullets
        bullets.forEach((bullet, index) => {
            bullet.y -= bulletSpeed;
            if (bullet.y < 0) bullets.splice(index, 1); // Remove bullets that go off-screen
        });

        // Move aliens
        aliens.forEach((alien, index) => {
            const { x, y } = alien.getXY();
            alien.setXY(x, y + alienSpeed);

            if (y > canvas.height) aliens.splice(index, 1); // Remove aliens that go off-screen
        });

        // Check for collisions
        bullets.forEach((bullet, bulletIndex) => {
            aliens.forEach((alien, alienIndex) => {
                const bulletBox = BoundingBox(context, bullet.y, bullet.x, bullet.y + bullet.height, bullet.x + bullet.width);
                if (bulletBox.intersect(alien.getBoundingBox())) {
                    // Remove bullet and alien on collision
                    bullets.splice(bulletIndex, 1);
                    aliens.splice(alienIndex, 1);

                    // Play explosion sound
                    Sound.play("explosion");

                    // Update the scores
                    if (playerId === 1) {
                        player1Score += 10;
                    } else {
                        player2Score += 10;
                    }
                    updateTotalScoreDisplay();
                }
            });
        });
    };

    // Update the total score display
    const updateTotalScoreDisplay = function () {
        totalScore = player1Score + player2Score; // Calculate total score
        $("#total-score").text(`Total Score: ${totalScore}`);
    };

    // Draw game objects
    const draw = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw players
        player1.draw();
        player2.draw();

        // Draw bullets
        bullets.forEach((bullet) => {
            context.fillStyle = bullet.color;
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw aliens
        aliens.forEach((alien) => alien.draw());
    };

    // Start the timer
    const startTimer = function () {
        remainingTime = 180; // Reset to 3 minutes
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            remainingTime--;
            updateTimerDisplay();

            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                stopGame(); // Stop the game when the timer reaches 0
            }
        }, 1000);
    };

    // Stop the timer
    const stopTimer = function () {
        clearInterval(timerInterval);
    };

    // Update the timer display
    const updateTimerDisplay = function () {
        const minutes = Math.floor(remainingTime / 60).toString().padStart(2, "0");
        const seconds = (remainingTime % 60).toString().padStart(2, "0");
        $("#timer").text(`${minutes}:${seconds}`);
    };

    // Stop the game loop
    const stopGame = function () {
        clearInterval(gameInterval);
        clearInterval(alienSpawnTimer);
        stopTimer();

        // Stop the gaming background music
        Sound.stop("gamingBackground");

        // Get the scores for both players
        const player1Score = player1.getScore();
        const player2Score = player2.getScore();

        // Submit Player 1's score
        fetch("/ranking", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ score: player1Score }),
        })
            .then((res) => res.json())
            .then((json) => {
                if (json.status === "success") {
                    console.log("Player 1's score submitted successfully:", json.highestScore);
                } else {
                    console.error("Error submitting Player 1's score:", json.error);
                }
            })
            .catch((err) => {
                console.error("Error submitting Player 1's score:", err);
            });

        // Submit Player 2's score
        fetch("/ranking", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ score: player2Score }),
        })
            .then((res) => res.json())
            .then((json) => {
                if (json.status === "success") {
                    console.log("Player 2's score submitted successfully:", json.highestScore);
                } else {
                    console.error("Error submitting Player 2's score:", json.error);
                }
            })
            .catch((err) => {
                console.error("Error submitting Player 2's score:", err);
            });

        // Show the rankings for Player 1 (you can modify this to show rankings for both players)
        Ranking.show({
            p1Username: player1.username,
            p1Score:    player1Score,
            p2Username: player2.username,
            p2Score:    player2Score
        });

        // Hide the game elements
        $("#total-score").hide();
        $("#game-lives").hide();
        $("#timer").hide();
        $("#game-canvas").hide();
        $("#returnButton").hide();

        alert("Game Over!");
    };

    // Stop the game and return to the menu
    const returnToMenu = function () {
        stopTimer();
        $("#online-users-panel").show(); // Show the online players panel
        $("#instructions-panel").show(); // Show the instructions panel
        $("#returnButton").hide(); // Hide the return button
        $("#game-canvas").hide(); // Hide the game canvas
        $("#timer").hide(); // Hide the timer
        $("#total-score").hide(); // Hide the total score
        $("#game-lives").hide(); // Hide the game lives
    };

    return { start, stopGame, loseLife, stopTimer, returnToMenu } // Expose returnToMenu
}

class GameManager {

    static FRAME_RATE = 60

    constructor() {
        this._canvas = $("#game-canvas").get(0)
        this._context = this._canvas.getContext("2d")

        this._timer = new Timer(0, GameManager.FRAME_RATE)
        this._countDown = new Timer(180, 1, true) // 3 minutes timer

        this._player1Sprite = new Sprite(this._context, 'resources/player1.png')
        this._player1 = new Player(this._player1Sprite, { x: 40, y: 40 }, 0.5)

        this._player2Sprite = new Sprite(this._context, 'resources/player1.png')
        this._player2 = new Player(this._player2Sprite, { x: canvas.width - 40, y: 40 }, 0.5)

        let game = this
        $(document).on('keydown', function (event) {
            switch (event.keyCode) {
                case 38:
                    if (playerId == 1) {
                        game._player1.direction.y = -1
                        Socket.updatePlayerPosition("y", -1, 1);
                    }
                    else if (playerId == 2) {
                        game._player2.direction.y = -1
                        Socket.updatePlayerPosition("y", -1, 2);
                    }
                    break
                case 40:
                    if (playerId == 1) {
                        game._player1.direction.y = 1
                        Socket.updatePlayerPosition("y", 1, 1);
                    }
                    else if (playerId == 2) {
                        game._player2.direction.y = 1
                        Socket.updatePlayerPosition("y", 1, 2);
                    }
                    break
                case 37:
                    if (playerId == 1) {
                        game._player1.direction.x = -1
                        Socket.updatePlayerPosition("x", -1, 1);
                    }
                    else if (playerId == 2) {
                        game._player2.direction.x = -1
                        Socket.updatePlayerPosition("x", -1, 2);
                    }
                    break
                case 39:
                    if (playerId == 1) {
                        game._player1.direction.x = 1
                        Socket.updatePlayerPosition("x", 1, 1);
                    }
                    else if (playerId == 2) {
                        game._player2.direction.x = 1
                        Socket.updatePlayerPosition("x", 1, 2);
                    }
                    break
            }
        })

        $(document).on('keyup', function (event) {
            switch (event.keyCode) {
                case 38:
                case 40:
                    if (playerId == 1) {
                        game._player1.direction.y = 0
                        Socket.updatePlayerPosition("y", 0, 1);
                    }
                    else if (playerId == 2) {
                        game._player2.direction.y = 0
                        Socket.updatePlayerPosition("y", 0, 2);
                    }
                    break
                case 37:
                case 39:
                    if (playerId == 1) {
                        game._player1.direction.x = 0
                        Socket.updatePlayerPosition("x", 0, 1);
                    }
                    else if (playerId == 2) {
                        game._player2.direction.x = 0
                        Socket.updatePlayerPosition("x", 0, 2);
                    }
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
        })
    }

    update(time, delta) {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
        this._player1.update(time, delta)
        Socket.updatePlayerPosition(this._player1.pos, playerId);
    }
}

let game = new GameManager
