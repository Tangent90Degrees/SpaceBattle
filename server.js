const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
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
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));

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
    // H. Saving the users.json file
    //
    fs.writeFileSync("data/users.json", JSON.stringify(users, null, " "));

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
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));

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
 
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
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
 
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});


//
// ***** Please insert your Lab 6 code here *****
//

const { createServer } = require("http");
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
        io.emit("add user", JSON.stringify({ username: user.username, avatar: user.avatar, name: user.name }));
    }

    socket.on("get users", () => {
        // Send the online users to the browser
        socket.emit("users", JSON.stringify(onlineUsers));
    });

    socket.on("disconnect", () => {
        if (user) {
            // Remove the user from the online user list
            delete onlineUsers[user.username];
            io.emit("remove user", JSON.stringify({ username: user.username, avatar: user.avatar, name: user.name }));
        }
    });
});

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The game server has started...");
});
