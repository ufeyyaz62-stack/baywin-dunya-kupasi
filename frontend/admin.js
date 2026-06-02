const correctAnswers = {};

const matches = [
    { id: 1, home: "Hırvatistan", away: "Belçika" },
    { id: 2, home: "Gürcistan", away: "Romanya" },
    { id: 3, home: "Fas", away: "Madagaskar" },
    { id: 4, home: "Galler", away: "Gana" }
];

window.onload = function () {
    const area = document.getElementById("adminMatches");

    matches.forEach(match => {
        area.innerHTML += `
            <div class="match-card">
                <div class="teams">${match.home} <span class="vs">VS</span> ${match.away}</div>
                <div class="options">
                    <button class="option-btn" onclick="selectCorrect(${match.id}, '1', this)">1</button>
                    <button class="option-btn" onclick="selectCorrect(${match.id}, 'X', this)">X</button>
                    <button class="option-btn" onclick="selectCorrect(${match.id}, '2', this)">2</button>
                </div>
            </div>
        `;
    });
};

function selectCorrect(matchId, choice, btn) {
    correctAnswers[matchId] = choice;

    btn.parentElement
        .querySelectorAll("button")
        .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
}

async function calculateResults() {
    if (Object.keys(correctAnswers).length < matches.length) {
        alert("Tüm maçların doğru sonucunu seç.");
        return;
    }

    const response = await fetch("http://localhost:3000/results", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ correctAnswers })
    });

    const data = await response.json();

    let html = "<h2>Sonuçlar</h2>";

    data.groups.forEach(group => {
        html += `<h3>${group.score} Doğru</h3>`;
        group.users.forEach(user => {
            html += `<p>${user.username}</p>`;
        });
    });

    document.getElementById("results").innerHTML = html;
}