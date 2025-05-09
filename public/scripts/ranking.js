const Ranking = (function() {
    const show = function(data) {
        // Fetch the rankings from the server
        fetch("/ranking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ p1Score: data.p1Score, p2Score: data.p2Score, p1Username: data.p1Username, p2Username: data.p2Username })
        })
        .then((res) => res.json())
        .then((json) => {
            if (json.status === "success") {
                const { highestScore, sortedRankings } = json;

                if (data.id === 1) {
                    yourScore = data.p1Score;
                    teammateScore = data.p2Score;
                }
                else {
                    yourScore = data.p2Score;
                    teammateScore = data.p1Score;
                }

                // Display the ranking overlay
                $("#ranking-overlay").remove();
                $("body").append(`
                    <div id="ranking-overlay" class="overlay">
                        <div class="content">
                            <h2>Game Over</h2>
                            <p>Your Score: ${yourScore}</p>
                            <p>Highest Score: ${highestScore}</p>
                            <p>Your Teammate's Score: ${teammateScore}</p>
                            <h3>Rankings</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Username</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sortedRankings.map((player, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${player.username}</td>
                                            <td>${player.score}</td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                            <button id="close-ranking">Close</button>
                        </div>
                    </div>
                `);

                // Close button event
                $("#close-ranking").on("click", () => {
                    $("#ranking-overlay").remove();
                    $("#instructions-panel").show();
                    $("#online-users-panel").show();
                });
            }
        })
        .catch((err) => {
            console.error("Error fetching rankings:", err);
        });
    };

    return { show };
})();