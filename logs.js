const LogManager = require("./managers/LogManager.js");
const logs = new LogManager(["bot", "web", "websocket", "system"]);
module.exports = logs;