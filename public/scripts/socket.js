const Socket = (function () {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function () {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function () {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            socket.emit("user login", Authentication.getUser());

            // Get the online user list
            socket.emit("get users");
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);

            // Update the online users panel
            OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            // Add the online user
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            // Remove the online user
            OnlineUsersPanel.removeUser(user);
        });

        socket.on("show invite", (inviteData) => {
            const { inviter, invitee } = JSON.parse(inviteData);
            if (invitee.username === Authentication.getUser().username) {
                OnlineUsersPanel.showInvite(inviter);
            }
        });

        socket.on("show accept invite", (inviteData) => {
            const { inviter } = JSON.parse(inviteData);
            if (inviter.username === Authentication.getUser().username) {
                OnlineUsersPanel.startCountdown(1); // Inviter starts as player 1
            }
        });

        socket.on("show decline invite", (inviter) => {
            inviter = JSON.parse(inviter);
            if (inviter.username === Authentication.getUser().username)
                OnlineUsersPanel.showDeclineInvite();
        });

        socket.on("show player new position", (playerData) => {
            playerData = JSON.parse(playerData);
            if (playerData.id === 1 && game.playerId === 2) {
                if (playerData.playerDirection === "x")
                    game._player1.direction.x = playerData.playerDirectionChange;
                else if (playerData.playerDirection === "y")
                    game._player1.direction.y = playerData.playerDirectionChange;
            } else if (playerData.id === 2 && game.playerId === 1) {
                if (playerData.playerDirection === "x")
                    game._player2.direction.x = playerData.playerDirectionChange;
                else if (playerData.playerDirection === "y")
                    game._player2.direction.y = playerData.playerDirectionChange;
            }
        });

        socket.on("show player new speed", (playerData) => {
            playerData = JSON.parse(playerData);
            if (playerData.id === 1 && game.playerId === 2) {
                game._player1.speed = playerData.playerSpeed;
            } else if (playerData.id === 2 && game.playerId === 1) {
                game._player2.speed = playerData.playerSpeed;
            }
        });

        socket.on("show player shoot", (playerData) => {
            playerData = JSON.parse(playerData);
            if (playerData.id === 1 && game.playerId === 2) {
                game._player1.pos = playerData.playerPosition;
                game._player1.shoot();
                console.log("player1 shoot");
            } else if (playerData.id === 2 && game.playerId === 1) {
                game._player2.pos = playerData.playerPosition;
                game._player2.shoot();
                console.log("player2 shoot");
            }
        });

        socket.on("show spawn enemy", (spawnData) => {
            spawnData = JSON.parse(spawnData)
            game._enemies.spawn(spawnData.pos)
        });

        socket.on("show die", (playerData) => {
            playerData = JSON.parse(playerData);
            if (playerData.id === 1 && game.playerId === 2) {
                game._player1.health--;
                if (game._player1.health <= 0) {
                    console.log("player1 die");
                }
            } else if (playerData.id === 2 && game.playerId === 1) {
                game._player2.health--;
                if (game._player2.health <= 0) {
                    console.log("player2 die");
                }
            }
        });
    };

    // This function disconnects the socket from the server
    const disconnect = function () {
        socket.disconnect();
        socket = null;
    };


    // This function sends an invite to the user
    const sendInvite = function (inviter, invitee) {
        if (socket && socket.connected) {
            const inviteData = {
                inviter: { ...inviter, playerId: 1 }, // Set inviter's playerId to 1
                invitee: { ...invitee, playerId: 2 }  // Set invitee's playerId to 2
            };
            socket.emit("send invite", inviteData);
        }
    };

    // This function accepts the invite
    const acceptInvite = function (inviter) {
        if (socket && socket.connected) {
            socket.emit("accept invite", { inviter, playerId: 1 });
        }
    };

    // This function declines the invite
    const declineInvite = function (inviter) {
        if (socket && socket.connected) {
            socket.emit("decline invite", inviter);
        }
    }

    const updatePlayerPosition = function (playerDirection, playerDirectionChange, playerId) {
        if (socket && socket.connected) {
            const playerData = {
                playerDirection:       playerDirection,
                playerDirectionChange: playerDirectionChange,
                id:                    playerId
            };
            socket.emit("update player position", playerData);
        }
    };

    const updateSpeed = function (playerSpeed, playerId) {
        if (socket && socket.connected) {
            const playerData = {
                playerSpeed: playerSpeed,
                id:          playerId
            };
            socket.emit("update speed", playerData);
        }
    };

    const updatePlayerShoot = function (playerPosition, playerId) {
        if (socket && socket.connected) {
            const playerData = {
                playerPosition: playerPosition,
                id:             playerId
            };
            socket.emit("update player shoot", playerData);
        }
    }

    const spawnEnemy = function (spawnPos) {
        if (socket && socket.connected) {
            const spawnData = {
                pos: spawnPos
            }
            socket.emit("spawn enemy", spawnData)
        }
    }

    const removeUser = function (user) {
        if (socket && socket.connected) {
            socket.emit("remove playing user", user);
        }
    }

    const die = function (playerId) {
        if (socket && socket.connected) {
            const playerData = {
                id: playerId
            };
            socket.emit("die", playerData);
        }
    }

    return {
        getSocket,
        connect,
        disconnect,
        sendInvite,
        acceptInvite,
        declineInvite,
        updatePlayerPosition,
        updateSpeed,
        updatePlayerShoot,
        spawnEnemy,
        removeUser,
        die// Expose the function here
    };
})();
