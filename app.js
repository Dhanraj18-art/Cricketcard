/* =========================================================
   KANNALLI CRICKET
   COMPLETE TOURNAMENT ENGINE
   ========================================================= */


/* =========================================================
   DATA
   ========================================================= */

let teams =
    JSON.parse(
        localStorage.getItem(
            "kannalliTeams"
        )
    ) || [];


let players =
    JSON.parse(
        localStorage.getItem(
            "kannalliPlayers"
        )
    ) || [];


let tournament =
    JSON.parse(
        localStorage.getItem(
            "kannalliTournament"
        )
    ) || null;


let currentMatchId =
    localStorage.getItem(
        "kannalliCurrentMatch"
    ) || null;


/* =========================================================
   SAVE
   ========================================================= */

function saveData() {

    localStorage.setItem(
        "kannalliTeams",
        JSON.stringify(teams)
    );

    localStorage.setItem(
        "kannalliPlayers",
        JSON.stringify(players)
    );

    localStorage.setItem(
        "kannalliTournament",
        JSON.stringify(tournament)
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showSection(id) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );

        });


    const section =
        document.getElementById(id);


    if (section) {

        section.classList.add(
            "active"
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   TEAM
   ========================================================= */

function addTeam() {

    const name =
        document
            .getElementById(
                "teamName"
            )
            .value
            .trim();


    const captain =
        document
            .getElementById(
                "captainName"
            )
            .value
            .trim();


    let short =
        document
            .getElementById(
                "teamShort"
            )
            .value
            .trim()
            .toUpperCase();


    if (!name) {

        alert(
            "Enter team name."
        );

        return;

    }


    if (
        teams.some(
            team =>
                team.name.toLowerCase()
                === name.toLowerCase()
        )
    ) {

        alert(
            "Team already exists."
        );

        return;

    }


    if (!short) {

        short =
            name
                .split(" ")
                .map(word =>
                    word[0]
                )
                .join("")
                .substring(0, 4)
                .toUpperCase();

    }


    teams.push({

        id:
            Date.now(),

        name,

        captain,

        short,

        createdAt:
            new Date().toISOString()

    });


    saveData();


    document
        .getElementById(
            "teamName"
        )
        .value = "";


    document
        .getElementById(
            "captainName"
        )
        .value = "";


    document
        .getElementById(
            "teamShort"
        )
        .value = "";


    renderTeams();

    updatePlayerTeamDropdown();

    updateDashboard();

}


/* =========================================================
   DELETE TEAM
   ========================================================= */

function deleteTeam(id) {

    const team =
        teams.find(
            t => t.id === id
        );


    if (!team) return;


    if (
        !confirm(
            `Delete ${team.name}?`
        )
    ) {

        return;

    }


    teams =
        teams.filter(
            t => t.id !== id
        );


    players =
        players.filter(
            p => p.teamId !== id
        );


    saveData();


    renderTeams();

    renderPlayers();

    updatePlayerTeamDropdown();

    updateDashboard();

}


/* =========================================================
   RENDER TEAMS
   ========================================================= */

function renderTeams() {

    const container =
        document.getElementById(
            "teamList"
        );


    document.getElementById(
        "teamCounter"
    ).textContent =
        teams.length;


    if (!teams.length) {

        container.innerHTML = `

            <div class="empty-state">

                No teams registered yet.

            </div>

        `;

        return;

    }


    container.innerHTML =
        teams.map(team => `

            <div class="team-card">

                <div class="team-card-top">

                    <div>

                        <h3>
                            ${escapeHTML(
            team.name
        )}
                        </h3>

                        <p>
                            Captain:
                            ${escapeHTML(
            team.captain ||
            "Not assigned"
        )}
                        </p>

                    </div>

                    <div class="team-short">

                        ${escapeHTML(
            team.short
        )}

                    </div>

                </div>


                <div class="team-actions">

                    <button
                        onclick="
                        viewTeamPlayers(
                            ${team.id}
                        )">

                        PLAYERS

                    </button>


                    <button
                        class="danger"
                        onclick="
                        deleteTeam(
                            ${team.id}
                        )">

                        DELETE

                    </button>

                </div>

            </div>

        `).join("");

}


/* =========================================================
   PLAYER
   ========================================================= */

function addPlayer() {

    const teamId =
        Number(
            document
                .getElementById(
                    "playerTeam"
                )
                .value
        );


    const name =
        document
            .getElementById(
                "playerName"
            )
            .value
            .trim();


    const jersey =
        Number(
            document
                .getElementById(
                    "jerseyNumber"
                )
                .value
        );


    const role =
        document
            .getElementById(
                "playerRole"
            )
            .value;


    const battingStyle =
        document
            .getElementById(
                "battingStyle"
            )
            .value;


    const bowlingStyle =
        document
            .getElementById(
                "bowlingStyle"
            )
            .value;


    if (!teamId) {

        alert(
            "Select a team."
        );

        return;

    }


    if (!name) {

        alert(
            "Enter player name."
        );

        return;

    }


    if (!jersey) {

        alert(
            "Enter jersey number."
        );

        return;

    }


    const playerExists =
        players.some(
            player =>
                player.teamId === teamId &&
                (
                    player.name
                        .toLowerCase()
                    ===
                    name.toLowerCase()
                )
        );


    if (playerExists) {

        alert(
            "Player already exists in this team."
        );

        return;

    }


    const player = {

        id:
            Date.now(),

        teamId,

        name,

        jersey,

        role,

        battingStyle,

        bowlingStyle,


        /* ======================
           BATTING
           ====================== */

        matches: 0,

        innings: 0,

        runs: 0,

        balls: 0,

        fours: 0,

        sixes: 0,

        highestScore: 0,

        notOuts: 0,

        fifties: 0,

        hundreds: 0,


        /* ======================
           BOWLING
           ====================== */

        bowlingInnings: 0,

        ballsBowled: 0,

        runsConceded: 0,

        wickets: 0,

        maidens: 0,

        bestWickets: 0,

        bestRuns: 999,


        /* ======================
           FIELDING
           ====================== */

        catches: 0,

        runOuts: 0,

        stumpings: 0,


        /* ======================
           AWARDS
           ====================== */

        playerOfMatch: 0

    };


    players.push(player);


    saveData();


    clearPlayerForm();

    renderPlayers();

    updateDashboard();

}


/* =========================================================
   CLEAR PLAYER FORM
   ========================================================= */

function clearPlayerForm() {

    document.getElementById(
        "playerName"
    ).value = "";


    document.getElementById(
        "jerseyNumber"
    ).value = "";

}


/* =========================================================
   TEAM DROPDOWN
   ========================================================= */

function updatePlayerTeamDropdown() {

    const select =
        document.getElementById(
            "playerTeam"
        );


    if (!select) return;


    select.innerHTML = `

        <option value="">
            Select Team
        </option>

    `;


    teams.forEach(team => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            team.id;


        option.textContent =
            team.name;


        select.appendChild(
            option
        );

    });

}


/* =========================================================
   PLAYER STATS
   ========================================================= */

function strikeRate(player) {

    if (!player.balls) {

        return "0.00";

    }


    return (
        player.runs /
        player.balls *
        100
    ).toFixed(2);

}


function battingAverage(player) {

    const dismissals =
        player.innings -
        player.notOuts;


    if (dismissals <= 0) {

        return player.runs.toFixed(2);

    }


    return (
        player.runs /
        dismissals
    ).toFixed(2);

}


function economy(player) {

    if (!player.ballsBowled) {

        return "0.00";

    }


    return (
        player.runsConceded /
        (
            player.ballsBowled / 6
        )
    ).toFixed(2);

}


function bowlingAverage(player) {

    if (!player.wickets) {

        return "0.00";

    }


    return (
        player.runsConceded /
        player.wickets
    ).toFixed(2);

}


function bowlingStrikeRate(player) {

    if (!player.wickets) {

        return "0.00";

    }


    return (
        player.ballsBowled /
        player.wickets
    ).toFixed(2);

}


/* =========================================================
   RENDER PLAYERS
   ========================================================= */

function renderPlayers() {

    const container =
        document.getElementById(
            "playerList"
        );


    document.getElementById(
        "playerCounter"
    ).textContent =
        players.length;


    if (!players.length) {

        container.innerHTML = `

            <div class="empty-state">

                No players registered yet.

            </div>

        `;

        return;

    }


    container.innerHTML =
        players.map(player => {

            const team =
                teams.find(
                    team =>
                        team.id ===
                        player.teamId
                );


            return `

                <div class="player-card">


                    <div class="player-top">

                        <div
                            class="player-heading">

                            <div class="jersey">

                                #${player.jersey}

                            </div>


                            <div>

                                <h3>
                                    ${escapeHTML(
                player.name
            )}
                                </h3>

                                <p>
                                    ${escapeHTML(
                team
                    ? team.name
                    : "Unknown"
            )}
                                </p>

                            </div>

                        </div>


                        <span
                            class="role-badge">

                            ${player.role}

                        </span>

                    </div>


                    <div class="player-info">

                        <span>
                            ${player.battingStyle}
                        </span>

                        <span>
                            ${player.bowlingStyle}
                        </span>

                    </div>


                    <div
                        class="player-stats">


                        <div class="player-stat">

                            <strong>
                                ${player.matches}
                            </strong>

                            <small>MATCH</small>

                        </div>


                        <div class="player-stat">

                            <strong>
                                ${player.runs}
                            </strong>

                            <small>RUNS</small>

                        </div>


                        <div class="player-stat">

                            <strong>
                                ${battingAverage(
                player
            )}
                            </strong>

                            <small>AVG</small>

                        </div>


                        <div class="player-stat">

                            <strong>
                                ${strikeRate(
                player
            )}
                            </strong>

                            <small>SR</small>

                        </div>


                        <div class="player-stat">

                            <strong>
                                ${player.fours}
                            </strong>

                            <small>4s</small>

                        </div>


                        <div class="player-stat">

                            <strong>
                                ${player.sixes}
                            </strong>

                            <small>6s</small>

                        </div>


                        <div class="player-stat">

                            <strong>
                                ${player.wickets}
                            </strong>

                            <small>WKTS</small>

                        </div>


                        <div class="player-stat">

                            <strong>
                                ${economy(
                player
            )}
                            </strong>

                            <small>ECO</small>

                        </div>


                    </div>


                    <div class="player-info">

                        <span>
                            HS:
                            ${player.highestScore}
                        </span>

                        <span>
                            50s:
                            ${player.fifties}
                        </span>

                        <span>
                            100s:
                            ${player.hundreds}
                        </span>

                        <span>
                            Catches:
                            ${player.catches}
                        </span>

                        <span>
                            POM:
                            ${player.playerOfMatch}
                        </span>

                    </div>


                </div>

            `;

        }).join("");

}


/* =========================================================
   VIEW TEAM PLAYERS
   ========================================================= */

function viewTeamPlayers(teamId) {

    showSection(
        "players"
    );


    document.getElementById(
        "playerTeam"
    ).value =
        teamId;

}


/* =========================================================
   DIVISION CALCULATION
   ========================================================= */

function calculateDivisions(
    count
) {

    if (count <= 8) {

        return 1;

    }


    if (count <= 16) {

        return 2;

    }


    if (count <= 32) {

        return 4;

    }


    return Math.ceil(
        count / 8
    );

}


/* =========================================================
   DISTRIBUTE TEAMS
   ========================================================= */

function distributeTeams(
    teamArray,
    divisionCount
) {

    const divisions =
        Array.from(
            {
                length:
                    divisionCount
            },
            (_, index) => ({

                id:
                    index + 1,

                name:
                    `Division ${String.fromCharCode(
                        65 + index
                    )
                    }`,

                teams: [],

                matches: [],

                points: []

            })
        );


    teamArray.forEach(
        (team, index) => {

            divisions[
                index %
                divisionCount
            ]
                .teams
                .push(team);

        }
    );


    return divisions;

}


/* =========================================================
   ROUND ROBIN
   ========================================================= */

function generateRoundRobin(
    divisionTeams
) {

    const matches = [];


    for (
        let i = 0;
        i < divisionTeams.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < divisionTeams.length;
            j++
        ) {

            matches.push({

                id:
                    Date.now()
                    +
                    Math.random(),

                teamAId:
                    divisionTeams[i].id,

                teamBId:
                    divisionTeams[j].id,

                teamA:
                    divisionTeams[i].name,

                teamB:
                    divisionTeams[j].name,

                status:
                    "Upcoming",

                result:
                    null

            });

        }

    }


    return matches;

}


/* =========================================================
   GENERATE TOURNAMENT
   ========================================================= */

function generateTournament() {

    if (teams.length < 2) {

        alert(
            "Register at least 2 teams."
        );

        return;

    }


    const mode =
        document.getElementById(
            "divisionMode"
        ).value;


    let divisionCount;


    if (mode === "auto") {

        divisionCount =
            calculateDivisions(
                teams.length
            );

    } else {

        divisionCount =
            Number(
                document.getElementById(
                    "divisionCount"
                ).value
            );


        if (
            divisionCount < 1 ||
            divisionCount > teams.length
        ) {

            alert(
                "Invalid division count."
            );

            return;

        }

    }


    const overs =
        Number(
            document.getElementById(
                "matchOvers"
            ).value
        );


    if (!overs || overs < 1) {

        alert(
            "Enter valid overs."
        );

        return;

    }


    const shuffled =
        [...teams].sort(
            () =>
                Math.random()
                -
                0.5
        );


    const divisions =
        distributeTeams(
            shuffled,
            divisionCount
        );


    divisions.forEach(
        division => {

            division.matches =
                generateRoundRobin(
                    division.teams
                );


            division.points =
                division.teams.map(
                    team => ({

                        teamId:
                            team.id,

                        teamName:
                            team.name,

                        played: 0,

                        wins: 0,

                        losses: 0,

                        ties: 0,

                        noResults: 0,

                        points: 0,

                        runsFor: 0,

                        runsAgainst: 0,

                        ballsFor: 0,

                        ballsAgainst: 0,

                        nrr: 0

                    })
                );

        }
    );


    tournament = {

        overs,

        divisionCount,

        divisions,

        knockout:
            null,

        champion:
            null

    };


    saveData();


    renderTournament();

    renderPointsTables();

    renderMatches();

    updateDashboard();


    alert(
        `${divisionCount} division(s) generated successfully.`
    );

}


/* =========================================================
   RENDER TOURNAMENT
   ========================================================= */

function renderTournament() {

    const container =
        document.getElementById(
            "divisionContainer"
        );


    if (!tournament) {

        container.innerHTML = `

            <div class="card">

                <div class="empty-state">

                    Generate a tournament first.

                </div>

            </div>

        `;


        document.getElementById(
            "knockoutContainer"
        ).innerHTML = "";


        return;

    }


    container.innerHTML =
        tournament.divisions
            .map(
                division => `

                <div class="division-card">


                    <div
                        class="division-header">

                        <h2>
                            ${division.name}
                        </h2>


                        <span
                            class="count-badge">

                            ${division.teams.length}
                            TEAMS

                        </span>

                    </div>


                    <div
                        class="
                        division-team-grid
                        ">

                        ${division.teams
                        .map(
                            team => `

                                    <div
                                        class="
                                        division-team">

                                        ${escapeHTML(
                                team.name
                            )}

                                    </div>

                                `
                        )
                        .join("")
                    }

                    </div>


                    <h3
                        style="
                        margin-bottom:8px;
                        font-size:11px;
                        ">

                        LEAGUE FIXTURES

                    </h3>


                    ${division.matches
                        .map(
                            match => `

                                <div
                                    class="fixture">

                                    <div>

                                        <div
                                            class="
                                            fixture-teams">

                                            ${escapeHTML(
                                match.teamA
                            )}

                                            vs

                                            ${escapeHTML(
                                match.teamB
                            )}

                                        </div>


                                        <div
                                            class="
                                            fixture-meta">

                                            ${match.status}

                                        </div>

                                    </div>


                                    <button
                                        onclick="
                                        openMatch(
                                            '${match.id}'
                                        )">

                                        SCORE

                                    </button>

                                </div>

                            `
                        )
                        .join("")
                    }


                </div>

            `
            )
            .join("");


    renderKnockout();

}


/* =========================================================
   POINTS
   ========================================================= */

function renderPointsTables() {

    const container =
        document.getElementById(
            "pointsContainer"
        );


    if (!tournament) {

        container.innerHTML = `

            <div class="empty-state">

                No tournament generated.

            </div>

        `;

        return;

    }


    container.innerHTML =
        tournament.divisions
            .map(
                division => {

                    const sorted =
                        [...division.points]
                            .sort(
                                (a, b) =>
                                    b.points
                                    -
                                    a.points
                                    ||
                                    b.nrr
                                    -
                                    a.nrr
                            );


                    return `

                        <div
                            style="
                            margin-bottom:20px;
                            ">

                            <h3
                                style="
                                margin-bottom:8px;
                                font-size:12px;
                                ">

                                ${division.name}

                            </h3>


                            <div
                                class="
                                table-wrapper">

                                <table
                                    class="
                                    points-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                POS
                                            </th>

                                            <th>
                                                TEAM
                                            </th>

                                            <th>
                                                P
                                            </th>

                                            <th>
                                                W
                                            </th>

                                            <th>
                                                L
                                            </th>

                                            <th>
                                                T
                                            </th>

                                            <th>
                                                NR
                                            </th>

                                            <th>
                                                PTS
                                            </th>

                                            <th>
                                                NRR
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        ${sorted
                            .map(
                                (
                                    team,
                                    index
                                ) => `

                                                    <tr
                                                        class="
                                                        ${index
                                        <
                                        4
                                        ? "qualified"
                                        : ""
                                    }
                                                        ">

                                                        <td>
                                                            ${index
                                    +
                                    1
                                    }
                                                        </td>

                                                        <td>
                                                            ${escapeHTML(
                                        team.teamName
                                    )
                                    }
                                                        </td>

                                                        <td>
                                                            ${team.played
                                    }
                                                        </td>

                                                        <td>
                                                            ${team.wins
                                    }
                                                        </td>

                                                        <td>
                                                            ${team.losses
                                    }
                                                        </td>

                                                        <td>
                                                            ${team.ties
                                    }
                                                        </td>

                                                        <td>
                                                            ${team.noResults
                                    }
                                                        </td>

                                                        <td>
                                                            ${team.points
                                    }
                                                        </td>

                                                        <td>
                                                            ${team.nrr.toFixed(
                                        3
                                    )
                                    }
                                                        </td>

                                                    </tr>

                                                `
                            )
                            .join("")
                        }

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   QUALIFICATION
   ========================================================= */

function getQualifiedTeams(
    division
) {

    return [...division.points]

        .sort(
            (a, b) =>
                b.points
                -
                a.points
                ||
                b.nrr
                -
                a.nrr
        )

        .slice(
            0,
            4
        );

}


/* =========================================================
   KNOCKOUT
   ========================================================= */

function renderKnockout() {

    const container =
        document.getElementById(
            "knockoutContainer"
        );


    if (!tournament) {

        container.innerHTML = "";

        return;

    }


    container.innerHTML =
        tournament.divisions
            .map(
                division => {

                    const qualified =
                        getQualifiedTeams(
                            division
                        );


                    return `

                        <div
                            class="knockout">


                            <h2>

                                🏆
                                ${division.name}
                                Knockout

                            </h2>


                            <div
                                class="bracket">


                                ${createSemiFinal(
                        "Semi Final 1",
                        qualified[0]
                            ? qualified[0]
                                .teamName
                            : "TBD",
                        qualified[3]
                            ? qualified[3]
                                .teamName
                            : "TBD"
                    )}


                                ${createSemiFinal(
                        "Semi Final 2",
                        qualified[1]
                            ? qualified[1]
                                .teamName
                            : "TBD",
                        qualified[2]
                            ? qualified[2]
                                .teamName
                            : "TBD"
                    )}


                            </div>


                            <div
                                class="final-box">

                                <h2>
                                    🏆 FINAL
                                </h2>


                                <div
                                    class="final-teams">

                                    Winner SF1

                                    <br>

                                    VS

                                    <br>

                                    Winner SF2

                                </div>

                            </div>


                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   SEMIFINAL
   ========================================================= */

function createSemiFinal(
    title,
    teamA,
    teamB
) {

    return `

        <div
            class="match-box">

            <div
                class="match-title">

                ${title}

            </div>


            <div
                class="match-team">

                ${escapeHTML(
        teamA
    )}

            </div>


            <div
                class="match-team">

                ${escapeHTML(
        teamB
    )}

            </div>

        </div>

    `;

}


/* =========================================================
   MATCH LIST
   ========================================================= */

function renderMatches() {

    const container =
        document.getElementById(
            "matchContainer"
        );


    if (!tournament) {

        container.innerHTML = `

            <div class="empty-state">

                No matches available.

            </div>

        `;

        return;

    }


    let html = "";


    tournament.divisions
        .forEach(
            division => {

                html += `

                    <h3
                        style="
                        margin:15px 0 7px;
                        font-size:12px;
                        ">

                        ${division.name}

                    </h3>

                `;


                division.matches
                    .forEach(
                        match => {

                            html += `

                                <div
                                    class="
                                    fixture">

                                    <div>

                                        <div
                                            class="
                                            fixture-teams">

                                            ${escapeHTML(
                                match.teamA
                            )}

                                            vs

                                            ${escapeHTML(
                                match.teamB
                            )}

                                        </div>

                                        <div
                                            class="
                                            fixture-meta">

                                            ${match.status}

                                        </div>

                                    </div>


                                    <button
                                        onclick="
                                        openMatch(
                                            '${match.id}'
                                        )">

                                        OPEN

                                    </button>

                                </div>

                            `;

                        }
                    );

            }
        );


    container.innerHTML =
        html;

}


/* =========================================================
   OPEN MATCH
   ========================================================= */

function openMatch(
    matchId
) {

    currentMatchId =
        String(matchId);


    localStorage.setItem(
        "kannalliCurrentMatch",
        currentMatchId
    );


    showSection(
        "scoring"
    );


    renderScoringArea();

}


/* =========================================================
   SCORING
   ========================================================= */

function renderScoringArea() {

    const container =
        document.getElementById(
            "scoringArea"
        );


    if (!tournament ||
        !currentMatchId) {

        container.innerHTML = `

            <div class="empty-state">

                Select a match from
                Matches.

            </div>

        `;

        return;

    }


    let selectedMatch =
        null;


    tournament.divisions
        .forEach(
            division => {

                division.matches
                    .forEach(
                        match => {

                            if (
                                String(
                                    match.id
                                )
                                ===
                                String(
                                    currentMatchId
                                )
                            ) {

                                selectedMatch =
                                    match;

                            }

                        }
                    );

            }
        );


    if (!selectedMatch) {

        container.innerHTML = `

            <div class="empty-state">

                Match not found.

            </div>

        `;

        return;

    }


    if (!selectedMatch.score) {

        selectedMatch.score = {

            innings: 1,

            runs: 0,

            wickets: 0,

            balls: 0,

            ballsHistory: []

        };

        saveData();

    }


    const score =
        selectedMatch.score;


    const completedOvers =
        Math.floor(
            score.balls / 6
        );


    const ballInOver =
        score.balls % 6;


    const overs =
        `${completedOvers}.${ballInOver}`;


    container.innerHTML = `

        <div
            class="scoreboard">

            <div
                class="score-team">

                ${escapeHTML(
        selectedMatch.teamA
    )}

            </div>


            <div
                class="score">

                ${score.runs}
                /
                ${score.wickets}

            </div>


            <div
                class="score-over">

                Overs:
                ${overs}

            </div>


            <div
                class="score-over">

                Target:
                TBD

            </div>

        </div>


        <div
            class="card"
            style="margin-top:10px;">


            <div
                class="section-title">

                <h2>
                    Current Batters
                </h2>

            </div>


            <div
                class="batsmen-box">

                <div
                    class="batsman active">

                    <span
                        class="batsman-name">

                        Striker

                    </span>

                    <span
                        class="batsman-score">

                        0 (0)

                    </span>

                </div>


                <div
                    class="batsman">

                    <span
                        class="batsman-name">

                        Non-Striker

                    </span>

                    <span
                        class="batsman-score">

                        0 (0)

                    </span>

                </div>

            </div>


            <div
                class="score-controls">


                <div
                    class="run-grid">


                    <button
                        onclick="scoreRun(0)">

                        0

                    </button>


                    <button
                        onclick="scoreRun(1)">

                        1

                    </button>


                    <button
                        onclick="scoreRun(2)">

                        2

                    </button>


                    <button
                        onclick="scoreRun(3)">

                        3

                    </button>


                    <button
                        onclick="scoreRun(4)">

                        4

                    </button>


                    <button
                        onclick="scoreRun(6)">

                        6

                    </button>


                </div>


                <div
                    class="scoring-actions">


                    <button
                        onclick="scoreExtra('wide')">

                        WIDE

                    </button>


                    <button
                        onclick="scoreExtra('no-ball')">

                        NO BALL

                    </button>


                    <button
                        onclick="scoreExtra('bye')">

                        BYE

                    </button>


                    <button
                        onclick="scoreExtra('leg-bye')">

                        LEG BYE

                    </button>


                    <button
                        class="wicket"
                        onclick="scoreWicket()">

                        WICKET

                    </button>


                    <button
                        onclick="undoBall()">

                        UNDO

                    </button>


                    <button
                        onclick="completeMatch()">

                        END MATCH

                    </button>


                </div>


            </div>


            <div
                class="ball-history">

                ${score.ballsHistory
            .map(
                ball => `

                            <div
                                class="ball">

                                ${ball}

                            </div>

                        `
            )
            .join("")
        }

            </div>


        </div>

    `;

}


/* =========================================================
   SCORE RUN
   ========================================================= */

function scoreRun(
    runs
) {

    const match =
        findCurrentMatch();


    if (!match) return;


    if (!match.score) {

        match.score = {

            innings: 1,

            runs: 0,

            wickets: 0,

            balls: 0,

            ballsHistory: []

        };

    }


    match.score.runs +=
        Number(runs);


    match.score.balls++;


    match.score.ballsHistory
        .push(
            String(runs)
        );


    match.status =
        "Live";


    saveData();


    renderScoringArea();

    renderMatches();

    updateDashboard();

}


/* =========================================================
   EXTRAS
   ========================================================= */

function scoreExtra(
    type
) {

    const match =
        findCurrentMatch();


    if (!match) return;


    if (!match.score) {

        return;

    }


    if (type === "wide") {

        match.score.runs++;

        match.score.ballsHistory
            .push("Wd");


    } else if (
        type === "no-ball"
    ) {

        match.score.runs++;

        match.score.ballsHistory
            .push("Nb");


    } else {

        match.score.balls++;

        match.score.ballsHistory
            .push(
                type === "bye"
                    ? "B"
                    : "Lb"
            );

    }


    match.status =
        "Live";


    saveData();


    renderScoringArea();

}


/* =========================================================
   WICKET
   ========================================================= */

function scoreWicket() {

    const match =
        findCurrentMatch();


    if (!match) return;


    match.score.wickets++;

    match.score.balls++;

    match.score.ballsHistory
        .push("W");


    match.status =
        "Live";


    saveData();


    renderScoringArea();

}


/* =========================================================
   UNDO
   ========================================================= */

function undoBall() {

    const match =
        findCurrentMatch();


    if (!match ||
        !match.score ||
        !match.score.ballsHistory.length) {

        return;

    }


    const last =
        match.score.ballsHistory.pop();


    if (
        ["Wd", "Nb"].includes(
            last
        )
    ) {

        match.score.runs--;

    } else {

        match.score.balls--;

    }


    if (last === "W") {

        match.score.wickets--;

    }


    saveData();


    renderScoringArea();

}


/* =========================================================
   COMPLETE MATCH
   ========================================================= */

function completeMatch() {

    const match =
        findCurrentMatch();


    if (!match) return;


    if (
        !confirm(
            "Complete this match?"
        )
    ) {

        return;

    }


    match.status =
        "Completed";


    match.result = {

        runs:
            match.score.runs,

        wickets:
            match.score.wickets

    };


    saveData();


    renderScoringArea();

    renderMatches();

    updateDashboard();


    alert(
        "Match completed."
    );

}


/* =========================================================
   FIND MATCH
   ========================================================= */

function findCurrentMatch() {

    if (!tournament ||
        !currentMatchId) {

        return null;

    }


    for (
        const division
        of tournament.divisions
    ) {

        const match =
            division.matches.find(
                match =>
                    String(
                        match.id
                    )
                    ===
                    String(
                        currentMatchId
                    )
            );


        if (match) {

            return match;

        }

    }


    return null;

}


/* =========================================================
   MANUAL DIVISION UI
   ========================================================= */

function toggleManualDivision() {

    const mode =
        document.getElementById(
            "divisionMode"
        ).value;


    const box =
        document.getElementById(
            "manualDivisionBox"
        );


    if (mode === "manual") {

        box.classList.remove(
            "hidden"
        );

    } else {

        box.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    document.getElementById(
        "totalTeams"
    ).textContent =
        teams.length;


    document.getElementById(
        "totalPlayers"
    ).textContent =
        players.length;


    document.getElementById(
        "totalDivisions"
    ).textContent =
        tournament
            ? tournament.divisions.length
            : 0;


    let totalMatches = 0;

    let completed = 0;


    if (tournament) {

        tournament.divisions
            .forEach(
                division => {

                    totalMatches +=
                        division.matches.length;


                    completed +=
                        division.matches
                            .filter(
                                match =>
                                    match.status
                                    ===
                                    "Completed"
                            )
                            .length;

                }
            );

    }


    document.getElementById(
        "totalMatches"
    ).textContent =
        totalMatches;


    document.getElementById(
        "completedMatches"
    ).textContent =
        completed;


    document.getElementById(
        "upcomingMatches"
    ).textContent =
        totalMatches -
        completed;


    document.getElementById(
        "championName"
    ).textContent =
        tournament &&
            tournament.champion
            ? tournament.champion
            : "TBD";

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function init() {

    renderTeams();

    renderPlayers();

    updatePlayerTeamDropdown();

    toggleManualDivision();

    renderTournament();

    renderPointsTables();

    renderMatches();

    updateDashboard();

}


init();