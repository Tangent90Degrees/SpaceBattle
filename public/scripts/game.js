const Game = (function() {
    let canvas, context;
    let player1, player2;
    let aliens = [];
    let bullets = [];
    const alienSpawnInterval = 2000; // Spawn a new alien every 2 seconds
    const bulletSpeed = 5;
    const alienSpeed = 2;
    let gameArea, gameInterval, alienSpawnTimer;

    // Initialize the game
    const initialize = function() {
        canvas = $("#game-canvas").get(0);
        context = canvas.getContext("2d");

        // Define the game area
        gameArea = BoundingBox(context, 0, 0, canvas.height, canvas.width);

        // Create players
        if (playerId === 1) {
            player1 = Player1(context, 150, canvas.height - 50, gameArea, "blue");
            player2 = Player1(context, canvas.width - 150, canvas.height - 50, gameArea, "red", true); // Remote player
        } else {
            player1 = Player1(context, canvas.width - 150, canvas.height - 50, gameArea, "red", true); // Remote player
            player2 = Player1(context, 150, canvas.height - 50, gameArea, "blue");
        }

        // Set up controls for the local player
        $(document).on("keydown", function(event) {
            if (playerId === 1) {
                if (event.keyCode === 37)
                    player1.move(1);
                else if (event.keyCode === 38)
                    player1.move(2);
                else if (event.keyCode === 39)
                    player1.move(3);
                else if (event.keyCode === 40)
                    player1.move(4);
                else if (event.keyCode === 32)
                    player1.speedUp();
                else if (event.keyCode === 66)
                    shootBullet(player1);
            }
            else if (playerId === 2) {
                if (event.keyCode === 37)
                    player2.move(1);
                else if (event.keyCode === 38)
                    player2.move(2);
                else if (event.keyCode === 39)
                    player2.move(3);
                else if (event.keyCode === 40)
                    player2.move(4);
                else if (event.keyCode === 32)
                    player2.speedUp();
                else if (event.keyCode === 66)
                    shootBullet(player2);
            }
        });

        $(document).on("keyup", function(event) {
            if (playerId === 1) {
                if (event.keyCode === 37)
                    player1.stop(1);
                else if (event.keyCode === 38)
                    player1.stop(2);
                else if (event.keyCode === 39)
                    player1.stop(3);
                else if (event.keyCode === 40)
                    player1.stop(4);
                else if (event.keyCode === 32)
                    player1.slowDown();
            }
            else if (playerId === 2) {
                if (event.keyCode === 37)
                    player2.stop(1);
                else if (event.keyCode === 38)
                    player2.stop(2);
                else if (event.keyCode === 39)
                    player2.stop(3);
                else if (event.keyCode === 40)
                    player2.stop(4);
                else if (event.keyCode === 32)
                    player2.slowDown();
            }
        });

        // Start the game loop
        startGame(playerId);
    };

    // Shoot a bullet
    const shootBullet = function(player) {
        const { x, y } = player.getBoundingBox().getPoints().topRight;
        bullets.push({
            x: x - 2.5,
            y: y,
            width: 5,
            height: 10,
            color: "yellow",
        });
    };

    // Spawn a new alien
    const spawnAlien = function() {
        const x = Math.random() * (canvas.width - 30);
        const alien = Alien(context, x, 0, "green");
        aliens.push(alien);
    };

    // Update game objects
    const update = function() {
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
                }
            });
        });
    };

    // Draw game objects
    const draw = function() {
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

    // Start the game loop
    const startGame = function(playerId) {
        // Hide the online-users-panel and instructions-panel
        $("#online-users-panel").hide();
        $("#instructions-panel").hide();

        alienSpawnTimer = setInterval(spawnAlien, alienSpawnInterval);
        gameInterval = setInterval(() => {
            update(playerId);
            draw();
        }, 1000 / 60); // 60 FPS
    };

    // Stop the game loop
    const stopGame = function() {
        clearInterval(gameInterval);
        clearInterval(alienSpawnTimer);
    };

    return { initialize, startGame, stopGame }; // Expose startGame
})();
