const ADMIN_PASSWORD = "1903baywin";

const pass = prompt("Yönetici Şifresi");

if (pass !== ADMIN_PASSWORD) {
    document.body.innerHTML = `
        <div style="
            height:100vh;
            display:flex;
            justify-content:center;
            align-items:center;
            background:#000;
            color:#fff;
            font-size:32px;
            font-weight:bold;
        ">
            Yetkisiz Erişim
        </div>
    `;
    throw new Error("Yetkisiz erişim");
}
const API_URL = "https://baywin-dunya-kupasi.onrender.com";

const correctAnswers = {};

const matches = [
    { id: 1, home: "🇭🇷 Hırvatistan", away: "🇧🇪 Belçika" },
    { id: 2, home: "🇬🇪 Gürcistan", away: "🇷🇴 Romanya" },
    { id: 3, home: "🇲🇦 Fas", away: "🇲🇬 Madagaskar" },
    { id: 4, home: "🏴 Galler", away: "🇬🇭 Gana" }
];

window.onload = function () {
    const area = document.getElementById("adminMatches");

    matches.forEach(match => {
        area.innerHTML += `
            <div class="match-card">
                <div class="teams">
                    <span>${match.home}</span>
                    <span class="vs">VS</span>
                    <span>${match.away}</span>
                </div>

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
        showMessage("Tüm maçların doğru sonucunu seç.", "Eksik Seçim");
        return;
    }

    const response = await fetch(`${API_URL}/results`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ correctAnswers })
    });

    const data = await response.json();

    let html = `
        <div style="margin-top:25px;">
            <h2>Sonuçlar</h2>
            <p class="subtitle">Toplam Katılımcı: ${data.total || 0}</p>
        </div>
    `;

   data.groups.forEach(group => {

    if (group.score == 0) return;

    const icon =
        group.score == 4 ? "🏆" :
        group.score == 3 ? "🥈" :
        group.score == 2 ? "🥉" : "🎯";

        html += `
            <div class="match-card">
                <h3>${icon} ${group.score} Doğru</h3>
        `;

        group.users.forEach(user => {
            html += `<p style="margin-top:8px;font-weight:bold;">${user.username}</p>`;
        });

        html += `</div>`;
    });

    document.getElementById("results").innerHTML = html;
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
