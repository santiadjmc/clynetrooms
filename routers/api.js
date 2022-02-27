const { Router } = require("express");
const db = require("../db");
const logs = require("../logs");
const router = Router();

router.get("/", (req, res) => {
    res.status(403).json({ status: 403, message: "Forbbiden" });
});
module.exports = router;