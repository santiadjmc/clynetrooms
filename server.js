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
require("./index");

// Middlewares
app.use(session({
	secret: "sEkreTTt",
	resave: false,
	saveUninitialized: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(flash());

// Global variables
app.use(async function (req, res, next) {
	app.locals.error = req.flash("error");
	app.locals.success = req.flash("success");
	app.locals.user = req.user;
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
app.use("/", require("./routers/main"));
app.use("/api", require("./routers/api"));

// Web start
const server = app.listen(app.get("port"), async () => {
	await db.query(`CREATE TABLE IF NOT EXISTS users (id INT(200) NOT NULL AUTO_INCREMENT, username VARCHAR(30) NOT NULL, password VARCHAR(65) NOT NULL, email TEXT NOT NULL, deleted BOOLEAN NOT NULL, graduated BOOLEAN NOT NULL, admin BOOLEAN NOT NULL, discordId TEXT NOT NULL,PRIMARY KEY (id))`);
	await db.query(`CREATE TABLE IF NOT EXISTS pending_users (discordId TEXT NOT NULL)`);
	logs.info("web", "Web Server at port " + app.get("port"));
});