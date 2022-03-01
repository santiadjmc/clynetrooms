const passport = require("passport");
const db = require("../db");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const foundU = await db.query("SELECT * FROM users WHERE users.id = ?", [id]);
    return done(null, foundU[0] ? foundU[0] : null);
});

passport.use("login", new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
}, async (req, username, password, done) => {
    const users = await db.query("SELECT * FROM users");
    let user = null;
    if (!users.find(u => u.username === username)) return done(null, false, req.flash("error", "Unknown user"));
    else user = users[users.indexOf(users.find(u => u.username === username))];
    if (!bcrypt.compareSync(password, user.password)) return done(null, false, req.flash("error", "Incorrect password"));
    return done(null, user, req.flash("success", `Bienvenido de vuelta, ${user.username}`));
}));