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
        player1 = Player(context, 150, canvas.height - 50, gameArea);
        player2 = Player(context, canvas.width - 150, canvas.height - 50, gameArea);

        // Set up controls for player 1 (WASD + Space)
        $(document).on("keydown", (e) => {
            if (e.key === "a") player1.move(1);
            if (e.key === "d") player1.move(3);
            if (e.key === " ") shootBullet(player1);
        });
        $(document).on("keyup", (e) => {
            if (e.key === "a") player1.stop(1);
            if (e.key === "d") player1.stop(3);
        });

        // Set up controls for player 2 (Arrow keys + Enter)
        $(document).on("keydown", (e) => {
            if (e.key === "ArrowLeft") player2.move(1);
            if (e.key === "ArrowRight") player2.move(3);
            if (e.key === "Enter") shootBullet(player2);
        });
        $(document).on("keyup", (e) => {
            if (e.key === "ArrowLeft") player2.stop(1);
            if (e.key === "ArrowRight") player2.stop(3);
        });

        // Start the game loop
        startGame();
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
        player1.update(performance.now());
        player2.update(performance.now());

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
    const startGame = function() {
        alienSpawnTimer = setInterval(spawnAlien, alienSpawnInterval);
        gameInterval = setInterval(() => {
            update();
            draw();
        }, 1000 / 60); // 60 FPS
    };

    // Stop the game loop
    const stopGame = function() {
        clearInterval(gameInterval);
        clearInterval(alienSpawnTimer);
    };

    return { initialize, stopGame };
})();