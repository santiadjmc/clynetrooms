const { Router } = require("express");
const db = require("../db");
const router = Router();
function onlyAdmin(req, res, next) {
	if (req.user.admin) {
		return next();
	}
	res.render("401", {
		title: "Forbbiden"
	});
}
function onlyAuth(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.render("401");
	}
	next();
}
function onlyNoAuth(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect("/");
	}
	next();
}

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

router.get("/signup", onlyNoAuth, async (req, res) => {
	res.render("register", {
		title: "Registro"
	});
});
module.exports = router;