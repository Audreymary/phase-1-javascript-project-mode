const matchList = document.getElementById('match-list');
const betList = document.getElementById('bet-list');
const bettingForm = document.getElementById('bet-form');
const teamSelect = document.getElementById('team');
const amountInput = document.getElementById('amount');
const feedbackTextarea = document.querySelector('textarea'); 
const feedbackButton = document.querySelector('#feedback-button'); 



// Fetch all matches from the API
function fetchMatches() {
    fetch(`http://localhost:3000/matches`)
        .then(response => response.json())
        .then(matches => displayMatches(matches))
        .catch(error => console.error('Error fetching matches:', error));
}

// Display matches in the UI
function displayMatches(matches) {
    matchList.innerHTML = '';
    matches.forEach(match => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        matchDiv.innerHTML = `
            <h3>${match.teamA} vs ${match.teamB}</h3>
            <p>Odds: ${match.oddsA} - ${match.oddsB}</p>
            <p>Date: ${match.date}</p>
            <p>Time: ${match.time}</p>
            <button onclick="showBettingForm(${match.id}, '${match.teamA}', '${match.teamB}', ${match.oddsA}, ${match.oddsB})">Bet Now</button>
            <button class="delete-button" onclick="deleteMatch(${match.id})">Delete Match</button>
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
    bettingForm.onsubmit = (e) => {
        e.preventDefault();
        placeBet(matchId, teamSelect.value, amountInput.value);
    };
}

// Place a bet (POST)
function placeBet(matchId, team, amount) {
    const bet = { matchId, team, amount };
    fetch(`http://localhost:3000/bets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bet),
    })
    .then(response => response.json())
    .then(data => {
        displayBet(data);
        bettingForm.style.display = 'none';
        bettingForm.reset();
    })
    .catch(error => console.error('Error placing bet:', error));
}

// Display the placed bet in the list
function displayBet(bet) {
    const betItem = document.createElement('li');
    betItem.textContent = `Bet ${bet.amount} on ${bet.team} `;
    
// // //     // Create a return button
    const returnButton = document.createElement('button');
    returnButton.textContent = 'Return Bet';
    returnButton.onclick = () => returnBet(bet.id); // Call returnBet function with bet ID

    betItem.appendChild(returnButton); // Append button to bet item
    betList.appendChild(betItem); // Append bet item to the list
}
// Function to return a bet (DELETE)
function returnBet(betId) {
    fetch(`http://localhost:3000/bets/${betId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // After successful deletion, fetch bets again to update the list
        fetchBets();
    })
    .catch(error => console.error('Error returning bet:', error));
} 


app.post('/return-bet', (req, res) => {
    const { betId } = req.body;
    const betIndex = bets.findIndex(b => b.id === betId);

    if (betIndex !== -1) {
        bets.splice(betIndex, 1); // Remove the bet from the list
        res.status(200).json({ message: 'Bet returned successfully.' });
    } else {
        res.status(404).json({ message: 'Bet not found.' });
    }
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// // Feedback submission function
function submitFeedback() {
    const feedback = feedbackTextarea.value.trim();
    if (feedback) {
        fetch(`http://localhost:3000/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feedback }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Feedback submitted:', data);
            feedbackTextarea.value = ''; // Clear the textarea
            alert('Thank you for your feedback!'); // Provide user feedback
        })
        .catch(error => console.error('Error submitting feedback:', error));
    } else {
        alert('Please enter your feedback before submitting.');
    }
}
// // Attach event listener to feedback button
feedbackButton.addEventListener('click', (e) => {
    e.preventDefault();
    submitFeedback();
});


// Function to fetch bets
function fetchBets() {
    fetch(`http://localhost:3000/bets`)
        .then(response => response.json())
        .then(bets => {
            betList.innerHTML = ''; // Clear existing bets
            bets.forEach(displayBet); // Display each bet
        })
        .catch(error => console.error('Error fetching bets:', error));
}

// Update match odds (PATCH)
function updateMatchOdds(matchId, newOddsA, newOddsB) {
    const updatedMatch = { oddsA: newOddsA, oddsB: newOddsB };
    fetch(`http://localhost:3000/matches/${matchId}`, {
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
    fetch(`http://localhost:3000/matches/${matchId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(() => {
        console.log(`Match with ID ${matchId} deleted.`);
        fetchMatches(); // Refresh matches after deletion
    })
    .catch(error => console.error('Error deleting match:', error));
}

// Initial fetch for matches and bets on page load
fetchMatches();
fetchBets(); 
