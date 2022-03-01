require("dotenv").config();
const express = require("express");
const app = express();
const hbs = require("express-handlebars");
const session = require("express-session");
const flash = require("connect-flash");
const { WebSocketServer } = require("ws");
const path = require("path");
const morgan = require("morgan");
const logs = require("./logs");
const db = require("./db");
const passport = require("passport");
const MySqlStore = require("express-mysql-session");
const { Collection } = require("discord.js");
require("./auth/passport");
require("./index");
const rateLimits = new Collection();

// Middlewares
app.use(session({
	secret: "sEkreTTt",
	resave: false,
	saveUninitialized: false,
	store: new MySqlStore({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME
	})
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Ratelimits system
function rateLimit(req, res, next) {
	const ip = req.ip.replace("::ffff:", "");
	if (rateLimits.has(ip)) {
		const rObject = rateLimits.get(ip);
		if (rObject.current === rObject.max) {
			return res.status(429).send(`
			<title>429 - Too many requests</title>
			<center>
			<h1>Too many requests</h1>
			</center>
			`);
		}
		else {
			rateLimits.get(ip).current = rObject.current + 1;
			next();
		}
	}
	else {
		rateLimits.set(ip, { current: 1, max: 100 });
		next();
	}
} 

// Global variables
app.use(async function (req, res, next) {
	app.locals.error = req.flash("error");
	app.locals.success = req.flash("success");
	app.locals.user = req.user;
	app.locals.ip = req.ip.replace("::ffff:", "");
	next();
});

// Settings
app.set("views", path.join(__dirname, "views"));
app.set("port", process.env.PORT);

// Engine
app.set("view engine", ".hbs");
app.engine(".hbs", hbs.engine({
	extname: ".hbs",
	layout: "main"
}));

// Routes
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/vendor", express.static(path.join(__dirname, "vendor")));
app.use("/", rateLimit, require("./routers/main"));
app.use("/api", rateLimit, require("./routers/api"));

// Web start
app.listen(app.get("port"), async () => {
	await db.query(`CREATE TABLE IF NOT EXISTS users (id INT(200) NOT NULL AUTO_INCREMENT, username VARCHAR(30) NOT NULL, password VARCHAR(65) NOT NULL, email TEXT NOT NULL, deleted BOOLEAN NOT NULL, graduated BOOLEAN NOT NULL, admin BOOLEAN NOT NULL, discordId TEXT NOT NULL,PRIMARY KEY (id))`);
	await db.query(`CREATE TABLE IF NOT EXISTS pending_users (discordId TEXT NOT NULL)`);
	logs.info("web", "Web Server at port " + app.get("port"));
});

setInterval(() => {
	for (const key of rateLimits.keys()) {
		rateLimits.delete(key);
		rateLimits.set(key, { current: 0, max: 100 });
	}
	logs.info("web", `Ratelimits cleared, IPs registered on ratelimit: ${rateLimits.lenght}`);
}, 60000);