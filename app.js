/* ============================================================
   KANNALLI CRICKET TOURNAMENT MANAGEMENT SYSTEM
   ============================================================ */

let teams = JSON.parse(localStorage.getItem("kc_teams")) || [];
let players = JSON.parse(localStorage.getItem("kc_players")) || [];
let tournament = JSON.parse(localStorage.getItem("kc_tournament")) || {
    overs: 10,
    divisions: [],
    matches: []
};

let completedMatches =
    JSON.parse(localStorage.getItem("kc_completed_matches")) || [];

let liveMatch =
    JSON.parse(localStorage.getItem("kc_live_match")) || null;


/* ============================================================
   STORAGE
   ============================================================ */

function saveAll() {
    localStorage.setItem("kc_teams", JSON.stringify(teams));
    localStorage.setItem("kc_players", JSON.stringify(players));
    localStorage.setItem("kc_tournament", JSON.stringify(tournament));
    localStorage.setItem(
        "kc_completed_matches",
        JSON.stringify(completedMatches)
    );

    if (liveMatch) {
        localStorage.setItem(
            "kc_live_match",
            JSON.stringify(liveMatch)
        );
    } else {
        localStorage.removeItem("kc_live_match");
    }
}


/* ============================================================
   NAVIGATION
   ============================================================ */

function showPage(page) {

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    const target = document.getElementById(page);

    if (target) {
        target.classList.add("active");
    }

    if (page === "dashboard") renderDashboard();
    if (page === "teams") renderTeams();
    if (page === "players") renderPlayers();
    if (page === "tournament") renderTournament();
    if (page === "points") renderPointsTables();
    if (page === "matches") renderMatches();
    if (page === "stats") renderStatistics();
    if (page === "scorer") initializeScorer();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function toggleMenu() {
    document.getElementById("mainNav").classList.toggle("mobile-open");
}


/* ============================================================
   DASHBOARD
   ============================================================ */

function renderDashboard() {

    document.getElementById("dashTeams").textContent =
        teams.length;

    document.getElementById("dashPlayers").textContent =
        players.length;

    document.getElementById("dashMatches").textContent =
        completedMatches.length + (tournament.matches || []).length;

    document.getElementById("dashCompleted").textContent =
        completedMatches.length;
}


/* ============================================================
   TEAMS
   ============================================================ */

function addTeam() {

    const name =
        document.getElementById("teamName").value.trim();

    const short =
        document.getElementById("teamShort").value.trim().toUpperCase();

    const captain =
        document.getElementById("teamCaptain").value.trim();

    if (!name) {
        alert("Enter team name");
        return;
    }

    const team = {
        id: "T" + Date.now(),
        name,
        short: short || name.substring(0, 3).toUpperCase(),
        captain: captain || "-",
        createdAt: new Date().toISOString()
    };

    teams.push(team);

    saveAll();

    document.getElementById("teamName").value = "";
    document.getElementById("teamShort").value = "";
    document.getElementById("teamCaptain").value = "";

    renderTeams();
    updateTeamSelects();

    alert("Team registered successfully");
}


function deleteTeam(id) {

    const hasPlayers =
        players.some(p => p.teamId === id);

    if (hasPlayers) {
        alert(
            "This team has players. Delete the players first."
        );
        return;
    }

    if (!confirm("Delete this team?")) return;

    teams = teams.filter(t => t.id !== id);

    saveAll();

    renderTeams();
    updateTeamSelects();
}


function renderTeams() {

    const container =
        document.getElementById("teamList");

    if (!teams.length) {

        container.innerHTML =
            `<div class="form-card">
                <p class="muted">No teams registered yet.</p>
             </div>`;

        return;
    }

    container.innerHTML = teams.map(team => {

        const count =
            players.filter(p => p.teamId === team.id).length;

        return `
        <div class="team-card">

            <div class="team-header">

                <div class="team-short">
                    ${escapeHTML(team.short)}
                </div>

                <div style="flex:1">

                    <h3>
                        ${escapeHTML(team.name)}
                    </h3>

                    <p class="muted small">
                        Captain: ${escapeHTML(team.captain)}
                    </p>

                    <p class="muted small">
                        Players: ${count}
                    </p>

                </div>

                <button
                    class="delete-btn"
                    onclick="deleteTeam('${team.id}')">
                    Delete
                </button>

            </div>

        </div>`;
    }).join("");
}


/* ============================================================
   PLAYERS
   ============================================================ */

function addPlayer() {

    const teamId =
        document.getElementById("playerTeam").value;

    const name =
        document.getElementById("playerName").value.trim();

    const jersey =
        document.getElementById("jersey").value;

    const role =
        document.getElementById("playerRole").value;

    const batting =
        document.getElementById("battingStyle").value;

    const bowling =
        document.getElementById("bowlingStyle").value;

    if (!teamId) {
        alert("Select a team");
        return;
    }

    if (!name) {
        alert("Enter player name");
        return;
    }

    const player = {

        id: "P" + Date.now(),

        teamId,

        name,

        jersey,

        role,

        battingStyle: batting,

        bowlingStyle: bowling,

        stats: {
            matches: 0,
            innings: 0,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            highest: 0,
            fifties: 0,
            hundreds: 0,
            notOuts: 0,

            bowlingInnings: 0,
            ballsBowled: 0,
            runsConceded: 0,
            wickets: 0,
            maidens: 0,
            catches: 0,
            runouts: 0,
            stumpings: 0,
            playerOfMatch: 0
        }

    };

    players.push(player);

    saveAll();

    document.getElementById("playerName").value = "";
    document.getElementById("jersey").value = "";

    renderPlayers();

    alert("Player registered");
}


function deletePlayer(id) {

    if (!confirm("Delete player?")) return;

    players =
        players.filter(p => p.id !== id);

    saveAll();

    renderPlayers();
}


function renderPlayers() {

    const container =
        document.getElementById("playerList");

    if (!players.length) {

        container.innerHTML =
            `<div class="form-card">
                <p class="muted">No players registered.</p>
             </div>`;

        return;
    }

    container.innerHTML = players.map(p => {

        const team =
            teams.find(t => t.id === p.teamId);

        return `
        <div class="player-card">

            <div class="player-header">

                <div>

                    <h3>
                        ${escapeHTML(p.name)}
                    </h3>

                    <p class="muted small">
                        ${team ? escapeHTML(team.name) : ""}
                    </p>

                </div>

                <button
                    class="delete-btn"
                    onclick="deletePlayer('${p.id}')">
                    Delete
                </button>

            </div>

            <hr style="border-color:#29313d;margin:12px 0">

            <p class="small">
                Jersey: <b>#${escapeHTML(p.jersey || "-")}</b>
            </p>

            <p class="small">
                Role: <b>${escapeHTML(p.role)}</b>
            </p>

            <p class="small">
                Batting: ${escapeHTML(p.battingStyle)}
            </p>

            <p class="small">
                Bowling: ${escapeHTML(p.bowlingStyle)}
            </p>

            <div style="margin-top:12px">

                <b>${p.stats.runs}</b> Runs

                &nbsp; | &nbsp;

                <b>${p.stats.wickets}</b> Wickets

            </div>

        </div>`;
    }).join("");
}


function updateTeamSelects() {

    const ids = [
        "playerTeam",
        "matchTeamA",
        "matchTeamB"
    ];

    ids.forEach(id => {

        const select =
            document.getElementById(id);

        if (!select) return;

        const old = select.value;

        select.innerHTML =
            `<option value="">Select Team</option>` +
            teams.map(t =>
                `<option value="${t.id}">
                    ${escapeHTML(t.name)}
                </option>`
            ).join("");

        if (old) select.value = old;
    });
}


/* ============================================================
   TOURNAMENT DIVISIONS
   ============================================================ */

function divisionModeChanged() {

    const mode =
        document.getElementById("divisionMode").value;

    document
        .getElementById("manualDivisionBox")
        .classList.toggle(
            "hidden",
            mode !== "manual"
        );
}


function calculateDivisionCount() {

    if (teams.length <= 8) return 1;
    if (teams.length <= 16) return 2;
    if (teams.length <= 32) return 4;

    return Math.ceil(teams.length / 8);
}


function generateTournament() {

    if (teams.length < 2) {
        alert("Register at least 2 teams");
        return;
    }

    const overs =
        parseInt(
            document.getElementById("tournamentOvers").value
        );

    const mode =
        document.getElementById("divisionMode").value;

    let divisionCount;

    if (mode === "manual") {

        divisionCount =
            parseInt(
                document.getElementById("manualDivisions").value
            );

        if (
            !divisionCount ||
            divisionCount < 1 ||
            divisionCount > teams.length
        ) {
            alert("Invalid division count");
            return;
        }

    } else {

        divisionCount =
            calculateDivisionCount();

    }

    const distributed =
        distributeTeams(teams, divisionCount);

    tournament = {
        overs,
        divisions: [],
        matches: []
    };

    distributed.forEach((teamGroup, index) => {

        const matches =
            generateRoundRobin(teamGroup);

        tournament.divisions.push({

            id: "D" + (index + 1),

            name: "Division " + (index + 1),

            teamIds:
                teamGroup.map(t => t.id),

            matches,

            table:
                teamGroup.map(t => ({
                    teamId: t.id,
                    played: 0,
                    won: 0,
                    lost: 0,
                    tied: 0,
                    nr: 0,
                    points: 0,
                    runsFor: 0,
                    ballsFor: 0,
                    runsAgainst: 0,
                    ballsAgainst: 0,
                    nrr: 0
                }))

        });

        tournament.matches.push(...matches);

    });

    saveAll();

    renderTournament();
    renderPointsTables();
    renderMatches();

    alert(
        `Tournament generated with ${divisionCount} division(s).`
    );
}


function distributeTeams(allTeams, count) {

    const result =
        Array.from(
            { length: count },
            () => []
        );

    allTeams.forEach((team, index) => {

        result[index % count].push(team);

    });

    return result;
}


function generateRoundRobin(teamGroup) {

    const matches = [];

    let matchNumber = 1;

    for (let i = 0; i < teamGroup.length; i++) {

        for (
            let j = i + 1;
            j < teamGroup.length;
            j++
        ) {

            matches.push({

                id:
                    "M" +
                    Date.now() +
                    "_" +
                    Math.random()
                        .toString(36)
                        .substring(2, 8),

                teamA: teamGroup[i].id,

                teamB: teamGroup[j].id,

                division:
                    null,

                status: "Scheduled",

                result: null

            });

            matchNumber++;

        }

    }

    return matches;
}


/* ============================================================
   TOURNAMENT DISPLAY
   ============================================================ */

function renderTournament() {

    const container =
        document.getElementById("divisionContainer");

    if (!tournament.divisions.length) {

        container.innerHTML =
            `<div class="form-card">
                <p class="muted">
                    Generate the tournament to see divisions.
                </p>
             </div>`;

        return;
    }

    container.innerHTML =
        tournament.divisions.map(div => {

            return `
            <div class="division-card">

                <div class="division-title">

                    <h3>${div.name}</h3>

                    <span>
                        ${div.teamIds.length} Teams
                    </span>

                </div>

                <div class="table-scroll">

                    <table class="points-table">

                        <thead>
                            <tr>
                                <th>Team</th>
                                <th>P</th>
                                <th>W</th>
                                <th>L</th>
                                <th>T</th>
                                <th>NR</th>
                                <th>PTS</th>
                                <th>NRR</th>
                            </tr>
                        </thead>

                        <tbody>

                        ${getSortedTable(div)
                    .map((row, index) => {

                        const team =
                            teams.find(
                                t =>
                                    t.id === row.teamId
                            );

                        return `
                                <tr>

                                    <td>
                                        <b>
                                            ${index + 1}.
                                            ${team
                                ? escapeHTML(team.name)
                                : ""}
                                        </b>
                                    </td>

                                    <td>${row.played}</td>
                                    <td>${row.won}</td>
                                    <td>${row.lost}</td>
                                    <td>${row.tied}</td>
                                    <td>${row.nr}</td>

                                    <td class="qualify">
                                        ${row.points}
                                    </td>

                                    <td>
                                        ${row.nrr.toFixed(3)}
                                    </td>

                                </tr>`;
                    }).join("")}

                        </tbody>

                    </table>

                </div>

            </div>`;

        }).join("");

    renderKnockout();
}


function renderKnockout() {

    const container =
        document.getElementById("knockoutContainer");

    if (!tournament.divisions.length) {
        container.innerHTML = "";
        return;
    }

    let html = `
        <div class="page-title">
            <h2>Knockout Stage</h2>
        </div>
    `;

    if (tournament.divisions.length === 1) {

        const div = tournament.divisions[0];

        const qualified =
            getQualifiedTeams(div);

        html += `
        <div class="knockout">

            <div class="knockout-round">

                <h3>SEMIFINAL 1</h3>

                <div class="knockout-match">
                    ${teamName(qualified[0])}
                    <br>
                    vs
                    <br>
                    ${teamName(qualified[3])}
                </div>

            </div>

            <div class="knockout-round">

                <h3>SEMIFINAL 2</h3>

                <div class="knockout-match">
                    ${teamName(qualified[1])}
                    <br>
                    vs
                    <br>
                    ${teamName(qualified[2])}
                </div>

            </div>

            <div class="knockout-round">

                <h3>FINAL</h3>

                <div class="knockout-match">
                    Winner SF1
                    <br>
                    vs
                    <br>
                    Winner SF2
                </div>

            </div>

        </div>`;
    }

    container.innerHTML = html;
}


function getQualifiedTeams(div) {

    return getSortedTable(div)
        .slice(0, 4)
        .map(row => row.teamId);
}


function teamName(id) {

    const team =
        teams.find(t => t.id === id);

    return team
        ? escapeHTML(team.name)
        : "TBD";
}


/* ============================================================
   POINTS
   ============================================================ */

function renderPointsTables() {

    const container =
        document.getElementById("pointsContainer");

    if (!tournament.divisions.length) {

        container.innerHTML =
            `<div class="form-card">
                <p class="muted">
                    No tournament generated.
                </p>
             </div>`;

        return;
    }

    container.innerHTML =
        tournament.divisions.map(div => {

            return `
            <div class="division-card">

                <div class="division-title">

                    <h3>${div.name}</h3>

                    <span>Top 4 qualify</span>

                </div>

                <div class="table-scroll">

                <table class="points-table">

                    <thead>

                        <tr>
                            <th>Team</th>
                            <th>P</th>
                            <th>W</th>
                            <th>L</th>
                            <th>T</th>
                            <th>NR</th>
                            <th>PTS</th>
                            <th>NRR</th>
                        </tr>

                    </thead>

                    <tbody>

                    ${getSortedTable(div)
                    .map(row => {

                        const team =
                            teams.find(
                                t =>
                                    t.id === row.teamId
                            );

                        return `
                            <tr>

                                <td>
                                    ${team
                                ? escapeHTML(team.name)
                                : ""}
                                </td>

                                <td>${row.played}</td>
                                <td>${row.won}</td>
                                <td>${row.lost}</td>
                                <td>${row.tied}</td>
                                <td>${row.nr}</td>
                                <td><b>${row.points}</b></td>
                                <td>${row.nrr.toFixed(3)}</td>

                            </tr>`;
                    }).join("")}

                    </tbody>

                </table>

                </div>

            </div>`;
        }).join("");
}


function getSortedTable(div) {

    return [...div.table].sort((a, b) => {

        if (b.points !== a.points) {
            return b.points - a.points;
        }

        return b.nrr - a.nrr;

    });
}


/* ============================================================
   MATCHES
   ============================================================ */

function renderMatches() {

    const container =
        document.getElementById("matchContainer");

    const matches =
        tournament.matches || [];

    if (!matches.length) {

        container.innerHTML =
            `<div class="form-card">
                <p class="muted">
                    No matches available.
                </p>
             </div>`;

        return;
    }

    container.innerHTML =
        matches.map(match => {

            const teamA =
                teams.find(t => t.id === match.teamA);

            const teamB =
                teams.find(t => t.id === match.teamB);

            return `
            <div class="match-card">

                <div class="match-header">

                    <div>

                        <p class="muted small">
                            ${match.status}
                        </p>

                        <h3>
                            ${teamA
                    ? escapeHTML(teamA.name)
                    : ""}
                            vs
                            ${teamB
                    ? escapeHTML(teamB.name)
                    : ""}
                        </h3>

                    </div>

                    <button
                        class="primary-btn"
                        onclick="loadMatchIntoScorer(
                            '${match.teamA}',
                            '${match.teamB}'
                        )">
                        Score
                    </button>

                </div>

            </div>`;
        }).join("");
}


function loadMatchIntoScorer(a, b) {

    showPage("scorer");

    setTimeout(() => {

        document.getElementById("matchTeamA").value = a;
        document.getElementById("matchTeamB").value = b;

        updateXISelectors();

    }, 100);

}


/* ============================================================
   SCORER INITIALIZATION
   ============================================================ */

function initializeScorer() {

    updateTeamSelects();

    if (liveMatch) {

        document
            .getElementById("matchSetup")
            .classList.add("hidden");

        document
            .getElementById("playerSelectionPanel")
            .classList.add("hidden");

        document
            .getElementById("liveScorer")
            .classList.remove("hidden");

        renderLiveScorer();

        return;
    }

    document
        .getElementById("matchSetup")
        .classList.remove("hidden");

    document
        .getElementById("playerSelectionPanel")
        .classList.add("hidden");

    document
        .getElementById("liveScorer")
        .classList.add("hidden");

    updateXISelectors();
}


document
    .getElementById("matchTeamA")
    .addEventListener("change", updateXISelectors);

document
    .getElementById("matchTeamB")
    .addEventListener("change", updateXISelectors);


function updateXISelectors() {

    const teamA =
        document.getElementById("matchTeamA").value;

    const teamB =
        document.getElementById("matchTeamB").value;

    const xiA =
        document.getElementById("xiA");

    const xiB =
        document.getElementById("xiB");

    if (!teamA || !teamB) {

        xiA.innerHTML =
            `<p class="muted">Select Team A.</p>`;

        xiB.innerHTML =
            `<p class="muted">Select Team B.</p>`;

        return;
    }

    renderXI(teamA, xiA, "A");
    renderXI(teamB, xiB, "B");
}


function renderXI(teamId, container, prefix) {

    const teamPlayers =
        players.filter(
            p => p.teamId === teamId
        );

    if (!teamPlayers.length) {

        container.innerHTML =
            `<p class="muted">
                No players registered for this team.
            </p>`;

        return;
    }

    container.innerHTML =
        teamPlayers.map(p => {

            return `
            <label class="player-check">

                <input
                    type="checkbox"
                    class="xi-${prefix}"
                    value="${p.id}"
                >

                <span>
                    #${escapeHTML(p.jersey || "-")}
                    ${escapeHTML(p.name)}
                    <small class="muted">
                        ${escapeHTML(p.role)}
                    </small>
                </span>

            </label>`;
        }).join("");
}


/* ============================================================
   PREPARE MATCH
   ============================================================ */

function prepareMatch() {

    const teamA =
        document.getElementById("matchTeamA").value;

    const teamB =
        document.getElementById("matchTeamB").value;

    const overs =
        parseInt(
            document.getElementById("matchOvers").value
        );

    if (!teamA || !teamB) {
        alert("Select both teams");
        return;
    }

    if (teamA === teamB) {
        alert("Teams must be different");
        return;
    }

    if (!overs || overs < 1) {
        alert("Enter valid overs");
        return;
    }

    const selectedA =
        [...document.querySelectorAll(".xi-A:checked")]
            .map(x => x.value);

    const selectedB =
        [...document.querySelectorAll(".xi-B:checked")]
            .map(x => x.value);

    if (selectedA.length < 2) {
        alert("Select at least 2 players for Team A");
        return;
    }

    if (selectedB.length < 2) {
        alert("Select at least 2 players for Team B");
        return;
    }

    if (selectedA.length > 11 || selectedB.length > 11) {
        alert("Maximum 11 players allowed");
        return;
    }

    const teamAPlayers =
        selectedA.map(id =>
            players.find(p => p.id === id)
        );

    const teamBPlayers =
        selectedB.map(id =>
            players.find(p => p.id === id)
        );

    const battingPlayers =
        teamAPlayers;

    const bowlingPlayers =
        teamBPlayers;

    document
        .getElementById("openingStriker")
        .innerHTML =
        battingPlayers.map(p =>
            `<option value="${p.id}">
                ${escapeHTML(p.name)}
            </option>`
        ).join("");

    document
        .getElementById("openingNonStriker")
        .innerHTML =
        battingPlayers.map(p =>
            `<option value="${p.id}">
                ${escapeHTML(p.name)}
            </option>`
        ).join("");

    document
        .getElementById("openingBowler")
        .innerHTML =
        bowlingPlayers.map(p =>
            `<option value="${p.id}">
                ${escapeHTML(p.name)}
            </option>`
        ).join("");

    if (battingPlayers.length > 1) {
        document.getElementById("openingNonStriker").value =
            battingPlayers[1].id;
    }

    document
        .getElementById("playerSelectionPanel")
        .classList.remove("hidden");
}


/* ============================================================
   START LIVE MATCH
   ============================================================ */

function startLiveMatch() {

    const striker =
        document.getElementById("openingStriker").value;

    const nonStriker =
        document.getElementById("openingNonStriker").value;

    const bowler =
        document.getElementById("openingBowler").value;

    if (!striker || !nonStriker || !bowler) {
        alert("Select striker, non-striker and bowler");
        return;
    }

    if (striker === nonStriker) {
        alert("Striker and non-striker must be different");
        return;
    }

    const teamA =
        document.getElementById("matchTeamA").value;

    const teamB =
        document.getElementById("matchTeamB").value;

    const overs =
        parseInt(
            document.getElementById("matchOvers").value
        );

    const battingPlayers =
        [...document.querySelectorAll(".xi-A:checked")]
            .map(x => x.value);

    const bowlingPlayers =
        [...document.querySelectorAll(".xi-B:checked")]
            .map(x => x.value);

    liveMatch = {

        id: "LM" + Date.now(),

        teamA,
        teamB,

        oversLimit: overs,

        innings: 1,

        inningsData: [
            createInnings(
                teamA,
                teamB,
                battingPlayers,
                bowlingPlayers,
                striker,
                nonStriker,
                bowler
            )
        ],

        completed: false,

        currentBallSnapshots: []

    };

    saveAll();

    document
        .getElementById("matchSetup")
        .classList.add("hidden");

    document
        .getElementById("playerSelectionPanel")
        .classList.add("hidden");

    document
        .getElementById("liveScorer")
        .classList.remove("hidden");

    renderLiveScorer();
}


/* ============================================================
   INNINGS CREATION
   ============================================================ */

function createInnings(
    battingTeam,
    bowlingTeam,
    battingXI,
    bowlingXI,
    striker,
    nonStriker,
    bowler
) {

    const batsmen = {};

    battingXI.forEach(id => {

        batsmen[id] = {
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            out: false,
            dismissal: "not out",
            active: false
        };

    });

    const bowlers = {};

    bowlingXI.forEach(id => {

        bowlers[id] = {
            balls: 0,
            runs: 0,
            wickets: 0,
            maidens: 0
        };

    });

    batsmen[striker].active = true;
    batsmen[nonStriker].active = true;

    return {

        battingTeam,
        bowlingTeam,

        battingXI,
        bowlingXI,

        runs: 0,
        wickets: 0,

        legalBalls: 0,

        striker,
        nonStriker,
        bowler,

        batsmen,
        bowlers,

        extras: {
            wides: 0,
            noBalls: 0,
            byes: 0,
            legByes: 0
        },

        balls: [],

        currentOver: [],

        fallOfWickets: [],

        partnerships: [],

        partnershipRuns: 0,

        partnershipBalls: 0,

        target: null,

        waitingForBatsman: false,

        waitingForBowler: false,

        inningsComplete: false
    };
}


/* ============================================================
   CURRENT INNINGS
   ============================================================ */

function currentInnings() {

    if (!liveMatch) return null;

    return liveMatch.inningsData[
        liveMatch.innings - 1
    ];
}


/* ============================================================
   LIVE SCORE DISPLAY
   ============================================================ */

function renderLiveScorer() {

    const inn =
        currentInnings();

    if (!inn) return;

    const team =
        teams.find(t => t.id === inn.battingTeam);

    const striker =
        players.find(p => p.id === inn.striker);

    const nonStriker =
        players.find(p => p.id === inn.nonStriker);

    const bowler =
        players.find(p => p.id === inn.bowler);

    document.getElementById("liveBattingTeam")
        .textContent =
        team ? team.name : "";

    document.getElementById("liveRuns")
        .textContent = inn.runs;

    document.getElementById("liveWickets")
        .textContent = inn.wickets;

    document.getElementById("liveOvers")
        .textContent =
        formatOvers(inn.legalBalls);

    const rr =
        inn.legalBalls
            ? (inn.runs / (inn.legalBalls / 6))
            : 0;

    document.getElementById("liveRR")
        .textContent =
        rr.toFixed(2);

    document.getElementById("liveStriker")
        .textContent =
        striker ? striker.name : "-";

    document.getElementById("liveNonStriker")
        .textContent =
        nonStriker ? nonStriker.name : "-";

    document.getElementById("liveBowler")
        .textContent =
        bowler ? bowler.name : "-";

    const s =
        inn.batsmen[inn.striker] || {};

    const ns =
        inn.batsmen[inn.nonStriker] || {};

    const b =
        inn.bowlers[inn.bowler] || {};

    document.getElementById("strikerRuns")
        .textContent = s.runs || 0;

    document.getElementById("strikerBalls")
        .textContent = s.balls || 0;

    document.getElementById("nonStrikerRuns")
        .textContent = ns.runs || 0;

    document.getElementById("nonStrikerBalls")
        .textContent = ns.balls || 0;

    document.getElementById("bowlerFigures")
        .textContent =
        `${b.wickets || 0}/${b.runs || 0}`;

    document.getElementById("bowlerOvers")
        .textContent =
        formatOvers(b.balls || 0);

    document.getElementById("overNumber")
        .textContent =
        `Over ${Math.floor(inn.legalBalls / 6) + 1}`;

    renderCurrentOver();

    if (inn.waitingForBatsman) {
        showNewBatsmanPanel();
    } else {
        document
            .getElementById("newBatsmanPanel")
            .classList.add("hidden");
    }

    if (inn.waitingForBowler) {
        showNewBowlerPanel();
    } else {
        document
            .getElementById("newBowlerPanel")
            .classList.add("hidden");
    }
}


/* ============================================================
   SCORE NORMAL RUN
   ============================================================ */

function scoreRuns(runs) {

    const inn =
        currentInnings();

    if (!inn || inn.inningsComplete) return;

    if (
        inn.waitingForBatsman ||
        inn.waitingForBowler
    ) {
        alert("Complete the pending player selection first.");
        return;
    }

    saveSnapshot();

    const striker =
        inn.batsmen[inn.striker];

    const bowler =
        inn.bowlers[inn.bowler];

    striker.runs += runs;
    striker.balls += 1;

    if (runs === 4) striker.fours++;
    if (runs === 6) striker.sixes++;

    bowler.balls++;
    bowler.runs += runs;

    inn.runs += runs;
    inn.legalBalls++;

    inn.partnershipRuns += runs;
    inn.partnershipBalls++;

    const ball = {

        type: "run",

        runs,

        batsman: inn.striker,

        bowler: inn.bowler,

        legal: true,

        label: String(runs)

    };

    inn.balls.push(ball);
    inn.currentOver.push(ball);

    if (runs % 2 === 1) {
        swapStrikers(inn);
    }

    afterLegalBall();

    saveAll();
    renderLiveScorer();
}


/* ============================================================
   EXTRAS
   ============================================================ */

function scoreExtra(type) {

    const inn =
        currentInnings();

    if (!inn || inn.inningsComplete) return;

    if (
        inn.waitingForBatsman ||
        inn.waitingForBowler
    ) {
        alert("Complete the pending selection first.");
        return;
    }

    saveSnapshot();

    const bowler =
        inn.bowlers[inn.bowler];

    let label = "";
    let legal = false;

    if (type === "wide") {

        inn.runs += 1;

        inn.extras.wides++;

        bowler.runs++;

        label = "Wd";

        /*
            Wide does NOT count as legal ball.
        */

    }

    else if (type === "noball") {

        inn.runs += 1;

        inn.extras.noBalls++;

        bowler.runs++;

        label = "Nb";

        /*
            No ball does NOT count as legal ball.
        */

    }

    else if (type === "bye") {

        inn.runs += 1;

        inn.extras.byes++;

        bowler.balls++;

        inn.legalBalls++;

        label = "B";

        legal = true;

    }

    else if (type === "legbye") {

        inn.runs += 1;

        inn.extras.legByes++;

        bowler.balls++;

        inn.legalBalls++;

        label = "Lb";

        legal = true;
    }

    if (legal) {

        inn.partnershipRuns += 1;
        inn.partnershipBalls++;

    }

    const ball = {

        type,

        runs: 1,

        batsman: inn.striker,

        bowler: inn.bowler,

        legal,

        label

    };

    inn.balls.push(ball);
    inn.currentOver.push(ball);

    if (legal) {
        afterLegalBall();
    }

    saveAll();

    renderLiveScorer();
}


/* ============================================================
   WICKET
   ============================================================ */

function scoreWicket() {

    const inn =
        currentInnings();

    if (!inn || inn.inningsComplete) return;

    if (
        inn.waitingForBatsman ||
        inn.waitingForBowler
    ) {
        return;
    }

    saveSnapshot();

    const striker =
        inn.batsmen[inn.striker];

    const bowler =
        inn.bowlers[inn.bowler];

    striker.balls++;

    striker.out = true;
    striker.dismissal =
        `b ${getPlayerName(inn.bowler)}`;

    bowler.balls++;
    bowler.wickets++;

    inn.wickets++;
    inn.legalBalls++;

    inn.partnershipBalls++;

    const ball = {

        type: "wicket",

        runs: 0,

        batsman: inn.striker,

        bowler: inn.bowler,

        legal: true,

        label: "W"

    };

    inn.balls.push(ball);
    inn.currentOver.push(ball);

    inn.fallOfWickets.push({

        wicket: inn.wickets,

        score: inn.runs,

        player: inn.striker,

        over: formatOvers(inn.legalBalls)

    });

    inn.partnerships.push({

        runs: inn.partnershipRuns,

        balls: inn.partnershipBalls,

        wicket: inn.wickets

    });

    inn.partnershipRuns = 0;
    inn.partnershipBalls = 0;

    if (inn.wickets >= inn.battingXI.length - 1) {

        striker.active = false;

        afterLegalBall();

        finishCurrentInnings();

        return;

    }

    striker.active = false;

    inn.waitingForBatsman = true;

    afterLegalBall();

    saveAll();

    renderLiveScorer();

    showNewBatsmanPanel();
}


/* ============================================================
   AFTER LEGAL BALL
   ============================================================ */

function afterLegalBall() {

    const inn =
        currentInnings();

    if (!inn) return;

    if (
        liveMatch.innings === 2 &&
        inn.target !== null &&
        inn.runs >= inn.target
    ) {

        finishCurrentInnings(true);

        return;
    }

    if (
        inn.legalBalls >=
        inn.battingXI.length * 0 + inn.oversLimit * 6
    ) {

        finishCurrentInnings();

        return;
    }

    if (inn.legalBalls % 6 === 0) {

        /*
            End of over:
            swap striker/non-striker automatically.
        */

        swapStrikers(inn);

        inn.waitingForBowler = true;

        showNewBowlerPanel();

    }
}


/* ============================================================
   NEW BATSMAN
   ============================================================ */

function showNewBatsmanPanel() {

    const inn =
        currentInnings();

    const select =
        document.getElementById("newBatsman");

    const available =
        inn.battingXI
            .filter(id => {

                const b =
                    inn.batsmen[id];

                return (
                    !b.out &&
                    id !== inn.striker &&
                    id !== inn.nonStriker
                );

            });

    select.innerHTML =
        `<option value="">Select batsman</option>` +
        available.map(id => {

            const p =
                players.find(x => x.id === id);

            return `
            <option value="${id}">
                ${escapeHTML(p ? p.name : id)}
            </option>`;

        }).join("");

    document
        .getElementById("newBatsmanPanel")
        .classList.remove("hidden");
}


function confirmNewBatsman() {

    const inn =
        currentInnings();

    const id =
        document.getElementById("newBatsman").value;

    if (!id) {
        alert("Select new batsman");
        return;
    }

    inn.striker = id;

    inn.batsmen[id].active = true;

    inn.waitingForBatsman = false;

    saveAll();

    renderLiveScorer();
}


/* ============================================================
   NEW BOWLER
   ============================================================ */

function showNewBowlerPanel() {

    const inn =
        currentInnings();

    const select =
        document.getElementById("nextBowler");

    const available =
        inn.bowlingXI.filter(id =>
            id !== inn.bowler
        );

    select.innerHTML =
        `<option value="">Select bowler</option>` +
        available.map(id => {

            const p =
                players.find(x => x.id === id);

            return `
            <option value="${id}">
                ${escapeHTML(p ? p.name : id)}
            </option>`;

        }).join("");

    document
        .getElementById("newBowlerPanel")
        .classList.remove("hidden");
}


function confirmNewBowler() {

    const inn =
        currentInnings();

    const id =
        document.getElementById("nextBowler").value;

    if (!id) {
        alert("Select next bowler");
        return;
    }

    inn.bowler = id;

    inn.waitingForBowler = false;

    inn.currentOver = [];

    saveAll();

    renderLiveScorer();
}


/* ============================================================
   STRIKER SWAP
   ============================================================ */

function swapStrikers(inn) {

    const temp =
        inn.striker;

    inn.striker =
        inn.nonStriker;

    inn.nonStriker =
        temp;
}


/* ============================================================
   CURRENT OVER
   ============================================================ */

function renderCurrentOver() {

    const inn =
        currentInnings();

    const container =
        document.getElementById("currentOverBalls");

    if (!inn || !container) return;

    container.innerHTML =
        inn.currentOver.map(ball => {

            let cls = "ball";

            if (ball.runs === 4) cls += " four";
            if (ball.runs === 6) cls += " six";
            if (ball.type === "wicket") cls += " wicket";
            if (
                ball.type === "wide" ||
                ball.type === "noball" ||
                ball.type === "bye" ||
                ball.type === "legbye"
            ) {
                cls += " extra";
            }

            return `
                <div class="${cls}">
                    ${ball.label}
                </div>
            `;

        }).join("");
}


/* ============================================================
   UNDO
   ============================================================ */

function saveSnapshot() {

    if (!liveMatch) return;

    const copy =
        JSON.parse(
            JSON.stringify(liveMatch)
        );

    liveMatch.currentBallSnapshots =
        liveMatch.currentBallSnapshots || [];

    liveMatch.currentBallSnapshots.push(copy);

    if (
        liveMatch.currentBallSnapshots.length > 30
    ) {
        liveMatch.currentBallSnapshots.shift();
    }
}


function undoBall() {

    if (!liveMatch) return;

    const snapshots =
        liveMatch.currentBallSnapshots || [];

    if (!snapshots.length) {

        alert("Nothing to undo.");

        return;
    }

    const previous =
        snapshots.pop();

    liveMatch = previous;

    saveAll();

    renderLiveScorer();
}


/* ============================================================
   FINISH INNINGS
   ============================================================ */

function finishInnings() {

    if (!liveMatch) return;

    if (
        !confirm(
            "Finish this innings?"
        )
    ) return;

    finishCurrentInnings(false);
}


function finishCurrentInnings(chased = false) {

    const inn =
        currentInnings();

    if (!inn) return;

    inn.inningsComplete = true;

    if (liveMatch.innings === 1) {

        /*
            Start second innings automatically.
        */

        const target =
            inn.runs + 1;

        const battingXI =
            inn.bowlingXI;

        const bowlingXI =
            inn.battingXI;

        const striker =
            battingXI[0];

        const nonStriker =
            battingXI[1];

        const bowler =
            bowlingXI[0];

        const second =
            createInnings(
                inn.bowlingTeam,
                inn.battingTeam,
                battingXI,
                bowlingXI,
                striker,
                nonStriker,
                bowler
            );

        second.target = target;

        liveMatch.inningsData.push(second);

        liveMatch.innings = 2;

        saveAll();

        renderLiveScorer();

        alert(
            `First innings complete.\nTarget: ${target}`
        );

        return;
    }

    completeMatch();
}


/* ============================================================
   COMPLETE MATCH
   ============================================================ */

function completeMatch() {

    const first =
        liveMatch.inningsData[0];

    const second =
        liveMatch.inningsData[1];

    let winner = null;
    let result = "";

    if (second.runs > first.runs) {

        winner =
            second.battingTeam;

        result =
            `${teamNamePlain(winner)} won by ${second.battingXI.length -
            1 -
            second.wickets
            } wickets`;

    }

    else if (second.runs === first.runs) {

        result = "Match tied";

    }

    else {

        winner =
            first.battingTeam;

        result =
            `${teamNamePlain(winner)} won by ${first.runs - second.runs
            } runs`;

    }

    const match = {

        id: liveMatch.id,

        teamA: liveMatch.teamA,

        teamB: liveMatch.teamB,

        oversLimit: liveMatch.oversLimit,

        inningsData:
            liveMatch.inningsData,

        winner,

        result,

        date: new Date().toISOString(),

        completed: true

    };

    completedMatches.push(match);

    updateTournamentAfterMatch(match);

    updatePlayerCareerStats(match);

    liveMatch = null;

    saveAll();

    renderDashboard();
    renderPointsTables();
    renderMatches();
    renderStatistics();

    showScorecard(match);
}


/* ============================================================
   TOURNAMENT RESULT UPDATE
   ============================================================ */

function updateTournamentAfterMatch(match) {

    const first =
        match.inningsData[0];

    const second =
        match.inningsData[1];

    tournament.divisions.forEach(div => {

        const rowA =
            div.table.find(
                r => r.teamId === first.battingTeam
            );

        const rowB =
            div.table.find(
                r => r.teamId === first.bowlingTeam
            );

        if (!rowA || !rowB) return;

        rowA.played++;
        rowB.played++;

        rowA.runsFor += first.runs;
        rowA.ballsFor +=
            nrrBalls(first);

        rowA.runsAgainst += second.runs;
        rowA.ballsAgainst +=
            nrrBalls(second);

        rowB.runsFor += second.runs;
        rowB.ballsFor +=
            nrrBalls(second);

        rowB.runsAgainst += first.runs;
        rowB.ballsAgainst +=
            nrrBalls(first);

        if (!match.winner) {

            rowA.tied++;
            rowB.tied++;

            rowA.points += 1;
            rowB.points += 1;

        } else {

            const winnerRow =
                match.winner === rowA.teamId
                    ? rowA
                    : rowB;

            const loserRow =
                match.winner === rowA.teamId
                    ? rowB
                    : rowA;

            winnerRow.won++;
            winnerRow.points += 2;

            loserRow.lost++;

        }

        rowA.nrr =
            calculateNRR(rowA);

        rowB.nrr =
            calculateNRR(rowB);

    });

    saveAll();
}


function nrrBalls(innings) {

    /*
       For a completed/all-out innings we use the
       allocated overs for tournament NRR.
    */

    if (
        innings.inningsComplete ||
        innings.wickets >= innings.battingXI.length - 1
    ) {
        return innings.battingXI.length > 0
            ? tournament.overs * 6
            : innings.legalBalls;
    }

    return innings.legalBalls;
}


function calculateNRR(row) {

    if (!row.ballsFor || !row.ballsAgainst) {
        return 0;
    }

    return (
        row.runsFor / (row.ballsFor / 6)
    ) -
        (
            row.runsAgainst / (row.ballsAgainst / 6)
        );
}


/* ============================================================
   PLAYER CAREER STATISTICS
   ============================================================ */

function updatePlayerCareerStats(match) {

    match.inningsData.forEach(inn => {

        inn.battingXI.forEach(id => {

            const player =
                players.find(p => p.id === id);

            const data =
                inn.batsmen[id];

            if (!player || !data) return;

            player.stats.matches++;

            if (
                data.balls > 0 ||
                data.runs > 0 ||
                data.out
            ) {

                player.stats.innings++;

                player.stats.runs += data.runs;
                player.stats.balls += data.balls;
                player.stats.fours += data.fours;
                player.stats.sixes += data.sixes;

                player.stats.highest =
                    Math.max(
                        player.stats.highest,
                        data.runs
                    );

                if (data.runs >= 50) {
                    player.stats.fifties++;
                }

                if (data.runs >= 100) {
                    player.stats.hundreds++;
                }

                if (!data.out) {
                    player.stats.notOuts++;
                }

            }

        });


        inn.bowlingXI.forEach(id => {

            const player =
                players.find(p => p.id === id);

            const data =
                inn.bowlers[id];

            if (!player || !data) return;

            if (data.balls > 0) {

                player.stats.bowlingInnings++;

                player.stats.ballsBowled +=
                    data.balls;

                player.stats.runsConceded +=
                    data.runs;

                player.stats.wickets +=
                    data.wickets;

            }

        });

    });

    saveAll();
}


/* ============================================================
   STATISTICS
   ============================================================ */

function renderStatistics() {

    const container =
        document.getElementById("statsContainer");

    if (!players.length) {

        container.innerHTML =
            `<div class="form-card">
                <p class="muted">
                    No statistics available.
                </p>
             </div>`;

        return;
    }

    container.innerHTML =
        players.map(p => {

            const s = p.stats;

            const sr =
                s.balls
                    ? (s.runs / s.balls * 100)
                    : 0;

            const avg =
                (s.innings - s.notOuts) > 0
                    ? s.runs /
                    (s.innings - s.notOuts)
                    : s.runs;

            const economy =
                s.ballsBowled
                    ? s.runsConceded /
                    (s.ballsBowled / 6)
                    : 0;

            return `
            <div class="stats-card">

                <h3>
                    ${escapeHTML(p.name)}
                </h3>

                <p class="muted small">
                    ${escapeHTML(p.role)}
                </p>

                <hr style="border-color:#29313d;margin:12px 0">

                <p>
                    Runs:
                    <b>${s.runs}</b>
                </p>

                <p>
                    Balls:
                    <b>${s.balls}</b>
                </p>

                <p>
                    Strike Rate:
                    <b>${sr.toFixed(2)}</b>
                </p>

                <p>
                    Average:
                    <b>${avg.toFixed(2)}</b>
                </p>

                <p>
                    4s:
                    <b>${s.fours}</b>
                    &nbsp;&nbsp;
                    6s:
                    <b>${s.sixes}</b>
                </p>

                <p>
                    Highest:
                    <b>${s.highest}</b>
                </p>

                <hr style="border-color:#29313d;margin:12px 0">

                <p>
                    Wickets:
                    <b>${s.wickets}</b>
                </p>

                <p>
                    Bowling Economy:
                    <b>${economy.toFixed(2)}</b>
                </p>

            </div>`;
        }).join("");
}


/* ============================================================
   FINAL SCORECARD
   ============================================================ */

function showScorecard(match) {

    showPage("scorecardPage");

    const container =
        document.getElementById("scorecardContainer");

    container.innerHTML =
        buildScorecardHTML(match);
}


function buildScorecardHTML(match) {

    const first =
        match.inningsData[0];

    const second =
        match.inningsData[1];

    const teamA =
        teams.find(t => t.id === first.battingTeam);

    const teamB =
        teams.find(t => t.id === first.bowlingTeam);

    return `

    <div class="scorecard">

        <h2>
            ${teamA ? escapeHTML(teamA.name) : ""}
            vs
            ${teamB ? escapeHTML(teamB.name) : ""}
        </h2>

        <p>
            ${new Date(match.date).toLocaleString()}
        </p>

        <div class="result-box">
            ${escapeHTML(match.result)}
        </div>


        ${buildInningsScorecard(first)}

        ${buildInningsScorecard(second)}


        <div class="download-row">

            <button
                class="primary-btn"
                onclick="downloadPDF('${match.id}')">
                Download PDF
            </button>

            <button
                class="secondary-btn"
                onclick="printScorecard()">
                Print / Save PDF
            </button>

        </div>

    </div>`;
}


function buildInningsScorecard(inn) {

    const team =
        teams.find(t => t.id === inn.battingTeam);

    let html = `

        <h3 style="margin-top:20px">
            ${team ? escapeHTML(team.name) : ""}
            ${inn.runs}/${inn.wickets}
            (${formatOvers(inn.legalBalls)} Overs)
        </h3>

        <table class="scorecard-table">

            <thead>

                <tr>
                    <th>Batter</th>
                    <th>Dismissal</th>
                    <th>R</th>
                    <th>B</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>SR</th>
                </tr>

            </thead>

            <tbody>`;

    inn.battingXI.forEach(id => {

        const player =
            players.find(p => p.id === id);

        const data =
            inn.batsmen[id];

        if (!data) return;

        const sr =
            data.balls
                ? data.runs /
                data.balls *
                100
                : 0;

        html += `

        <tr>

            <td>
                ${player
                ? escapeHTML(player.name)
                : ""}
            </td>

            <td>
                ${escapeHTML(data.dismissal)}
            </td>

            <td>${data.runs}</td>
            <td>${data.balls}</td>
            <td>${data.fours}</td>
            <td>${data.sixes}</td>
            <td>${sr.toFixed(2)}</td>

        </tr>`;

    });

    html += `

            </tbody>

        </table>

        <p>
            <b>Extras:</b>
            ${inn.extras.wides} Wd,
            ${inn.extras.noBalls} Nb,
            ${inn.extras.byes} B,
            ${inn.extras.legByes} Lb
        </p>

        <p style="margin-top:8px">
            <b>Total:</b>
            ${inn.runs}/${inn.wickets}
        </p>


        <h4 style="margin-top:18px">
            Bowling
        </h4>

        <table class="scorecard-table">

            <thead>

                <tr>
                    <th>Bowler</th>
                    <th>O</th>
                    <th>R</th>
                    <th>W</th>
                    <th>Econ</th>
                </tr>

            </thead>

            <tbody>`;

    inn.bowlingXI.forEach(id => {

        const player =
            players.find(p => p.id === id);

        const data =
            inn.bowlers[id];

        if (!data || data.balls === 0) return;

        const economy =
            data.runs /
            (data.balls / 6);

        html += `

        <tr>

            <td>
                ${player
                ? escapeHTML(player.name)
                : ""}
            </td>

            <td>
                ${formatOvers(data.balls)}
            </td>

            <td>${data.runs}</td>

            <td>${data.wickets}</td>

            <td>${economy.toFixed(2)}</td>

        </tr>`;

    });

    html += `

            </tbody>

        </table>

        <h4>Fall of Wickets</h4>

        <p style="margin-top:7px">
            ${inn.fallOfWickets.length
            ? inn.fallOfWickets.map(
                f =>
                    `${f.wicket}-${f.score} (${getPlayerName(f.player)}, ${f.over})`
            ).join(" | ")
            : "None"
        }
        </p>
    `;

    return html;
}


/* ============================================================
   PDF
   ============================================================ */

function downloadPDF(matchId) {

    const match =
        completedMatches.find(
            m => m.id === matchId
        );

    if (!match) {
        alert("Match not found");
        return;
    }

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "PDF library unavailable. Use Print / Save PDF."
        );

        return;
    }

    const { jsPDF } = window.jspdf;

    const doc =
        new jsPDF();

    const first =
        match.inningsData[0];

    const second =
        match.inningsData[1];

    const teamA =
        teams.find(
            t => t.id === first.battingTeam
        );

    const teamB =
        teams.find(
            t => t.id === first.bowlingTeam
        );

    doc.setFontSize(18);

    doc.text(
        "KANNALLI CRICKET",
        14,
        18
    );

    doc.setFontSize(13);

    doc.text(
        `${teamA?.name || ""} vs ${teamB?.name || ""}`,
        14,
        28
    );

    doc.setFontSize(11);

    doc.text(
        match.result,
        14,
        38
    );

    let y = 48;

    [first, second].forEach((inn, index) => {

        const team =
            teams.find(
                t => t.id === inn.battingTeam
            );

        doc.setFontSize(13);

        doc.text(
            `${team?.name || ""} ${inn.runs}/${inn.wickets} (${formatOvers(inn.legalBalls)} ov)`,
            14,
            y
        );

        y += 6;

        const battingRows =
            inn.battingXI.map(id => {

                const player =
                    players.find(p => p.id === id);

                const d =
                    inn.batsmen[id];

                const sr =
                    d.balls
                        ? (d.runs / d.balls * 100)
                        : 0;

                return [
                    player?.name || "",
                    d.dismissal,
                    d.runs,
                    d.balls,
                    d.fours,
                    d.sixes,
                    sr.toFixed(2)
                ];

            });

        doc.autoTable({

            startY: y,

            head: [[
                "Batter",
                "Dismissal",
                "R",
                "B",
                "4s",
                "6s",
                "SR"
            ]],

            body: battingRows,

            styles: {
                fontSize: 8
            }

        });

        y =
            doc.lastAutoTable.finalY + 8;

        doc.text(
            `Extras: WD ${inn.extras.wides} | NB ${inn.extras.noBalls} | B ${inn.extras.byes} | LB ${inn.extras.legByes}`,
            14,
            y
        );

        y += 8;

        const bowlingRows =
            inn.bowlingXI
                .filter(id =>
                    inn.bowlers[id] &&
                    inn.bowlers[id].balls > 0
                )
                .map(id => {

                    const player =
                        players.find(
                            p => p.id === id
                        );

                    const d =
                        inn.bowlers[id];

                    const econ =
                        d.runs /
                        (d.balls / 6);

                    return [
                        player?.name || "",
                        formatOvers(d.balls),
                        d.runs,
                        d.wickets,
                        econ.toFixed(2)
                    ];

                });

        doc.autoTable({

            startY: y,

            head: [[
                "Bowler",
                "O",
                "R",
                "W",
                "Econ"
            ]],

            body: bowlingRows,

            styles: {
                fontSize: 8
            }

        });

        y =
            doc.lastAutoTable.finalY + 15;

        if (y > 250 && index === 0) {
            doc.addPage();
            y = 20;
        }

    });

    doc.save(
        "Kannalli_Cricket_Scorecard.pdf"
    );
}


function printScorecard() {

    window.print();
}


/* ============================================================
   CANCEL LIVE MATCH
   ============================================================ */

function cancelLiveMatch() {

    if (
        !confirm(
            "Cancel current live match?"
        )
    ) return;

    liveMatch = null;

    saveAll();

    showPage("scorer");
}


/* ============================================================
   HELPERS
   ============================================================ */

function formatOvers(balls) {

    const overs =
        Math.floor(
            balls / 6
        );

    const remaining =
        balls % 6;

    return `${overs}.${remaining}`;
}


function getPlayerName(id) {

    const p =
        players.find(
            x => x.id === id
        );

    return p
        ? p.name
        : id;
}


function teamNamePlain(id) {

    const team =
        teams.find(
            t => t.id === id
        );

    return team
        ? team.name
        : id;
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   INITIALIZATION
   ============================================================ */

function init() {

    updateTeamSelects();

    renderDashboard();
    renderTeams();
    renderPlayers();
    renderTournament();
    renderPointsTables();
    renderMatches();
    renderStatistics();

    document
        .getElementById("tournamentOvers")
        .value =
        tournament.overs || 10;

    if (liveMatch) {

        console.log(
            "Existing live match restored."
        );
    }
}


init();