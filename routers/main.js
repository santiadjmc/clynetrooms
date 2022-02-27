const { Router } = require("express");
const db = require("../db");
const router = Router();

router.get("/", (req, res) => res.redirect("/index"));

router.get("/redirect", async (req, res) =>{
	const uri = req.query.uri;
	if (!uri) return res.redirect("/index");
	res.redirect(uri);

});

router.get("/home", (req, res) => res.redirect("/index"));

router.get("/index", async (req, res) => {
	const users = await db.query("SELECT * FROM users");
	res.render("index", {
		title: "Loading...",
		total_users: users.length,
		total_graduated: users.filter(u => u.graduated).length
	});
});
module.exports = router;