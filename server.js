const express = require("express");
const app = express();
const hbs = require("express-handlebars");
const session = require("express-session");
const flash = require("connect-flash");
const { WebSocketServer } = require("ws");
const path = require("path");
const morgan = require("morgan");
const logs = require("./logs");

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
app.set("view engine", ".html");
app.engine(".html", hbs.engine({
	extname: ".html",
	layout: "main"
}));

// Routes
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/", require("./router"));

// Web start
const server = app.listen(app.get("port"), () => {
	logs.info("web", "Web Server at port " + app.get("port"));
});

// WebSockets server
const wss = new WebSocketServer({ server });
module.exports = wss;