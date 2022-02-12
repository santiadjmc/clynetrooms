const LogManager = require("./managers/LogManager.js");
const logs = new LogManager(["bot", "web", "websocket"]);
module.exports = logs;