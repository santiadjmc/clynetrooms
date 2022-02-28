const { Router } = require("express");
const db = require("../db");
const logs = require("../logs");
const router = Router();
const BotClient = require("../index");

router.get("/", (req, res) => {
    res.status(403).json({ status: 403, message: "Forbbiden" });
});

router.get("/discord/users", async (req, res) => {
    const guild = BotClient.guilds.cache.first();
    try {
        await guild.members.fetch();
    }
    catch (err) {
        logs.error("bot", err.message);
        return res.status(500).json({ warning: null, error: true, message: "Couldn't fetch members due to a unknown error" });
    }
    return res.json({ warning: null, error: false, message: "", users: guild.members.cache.map(m => m) });
});
module.exports = router;