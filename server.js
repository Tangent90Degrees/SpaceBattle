const express = require('express')

const bcrypt = require('bcrypt');
let fs = require('fs')
const session = require("express-session");

// Create the Express app
const app = express()

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret:            "game",
    resave:            false,
    saveUninitialized: false,
    rolling:           true,
    cookie:            { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;

    //
    // D. Reading the players.json file
    //
    const users = JSON.parse(fs.readFileSync("data/players.json"));

    //
    // E. Checking for the user data correctness
    //
    // username, avatar, name, password are not empty
    if (!username || !avatar || !name || !password) {
        res.json({ status: "error", error: "Username/avatar/name/password cannot be empty." });
        return;
    }
    // _, letters, numbers
    // containWordCharsOnly()
    if (!containWordCharsOnly(username)) {
        res.json({ status: "error", error: "Invalid username." });
        return;
    }
    // in operator
    if (username in users) {
        res.json({ status: "error", error: "Username has already been used." });
        return;
    }

    //
    // G. Adding the new user account
    //
    const hash = bcrypt.hashSync(password, 10);
    users[username] = { avatar, name, password: hash };

    //
    // H. Saving the players.json file
    //
    fs.writeFileSync("data/players.json", JSON.stringify(users, null, " "));

    //
    // I. Sending a success response to the browser
    //
    res.json({ status: "success" });

    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});


// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the players.json file
    //
    const users = JSON.parse(fs.readFileSync("data/players.json"));

    //
    // E. Checking for username/password
    //
    // in operator to username
    if (!(username in users)) {
        res.json({ status: "error", error: "Username does not exist." });
        return;
    }
    // compareSync()
    else {
        const hashedPassword = users[username].password;
        if (!bcrypt.compareSync(password, hashedPassword)) {
            res.json({ status: "error", error: "Incorrect password." });
            return;
        }
    }

    //
    // G. Sending a success response with the user account
    //
    req.session.user = { username, avatar: users[username].avatar, name: users[username].name };
    res.json({ status: "success", user: { username, avatar: users[username].avatar, name: users[username].name } });

    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    if (!req.session.user) {
        res.json({ status: "error", error: "User is not logged in." });
        return;
    }
    const user = req.session.user;

    //
    // D. Sending a success response with the user account
    //
    res.json({ status: "success", user });

});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    delete req.session.user;

    //
    // Sending a success response
    //
    res.json({ status: "success" });

});

const rankings = {};

app.post("/ranking", (req, res) => {
    const username = req.session.user.username;
    const { p1Score, p2Score, p1Username, p2Username } = req.body;

    // Update New Highest Score
    if (!rankings[p1Username]) {
        rankings[p1Username] = { highestScore: p1Score };
    } else {
        rankings[p1Username] = { highestScore: Math.max(rankings[p1Username].highestScore, p1Score) };
    }

    if (!rankings[p2Username]) {
        rankings[p2Username] = { highestScore: p2Score };
    } else {
        rankings[p2Username] = { highestScore: Math.max(rankings[p2Username].highestScore, p2Score) };
    }

    const sortedRankings = Object.entries(rankings)
        .map(([username, data]) => ({ username, score: data.highestScore }))
        .sort((a, b) => b.score - a.score);

    // Sending a success response
    res.json({ status: "success", p1HighestScore: rankings[p1Username].highestScore, p2HighestScore: rankings[p2Username].highestScore, sortedRankings: sortedRankings });
});

const { createServer } = require('http');
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);

const onlineUsers = {};

io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});
io.on("connection", (socket) => {
    const user = socket.request.session.user;

    // Add a new user to the online user list
    if (user) {
        onlineUsers[user.username] = { avatar: user.avatar, name: user.name };

        // Broadcast the updated list of online users to all other clients
        io.emit("add user", JSON.stringify({ username: user.username, avatar: user.avatar, name: user.name }));
        io.emit("users", JSON.stringify(onlineUsers));
    }

    socket.on("get users", () => {
        // Send the full list of online users to the client
        socket.emit("users", JSON.stringify(onlineUsers));
    });

    socket.on("send invite", (inviteData) => {
        const { inviter, invitee } = inviteData;
        io.emit("show invite", JSON.stringify({ inviter, invitee }));
    });

    socket.on("accept invite", (inviteData) => {
        const { inviter, invitee } = inviteData;
        io.emit("show accept invite", JSON.stringify({ inviter, invitee }));
    });

    socket.on("decline invite", (inviter) => {
        // Send the decline invite to the user
        io.emit("show decline invite", JSON.stringify(inviter));
    });

    socket.on("update player position", (playerData) => {
        // Send the new position to the user
        io.emit("show player new position", JSON.stringify(playerData));
    });

    socket.on("update speed", (playerData) => {
        // Send the new speed to the user
        io.emit("show player new speed", JSON.stringify(playerData));
    });

    socket.on("update player shoot", (playerData) => {
        // Send the new shoot to the user
        io.emit("show player shoot", JSON.stringify(playerData));
    })

    socket.on("spawn enemy", (spawnData) => {
        io.emit("show spawn enemy", JSON.stringify(spawnData));
    });

    socket.on("spawn powerUp", (spawnData) => {
        io.emit("show spawn powerUp", JSON.stringify(spawnData));
    });

    socket.on("die", (playerData) => {
        io.emit("show die", JSON.stringify(playerData));
    });

    // Handle user login
    socket.on("user login", (user) => {
        onlineUsers[user.username] = user;

        // Broadcast the updated list of online users
        io.emit("users", JSON.stringify(onlineUsers));
    });

    socket.on("remove playing user", (user) => {
        // Remove the user from the online users list
        delete onlineUsers[user.username];

        // Broadcast the updated list of online users
        io.emit("users", JSON.stringify(onlineUsers));
        io.emit("remove user", JSON.stringify({ username: user.username, avatar: user.avatar, name: user.name }));
    });

    // Handle user logout
    socket.on("disconnect", () => {
        if (user) {
            delete onlineUsers[user.username];

            // Broadcast the updated list of online users
            io.emit("users", JSON.stringify(onlineUsers));
            io.emit("remove user", JSON.stringify({ username: user.username, avatar: user.avatar, name: user.name }));
        }
    });
});


// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The game server has started...");
});

