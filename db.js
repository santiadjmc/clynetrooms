const { createConnection } = require("mysql");
const logs = require("./logs");
const db = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
db.connect();
db.query = require("util").promisify(db.query);
logs.success("system", "The connection with the database was successful");
module.exports = db;