const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const FILE = "users.json";

const SHEET_API =
     "https://script.google.com/macros/s/AKfycbyzrUjyyXI4T8V5MB7qqqDmYmDvi5o-P4g7wnbglJbCEGBmLWkOokK1B9k_snWLLHi5CQ/exec";
app.get("/check/:username", (req, res) => {
    const username = req.params.username;

    let users = [];

    if (fs.existsSync(FILE)) {
        users = JSON.parse(fs.readFileSync(FILE, "utf8"));
    }

    const exists = users.find(
        x => x.username.toLowerCase() === username.toLowerCase()
    );

    res.json({ exists: !!exists });
});

app.post("/submit", async (req, res) => {
    const { username, predictions } = req.body;

    if (!username) {
        return res.json({
            success: false,
            message: "Kullanıcı adı gerekli"
        });
    }

    let users = [];

    if (fs.existsSync(FILE)) {
        users = JSON.parse(fs.readFileSync(FILE, "utf8"));
    }

    const exists = users.find(
        x => x.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
        return res.json({
            success: false,
            message: "Bu kullanıcı adı kullanılmış"
        });
    }

    users.push({
        username,
        predictions,
        date: new Date()
    });

    fs.writeFileSync(FILE, JSON.stringify(users, null, 2));

    await fetch(SHEET_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            predictions
        })
    });

    res.json({
        success: true,
        message: "Tahminler kaydedildi"
    });
});

app.post("/results", (req, res) => {
    const { correctAnswers } = req.body;

    let users = [];

    if (fs.existsSync(FILE)) {
        users = JSON.parse(fs.readFileSync(FILE, "utf8"));
    }

    const resultMap = {};

    users.forEach(user => {
        let score = 0;

        for (let i = 1; i <= 4; i++) {
            if (
                user.predictions &&
                user.predictions[i] === correctAnswers[i]
            ) {
                score++;
            }
        }

        if (!resultMap[score]) {
            resultMap[score] = [];
        }

        resultMap[score].push({
            username: user.username
        });
    });

const groups = Object.keys(resultMap)
    .sort((a, b) => b - a)
    .map(score => ({
        score,
        users: resultMap[score]
    }));

res.json({
    total: users.length,
    groups
});
