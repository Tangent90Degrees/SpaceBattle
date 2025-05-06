const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
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

                    Socket.connect();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const avatar   = $("#register-avatar").val();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, avatar, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    // This function shows the form
    const show = function() {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const UserPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                    SignInForm.show();
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        }
        else {
            $("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const OnlineUsersPanel = (function() {
    // This function initializes the UI
    const initialize = function() {};

    // This function updates the online users panel
    const update = function(onlineUsers) {
        const onlineUsersArea = $("#online-users-area");

        // Clear the online users area
        onlineUsersArea.empty();

		// Get the current user
        const currentUser = Authentication.getUser();

        // Add the user one-by-one
        for (const username in onlineUsers) {
            if (username != currentUser.username) {
                onlineUsersArea.append(
                    $("<div id='username-" + username + "'></div>")
                        .append(UI.getUserDisplay(onlineUsers[username]))
                        .append($("<button class='invite-button'>Invite</button>").data("user", JSON.stringify(onlineUsers[username])))
                );
            }
        }
    };

    // This function adds a user in the panel
	const addUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Add the user
		if (userDiv.length == 0) {
			onlineUsersArea.append(
				$("<div id='username-" + user.username + "'></div>")
					.append(UI.getUserDisplay(user))
                    .append($("<button class='invite-button'>Invite</button>").data("user", JSON.stringify(user)))
			);
		}
	};

    // This function removes a user from the panel
	const removeUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
	};

    $(document).on("click", ".invite-button", function() {
        const invitedUser = JSON.parse($(this).data("user"));
        console.log("Inviting user: ", invitedUser.username);
        Socket.sendInvite(Authentication.getUser(), invitedUser);
    });

    // Handle accept button click
    $(document).on("click", "#accept-invite", function() {
        const inviter = $(this).data("inviter");
        Socket.acceptInvite(inviter);
        $("#invite-overlay").hide();
        startCountdown(2);
    });

    // Handle decline button click
    $(document).on("click", "#decline-invite", function() {
        const inviter = $(this).data("inviter");
        Socket.declineInvite(inviter);
        $("#invite-overlay").hide();
    });

    $(document).on("click", "#decline-notification-ok", function() {
        $("#decline-notification-overlay").fadeOut(500);
    });

    // This function shows the online user panel
    const show = function(user) {
        $("#online-users-panel").show();
    };

    // This function hides the online user panel
    const hide = function() {
        $("#online-users-panel").fadeOut(500);
    };

    // This function shows the invite overlay
    const showInvite = function(inviter) {
        $("#invite-message").text(`${inviter.name} has invited you to play.`);
        $("#accept-invite").data("inviter", inviter);
        $("#decline-invite").data("inviter", inviter);
        $("#invite-overlay").fadeIn(500);
    };

    // This function shows the decline invite overlay
    const showDeclineInvite = function() {
        $("#decline-notification-overlay").fadeIn(500);
    }

    // This function starts the countdown before the game
    const startCountdown = function(playerId) {
        let countdown = 5;
        $("#countdown").text(countdown);
        $("#countdown-overlay").fadeIn(500);

        const interval = setInterval(() => {
            countdown--;
            $("#countdown").text(countdown);

            if (countdown <= 0) {
                clearInterval(interval);
                $("#countdown-overlay").fadeOut(500);
                // Transition to the game screen (to be implemented)
                Game.startGame(playerId);
            }
        }, 1000);
    };

    return { initialize, update, addUser, removeUser, show, hide, showInvite, showDeclineInvite, startCountdown };
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-avatar'>" +
			        Avatar.getCode(user.avatar) + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, UserPanel, OnlineUsersPanel];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();
