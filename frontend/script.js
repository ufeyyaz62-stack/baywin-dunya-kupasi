const API_URL = "https://baywin-dunya-kupasi.onrender.com";

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
        showMessage("Kullanıcı adı en az 3 karakter olmalı.", "Uyarı");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/check/${encodeURIComponent(username)}`);
        const result = await response.json();

        if (result.exists) {
            showMessage("Bu kullanıcı adı daha önce kullanılmış.", "Uyarı");
            return;
        }

        localStorage.setItem("username", username);

        document.getElementById("loginPage").style.display = "none";
        document.getElementById("matchPage").style.display = "block";

        loadMatches();

    } catch (error) {
        showMessage("Bağlantı hatası. Lütfen tekrar dene.", "Hata");
    }
}

function loadMatches() {
    const container = document.getElementById("matches");
    container.innerHTML = "";

    matches.forEach(match => {
        container.innerHTML += `
            <div class="match-card">
                <div class="teams">
                    <span>${match.home}</span>
                    <span class="vs">VS</span>
                    <span>${match.away}</span>
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
        showMessage("Lütfen tüm maçlar için seçim yap.", "Eksik Seçim");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                predictions
            })
        });

        const result = await response.json();

        if (result.success) {
            showMessage("Tahminlerin kaydedildi.", "Başarılı ✅");
        } else {
            showMessage(result.message || "Bir hata oluştu.", "Uyarı");
        }

    } catch (error) {
        showMessage("Kayıt sırasında bağlantı hatası oluştu.", "Hata");
    }
}

function showMessage(text, title = "Bilgi") {
    const oldBox = document.querySelector(".custom-alert");
    if (oldBox) oldBox.remove();

    const box = document.createElement("div");
    box.className = "custom-alert";

    box.innerHTML = `
        <div class="custom-alert-box">
            <h3>${title}</h3>
            <p>${text}</p>
            <button onclick="this.closest('.custom-alert').remove()">Tamam</button>
        </div>
    `;

    document.body.appendChild(box);
}
