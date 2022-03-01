const { Router } = require("express");
const db = require("../db");
const router = Router();
const passport = require("passport");
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function onlyAdmin(req, res, next) {
	if (req.user.admin) {
		return next();
	}
	res.render("401", {
		title: "Forbbiden"
	});
}
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function onlyAuth(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.render("401");
	}
	next();
}
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function onlyNoAuth(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect("/profile");
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

router.get("/signin", onlyNoAuth, async (req, res) => {
	res.render("login", {
		title: "Singin"
	});
});

router.post("/signin", onlyNoAuth, passport.authenticate("login", {
	successRedirect: "/profile",
	failureRedirect: "/signin?failed=true"
}));

router.get("/profile", onlyAuth, async (req, res) => {
	res.render("profile", {
		title: `${req.user.username} - Clynet Room`
	});
});

router.get("/logout", onlyAuth, async (req, res) => {
	req.logout();
	res.redirect("/signin");
});
module.exports = router;