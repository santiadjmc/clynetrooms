const wss = require("../WebSocketServer");
module.exports = {
	name: "sockets",
	description: "Shows connected sockets",
	aliases: [],
	execute: async function (message, args, reply, getInput, wait) {
		const { member, author, channel, guild, content, client } = message;
		if (!member.permissions.has("ADMINISTRATOR")) return reply("No tienes autorización para usar este comando");
		const sockets = [];
		for (const s of wss.clients.values()) {
			sockets.push(s);
		}
		reply("```\nConnected sockets: "+`${sockets.length}\n\n${sockets.map(s => `Unique ID: ${s.uniqueId}\nCurrent path: ${s.currentPath}`).join("\n----------\n")}`+"\n```");
	}
}