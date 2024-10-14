const matchList = document.getElementById('match-list');
const betList = document.getElementById('bet-list');
const bettingForm = document.getElementById('bet-form'); // Updated to match the form ID in HTML
const form = document.getElementById('bet-form'); // Updated to match the form ID in HTML
const teamSelect = document.getElementById('team');
const amountInput = document.getElementById('amount');

// Fetch all matches from the API
function fetchMatches() {
    fetch(`http://localhost:3001/matches`)
        .then(response => response.json())
        .then(matches => displayMatches(matches))
        .catch(error => console.error('Error fetching matches:', error));
}

// Display matches in the UI
function displayMatches(matches) {
    matchList.innerHTML = ''; // Clear existing matches
    matches.forEach(match => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        matchDiv.innerHTML = `
            <h3>${match.teamA} vs ${match.teamB}</h3>
            <p>Odds: ${match.oddsA} - ${match.oddsB}</p>
            <p>Date: ${match.date}</p> <!-- Display match date -->
            <p>Time: ${match.time}</p> <!-- Display match time -->
            <button onclick="showBettingForm(${match.id}, '${match.teamA}', '${match.teamB}', ${match.oddsA}, ${match.oddsB})">Bet</button>
            <button class="delete-button" onclick="deleteMatch(${match.id})">Delete Match</button> <!-- Updated delete button -->
        `;
        matchList.appendChild(matchDiv);
    });
}

// Show betting form for selected match
function showBettingForm(matchId, teamA, teamB, oddsA, oddsB) {
    bettingForm.style.display = 'block';
    teamSelect.innerHTML = `
        <option value="teamA">${teamA} (Odds: ${oddsA})</option>
        <option value="teamB">${teamB} (Odds: ${oddsB})</option>
    `;
    form.onsubmit = (e) => {
        e.preventDefault();
        placeBet(matchId, teamSelect.value, amountInput.value);
    };
}

// Place a bet (POST)
function placeBet(matchId, team, amount) {
    const bet = { matchId, team, amount };
    fetch(`http://localhost:3001/bets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bet),
    })
    .then(response => response.json())
    .then(data => {
        const betItem = document.createElement('li');
        betItem.textContent = `Bet ${amount} on ${team}`;
        betList.appendChild(betItem);
        bettingForm.style.display = 'none';
        form.reset();
    })
    .catch(error => console.error('Error placing bet:', error));
}

// Update match odds (PATCH)
function updateMatchOdds(matchId, newOddsA, newOddsB) {
    const updatedMatch = { oddsA: newOddsA, oddsB: newOddsB };
    fetch(`http://localhost:3001/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMatch),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Match updated:', data);
        fetchMatches(); // Refresh matches after update
    })
    .catch(error => console.error('Error updating match:', error));
}

// Delete a match (DELETE)
function deleteMatch(matchId) {
    fetch(`http://localhost:3001/matches/${matchId}`, {
        method: 'DELETE',
    })
    .then(() => {
        console.log(`Match with ID ${matchId} deleted.`);
        fetchMatches(); // Refresh matches after deletion
    })
    .catch(error => console.error('Error deleting match:', error));
}

// Initial fetch for matches on page load
fetchMatches();
