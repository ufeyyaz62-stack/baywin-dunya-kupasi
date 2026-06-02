const matches = [
    { id: 1, home: "🇭🇷 Hırvatistan", away: "🇧🇪 Belçika" },
    { id: 2, home: "🇬🇪 Gürcistan", away: "🇷🇴 Romanya" },
    { id: 3, home: "🇲🇦 Fas", away: "🇲🇬 Madagaskar" },
    { id: 4, home: "🏴 Galler", away: "🇬🇭 Gana" }
];

const predictions = {};

async function startGame() {
    const username = document.getElementById("username").value.trim();

    if (username.length < 3) {
        alert("Kullanıcı adı en az 3 karakter olmalı");
        return;
    }

    const response = await fetch(
        "https://baywin-dunya-kupasi.onrender.com/check/" + username
    );

    const result = await response.json();

    if (result.exists) {
        alert("Bu kullanıcı adı kullanılmış");
        return;
    }

    localStorage.setItem("username", username);

    document.getElementById("loginPage").style.display = "none";
    document.getElementById("matchPage").style.display = "block";

    loadMatches();
}

function loadMatches() {
    const container = document.getElementById("matches");
    container.innerHTML = "";

    matches.forEach(match => {
        container.innerHTML += `
            <div class="match-card">
                <div class="teams">
                    ${match.home}
                    <span class="vs">VS</span>
                    ${match.away}
                </div>

                <div class="options">
                    <button class="option-btn" data-match="${match.id}" data-choice="1" onclick="selectMatch(${match.id}, '1')">1</button>
                    <button class="option-btn" data-match="${match.id}" data-choice="X" onclick="selectMatch(${match.id}, 'X')">X</button>
                    <button class="option-btn" data-match="${match.id}" data-choice="2" onclick="selectMatch(${match.id}, '2')">2</button>
                </div>
            </div>
        `;
    });
}

function selectMatch(matchId, choice) {
    predictions[matchId] = choice;

    document
        .querySelectorAll(`[data-match="${matchId}"]`)
        .forEach(btn => btn.classList.remove("active"));

    document
        .querySelector(`[data-match="${matchId}"][data-choice="${choice}"]`)
        .classList.add("active");
}

async function submitPredictions() {
    const username = localStorage.getItem("username");

    if (Object.keys(predictions).length < matches.length) {
        alert("Lütfen tüm maçlar için seçim yap.");
        return;
    }

    const response = await fetch(
        "https://baywin-dunya-kupasi.onrender.com/submit",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                predictions
            })
        }
    );

    const result = await response.json();

    if (result.success) {
        alert("Tahminlerin kaydedildi.");
    } else {
        alert(result.message);
    }
}
