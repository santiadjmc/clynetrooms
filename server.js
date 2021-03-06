const express = require("express");
const app = express();
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const hbs = require("express-handlebars");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const logs = require("./logs");
const db = require("./db");
const passport = require("passport");
const MySqlStore = require("express-mysql-session");
const { Collection } = require("discord.js");
const morgan = require("morgan");
const { WebSocketServer } = require("ws");
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
app.use(morgan("common", {
	skip: (req, res) => res.statusCode === 429
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Ratelimits system
function rateLimit(req, res, next) {
	const ip = req.ip.replace("::ffff:", "");
	if (rateLimits.has(ip)) {
		const rObject = rateLimits.get(ip);
		if (rObject.current === rObject.max) {
			return res.destroy();
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
	if (req.user) {
		if (req.user.admin) {
			app.locals.isAdmin = true;
		}
		else {
			delete app.locals.isAdmin;
		}
	}
	else {
		delete app.locals.isAdmin;
	}
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
app.use("/hidden", express.static(path.join(__dirname, "views/hidden")));
app.use("/", require("./routers/main"));
app.use("/api", rateLimit, require("./routers/api"));

//Cert
// const ssl = https.createServer(
// 	{
// 		key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
// 		cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
// 	},
// 	app
// )

// Web start
const server = app.listen(app.get("port"), async () => {
	await db.query(`CREATE TABLE IF NOT EXISTS users (id INT(200) NOT NULL AUTO_INCREMENT, username VARCHAR(30) NOT NULL, password VARCHAR(65) NOT NULL, email TEXT NOT NULL, deleted BOOLEAN NOT NULL, graduated BOOLEAN NOT NULL, admin BOOLEAN NOT NULL, discordId TEXT NOT NULL, last_ip TEXT NOT NULL, PRIMARY KEY (id))`);
	await db.query(`CREATE TABLE IF NOT EXISTS pending_users (discordId TEXT NOT NULL)`);
	logs.info("web", "Web Server at port " + app.get("port"));
});
// WebSockets server
const wss = new WebSocketServer({ server })
wss.on("connection", wssHandler);
/**
 * @param {WebSocket} ws
 */
async function wssHandler(ws) {
	ws.onmessage = async function (event) {
		const data = JSON.parse(event.data);
		/**
		 * @type {string} eventName
		 */
		const eventName = data.event;
		/**
		 * @type {string[]} eventArgs
		 */
		const eventArgs = data.args;
		switch (eventName) {
			case "auth-unique-id": {
				if (ws.uniqueId) {
					ws.send(JSON.stringify({ event: "error", args: ["UniqueID already set"] }));
					break;
				}
				ws.uniqueId = eventArgs[0];
			}
			case "path-set": {
				if (ws.path) {
					ws.send(JSON.stringify({ event: "error", args: ["Path already set"] }));
					break;
				}
				ws.currentPath = eventArgs[0];
			}
		}
	}
}
setInterval(() => {
	for (const key of rateLimits.keys()) {
		rateLimits.delete(key);
	}
}, 60000);