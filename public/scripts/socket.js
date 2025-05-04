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

            // Show the online users
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
                PairingPanel.showInvite(inviter);
        });
        
        socket.on("show accept invite", (inviter) => {
            inviter = JSON.parse(inviter);
            if (inviter.username == Authentication.getUser().username)
                PairingPanel.startCountdown();
        });

        socket.on("show decline invite", (inviter) => {
            inviter = JSON.parse(inviter);
            if (inviter.username == Authentication.getUser().username)
                PairingPanel.showDeclineInvite();
        });
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };


    // This function sends an invite to the user
    const sendInvite = function(inviter, invitee) {
        if (socket && socket.connected)
            socket.emit("send invite", inviter, invitee);
    };

    // This function accepts the invite
    const acceptInvite = function(inviter) {
        if (socket && socket.connected)
            socket.emit("accept invite", inviter);
    };

    // This function declines the invite
    const declineInvite = function() {
        if (socket && socket.connected)
            socket.emit("decline invite");
    }


    return { getSocket, connect, disconnect, sendInvite, acceptInvite, declineInvite };
})();
