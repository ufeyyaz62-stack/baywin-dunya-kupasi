const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const SHEET_API =
    "https://script.google.com/macros/s/AKfycbyPfTuOT6zYoTNAWWKiokptEpIxG6VeEfN9MJ6gp0q7IwSRnbUdE9rTM4IjwKQc6f3DrQ/exec";

async function getUsers() {
    const response = await fetch(SHEET_API);
    const data = await response.json();
    return data.users || [];
}

app.get("/check/:username", async (req, res) => {
    const username = req.params.username.toLowerCase();
    const users = await getUsers();

    const exists = users.some(
        user => String(user.username).toLowerCase() === username
    );

    res.json({ exists });
});

app.post("/submit", async (req, res) => {
    const { username, predictions } = req.body;

    if (!username || !predictions) {
        return res.json({
            success:false,
            message:"Eksik bilgi var"
        });
    }

    const response = await fetch(SHEET_API, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            username,
            predictions
        })
    });

    const result = await response.json();
    res.json(result);
});

app.post("/results", async (req, res) => {
    const { correctAnswers } = req.body;
    const users = await getUsers();

    const resultMap = {};

    users.forEach(user => {
        let score = 0;

        for (let i = 1; i <= 4; i++) {
            if (
                user.predictions &&
                user.predictions[String(i)] === correctAnswers[String(i)]
            ) {
                score++;
            }
        }

        if (!resultMap[score]) {
            resultMap[score] = [];
        }

        resultMap[score].push({
            username:user.username,
            predictions:user.predictions
        });
    });

    const groups = Object.keys(resultMap)
        .sort((a, b) => b - a)
        .map(score => ({
            score,
            users:resultMap[score]
        }));

    res.json({
        total:users.length,
        groups
    });
});

app.post("/save-winners", async (req, res) => {
    const { winners } = req.body;

    const response = await fetch(SHEET_API, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            action:"saveWinners",
            winners
        })
    });

    const result = await response.json();
    res.json(result);
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server çalışıyor");
});
