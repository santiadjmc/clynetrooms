const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: 8889 });
module.exports = wss;