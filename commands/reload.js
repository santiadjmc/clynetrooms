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
			const askmsg = await reply("Escribe la ID única del socket a reiniciar");
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
		if (!isConnected) return reply("No hay ningún socket conectado con la ID única proporcionada");
		ws.send(JSON.stringify({ event: "reload", args: [] }));
		reply(`El socket ha sido recargado`);
	}
}