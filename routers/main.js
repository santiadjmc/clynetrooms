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

router.get("/redirect", async (req, res) => {
	const uri = req.query.uri;
	if (!uri) return res.redirect("/index");
	res.redirect(uri);

});

router.get("/home", (req, res) => res.redirect("/index"));

router.get("/index", async (req, res) => {
	const users = await db.query("SELECT * FROM users");
	res.render("index", {
		title: "Clynet Academy",
		total_users: users.length,
		total_graduated: users.filter(u => u.graduated).length
	});
});

router.get("/signup", onlyNoAuth, async (req, res) => {
	res.render("register", {
		title: "Registro",
		description: ''
	});
});

router.get('/costos', async (req, res) => {
	res.render('costos', {
		title: "Costos - Clynet Academy",
		description: 'Clynet Academy Instituto digital - Cursos de todo lo que abarca la tecnologia, para hacerte todo un profesional.'
	});
});

router.get('/certificados', async (req, res) => {
	res.render('certificados', {
		title: "Personas Certificadas - Clynet Academy",
		description: 'Clynet Academy Instituto digital - Listados de personas que se han certificado con nosotros.'
	});
});

router.get('/donate', async (req, res) => {
	res.render('apoyar', {
		title: 'Ayudanos a Crecer! - Clynet Academy',
		description: 'Clynet Academy Instituto digital - Apoyo economico para aquellas personas que no tienen dinero para poder costearse un curso, ¡Ayudalas!'
	})
})

router.get('/portal', async (req, res) => {
	res.render('panel', {
		title: 'Portal Estudiantes - Clynet Academy',
		description: 'Clynet Academy Instituto digital - Apoyo economico para aquellas personas que no tienen dinero para poder costearse un curso, ¡Ayudalas!'
	})
})


router.get("/signin", onlyNoAuth, async (req, res) => {
	res.render("login", {
		title: "Singin",
		description: 'Clynet Academy Instituto digital - Area de estudiantes..'
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

router.get("/index/physic", async (req, res) => {
	const users = await db.query("SELECT * FROM users");
	res.render("index_tecno", {
		title: "Clynet Academy",
		total_users: users.length,
		total_graduated: users.filter(u => u.graduated).length
	});
});

module.exports = router;
