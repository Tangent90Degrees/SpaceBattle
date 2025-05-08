const SignInForm = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Populate the avatar selection
        Avatar.populate($("#register-avatar"));

        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();

                    // Play the starting background music
                    Sound.play("startingBackground", true);

                    Socket.connect();
                },
                (error) => {
                    $("#signin-message").text(error);
                }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const avatar = $("#register-avatar").val();
            const name = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password !== confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, avatar, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => {
                    $("#register-message").text(error);
                }
            );
        });
    };

    // This function shows the form
    const show = function () {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function () {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const UserPanel = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    // Stop the all background music
                    Sound.stop("startingBackground");
                    Sound.stop("gamingBackground");

                    // Stop the timer and hide game elements
                    Game.stopTimer(); // Stop the timer
                    $("#timer").hide();
                    $("#total-score").hide();
                    $("#game-lives").hide();
                    $("#game-canvas").hide();

                    Socket.disconnect();

                    hide();
                    SignInForm.show();
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function (user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function () {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function (user) {
        if (user) {
            $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        } else {
            $("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const OnlineUsersPanel = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        $("#instructions-panel").hide();
        $("#online-users-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                }
            );
        });
    };

    // This function updates the online users panel
    const update = function (onlineUsers) {
        const onlineUsersArea = $("#online-users-area");

        // Clear the online users area
        onlineUsersArea.empty();

        // Get the current user
        const currentUser = Authentication.getUser();

        // Add each user except the current user
        for (const username in onlineUsers) {
            if (username !== currentUser.username) {
                const user = onlineUsers[username];
                onlineUsersArea.append($("<div class='field-content row shadow'></div>")
                    .append($("<span class='user-avatar'></span>").html(Avatar.getCode(onlineUsers[username].avatar)))
                    .append($("<span class='user-name'></span>").text(onlineUsers[username].name))
                    .append($("<button class='invite-button'>Invite</button>").data("user", user))
                );
            }
        }
    };

    // This function adds a user in the panel
    const addUser = function (user) {
        const onlineUsersArea = $("#online-users-area");

        // Find the user
        const userDiv = onlineUsersArea.find("#username-" + user.username);

        // Add the user if not already present
        if (userDiv.length === 0) {
            console.log(user);
            onlineUsersArea.append($("<div class='field-content row shadow' id='username-" + user.username + "'></div>")
                .append($("<span class='user-avatar'></span>").html(Avatar.getCode(user.avatar)))
                .append($("<span class='user-name'></span>").text(user.name))
                .append($("<button class='invite-button'>Invite</button>").data("user", user))
            );
        }
    };

    // This function removes a user from the panel
    const removeUser = function (user) {
        const onlineUsersArea = $("#online-users-area");

        // Find the user
        const userDiv = onlineUsersArea.find("#username-" + user.username);

        // Remove the user
        if (userDiv.length > 0) userDiv.remove();
    };

    $(document).on("click", ".invite-button", function () {
        const invitee = $(this).data("user");
        const inviter = Authentication.getUser(); // Get the current user as the inviter
        if (inviter) {
            console.log("Inviting user: ", invitee.username);
            Socket.sendInvite(inviter, invitee); // Pass both inviter and invitee
        } else {
            console.error("Inviter is undefined.");
        }
    });

    // Handle accept button click
    $(document).on("click", "#accept-invite", function () {
        const inviter = $(this).data("inviter");
        Socket.acceptInvite(inviter);
        $("#invite-overlay").hide();
        startCountdown(2);
    });

    // Handle decline button click
    $(document).on("click", "#decline-invite", function () {
        const inviter = $(this).data("inviter");
        Socket.declineInvite(inviter);
        $("#invite-overlay").hide();
    });

    $(document).on("click", "#decline-notification-ok", function () {
        $("#decline-notification-overlay").fadeOut(500);
    });

    // This function shows the invite overlay
    const showInvite = function (inviter) {
        $("#invite-message").text(`${inviter.name} has invited you to play.`);
        $("#accept-invite").data("inviter", inviter);
        $("#decline-invite").data("inviter", inviter);
        $("#invite-overlay").fadeIn(500);
    };

    // This function shows the decline invite overlay
    const showDeclineInvite = function () {
        $("#decline-notification-overlay").fadeIn(500);
    }

    // This function starts the countdown before the game
    const startCountdown = function (playerId) {
        let countdown = 5;
        $("#countdown").text(countdown);
        $("#countdown-overlay").fadeIn(500);

        const interval = setInterval(() => {
            countdown--;
            $("#countdown").text(countdown);

            if (countdown <= 0) {
                clearInterval(interval);
                $("#countdown-overlay").fadeOut(500);
                $("#online-users-panel").fadeOut(500);
                // Transition to the game screen (to be implemented)

                // Stop the starting background music
                Sound.stop("startingBackground");

                // Play the gaming background music infinitely
                Sound.play("gamingBackground", true); // Enable looping

                // Hide the online-users-panel and instructions-panel
                $("#online-users-panel").hide();
                $("#instructions-panel").hide();

                // Show the game canvas, timer, score, and lives
                $("#game-canvas").show();
                $("#timer").show();
                $("#total-score").show();
                $("#game-lives").show(); // Ensure game lives are shown
                $("#returnButton").show();

                game.start()
            }
        }, 1000);
    };

    return { initialize, update, addUser, removeUser, showInvite, showDeclineInvite, startCountdown };
})();

const UI = (function () {
    // This function gets the user display
    const getUserDisplay = function (user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-avatar'>" +
                Avatar.getCode(user.avatar) + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, UserPanel, OnlineUsersPanel];

    // This function initializes the UI
    const initialize = function () {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();

