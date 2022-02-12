const wss = require("../server");
module.exports = {
	name: "reload",
	description: "Reload all sockets or an specific one",
	aliases: [],
	execute: async function (message, args, reply, getInput, wait) {
		const { member, author, channel, guild, content, client } = message;
		if (!member.permissions.has("ADMINISTRATOR")) return reply("No tienes autorización para usar este comando");
		let target = args[0];
		if (!target) {
			const askmsg = await reply("Type the unique ID of the socket u wish to reload");
			target = await getInput();
			await askmsg.delete();
			await target.delete();
			target = target.content;
		}
		let isConnected = false;
		let ws = null;
		for (const w of wss.clients.values()) {
			if (!w.uniqueId) {
				w.send(JSON.stringify({ event: "reload", args: [] }));
				continue;
			}
			else {
				if (w.uniqueId === target) {
					isConnected = true;
					ws = w;
					break;
				}
				else continue;
			}
		}
		if (!isConnected) return reply("There is not any socket with the provided unique ID");
		ws.send(JSON.stringify({ event: "reload", args: [] }));
		reply(`The socket has been reloaded`);
	}
}