const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");

            // Get the chatroom messages
            socket.emit("get messages");
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

        socket.on("show invite", (inviter, invitee) => {
            inviter = JSON.parse(inviter);
            invitee = JSON.parse(invitee);
            if (invitee.username == Authentication.getUser().username)
                OnlineUsersPanel.showInvite(inviter);
        });
        
        socket.on("show accept invite", (inviter) => {
            inviter = JSON.parse(inviter);
            if (inviter.username == Authentication.getUser().username)
                OnlineUsersPanel.startCountdown(1);
        });

        socket.on("show decline invite", (inviter) => {
            inviter = JSON.parse(inviter);
            if (inviter.username == Authentication.getUser().username)
                OnlineUsersPanel.showDeclineInvite();
        });

        socket.on("show new position", (player) => {
            player = JSON.parse(player);
            if (playerId == 1 && player.playerId == 2) {
                player2.setPosition(data.x, data.y);
            } else if (playerId == 2 && data.playerId == 1) {
                player1.setPosition(data.x, data.y);
            }
        });
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };


    // This function sends an invite to the user
    const sendInvite = function(inviter, invitee) {
        if (socket && socket.connected) {
            socket.emit("send invite", inviter, invitee);
        }
    };

    // This function accepts the invite
    const acceptInvite = function(inviter) {
        if (socket && socket.connected) {
            socket.emit("accept invite", inviter);
        }
    };

    // This function declines the invite
    const declineInvite = function(inviter) {
        if (socket && socket.connected) {
            socket.emit("decline invite", inviter);
        }
    }

    const updatePlayerPosition = function(player) {
        if (socket && socket.connected) {
            if (playerId === 1) {
                player1.update();
                socket.emit("update player position", { playerId: 1, x: player1.getX(), y: player1.getY() });
            } else {
                player2.update();
                socket.emit("update player position", { playerId: 2, x: player2.getX(), y: player2.getY() });
            }
        }
    }

    return { getSocket, connect, disconnect, sendInvite, acceptInvite, declineInvite };
})();
