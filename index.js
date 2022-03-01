const { Client, MessageEmbed, MessageButton, MessageActionRow, Collection } = require("discord.js");
const logs = require("./logs");
const fs = require("fs");
const { WebSocketServer } = require("ws");
const wait = require("util").promisify(setTimeout);
const bcrypt = require("bcryptjs");
const db = require("./db");
const wss = require("./WebSocketServer");
const client = new Client({
	intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "DIRECT_MESSAGES"]
});
const prefix = "c.";

client.on("ready", async () => {
	logs.success("bot", "Logged into discord");
});
process.on("unhandledRejection", async err => {
	logs.error("system", err.stack);
});

client.commands = new Collection();
const cmdsDir = fs.readdirSync("commands").filter(file => file.endsWith(".js"));
for (const file of cmdsDir) {
	try {
		logs.info("bot", `Loading command file ${file}...`);
		const cmd = require(`./commands/${file}`);
		if (!cmd.name) logs.error("bot", `Command file ${file} does not have a name property, so it won't be loaded`);
		else {
			if (!cmd.execute) logs.error("bot", `Command file ${file} does not have an execute property so it won't be loaded`);
			else {
				client.commands.set(cmd.name, cmd);
				if (!cmd.aliases) logs.warn("bot", `Command file ${file} loaded, however, it does not have an aliases property, it may bring further errors`);
				else logs.success("bot", `Command file ${file} loaded`);
			}
		}
	}
	catch (err) {
		logs.error("bot", `Could not load command file ${file} properly\n${err.stack}`);
	}
}
logs.info("bot", `Successfully Loaded ${client.commands.size}/${cmdsDir.length} commands`);
client.on("messageCreate", async message => {
	const { channel, member, author, guild, content } = message;
	if (!guild || message.bot) return;
	if (!content.toLowerCase().startsWith(prefix)) return;
	async function reply(content) {
		if (typeof content === "string") {
			content = { content, allowedMentions: { repliedUser: false } };
		}
		else if (typeof content === "object") {
			content.allowedMentions = { repliedUser: false };
		}
		return await message.reply(content).catch(err => {
			logs.error("bot", `Couldn't reply to ${author.username} properly\n${err.stack}`);
			delete content.allowedMentions;
			channel.send(content);
		});
	}
	async function getInput() {
		const filter = m => m.author.id === author.id;
		const collected = await channel.awaitMessages({ filter, max: 1 });
		return collected.first();
	}
	const args = content.slice(prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();
	if (cmd.length < 1) return;
	logs.info("bot", "Received command");
	const foundCmd = client.commands.get(cmd) ?? client.commands.find(c => c.aliases.includes(cmd));
	if (!foundCmd) {
		logs.info("bot", "Command does not exists, ignored");
		return reply("Ese comando no existe!");
	}
	logs.info("bot", "Executing command...");
	try {
		await foundCmd.execute(message, args, reply, getInput, wait);
		logs.success("bot", `Command ${foundCmd.name} executed by ${author.tag}`);
	}
	catch (err) {
		logs.error("bot", `Could not execute command ${foundCmd.name} properly\n${err.stack}`);
		return reply("There was an unexpected error while executing the command");
	}
});
client.on("interactionCreate", async interaction => {
	if (interaction.isButton()) {
		if (interaction.customId.startsWith(`accept-signup-`)) {
			await interaction.deferReply({ ephemeral: true });
			const user = await client.users.fetch(interaction.customId.slice("accept-signup-".length));
			let testmsg;
			try {
				testmsg = await user.send(".");
			}
			catch (err) {
				logs.error("bot", err.message);
				await db.query("DELETE FROM pending_users WHERE pending_users.discordId = ?", [user.id]);
				interaction.editReply("No se le pueden enviar mensajes al usuario, ha sido eliminada su solicitud");
				return interaction.message.delete();
			}
			if (testmsg) await testmsg.delete();
			await db.query("DELETE FROM pending_users WHERE pending_users.discordId = ?", [user.id]);
			interaction.editReply("Se ha aceptado al usuario, cuando se complete el formulario va a ser registrado");
			const userMainMsg = await user.send("Tu inscripcion para unirte a Clynet Room ha sido aceptada, a continuacion te hare una serie de preguntas para tu registro");
			async function getReply() {
				const filter = m => !m.author.bot;
				const collected = await userMainMsg.channel.awaitMessages({ filter, max: 1 });
				return collected.first().content;
			}
			let formData = {};
			async function getForm() {
				await user.send("Introduce tu correo");
				const email = await getReply();
				const foundEmail = await db.query("SELECT * FROM users WHERE users.email = ?", [email]);
				if (foundEmail.length > 0) {
					user.send("Correo ya en uso, se va a reiniciar el formulario.");
					await getForm();
					return;
				}
				await user.send("Introduce tu contraseña (Esta es totalmente privada)");
				let password = await getReply();
				password = bcrypt.hashSync(password, bcrypt.genSaltSync());
				await user.send("Introduce tu nombre de usuario");
				let username = await getReply();
				const foundUsername = await db.query("SELECT * FROM users WHERE users.username = ?", [username]);
				if (foundUsername[0]) {
					await user.send("Nombre de usuario ya en uso, se va a reiniciar el formulario.");
					await getForm();
					return;
				}
				if (username.length > 30) {
					await user.send("El nombre de usuario debe tener 30 o menos caracteres, se va a reiniciar el formulario.");
					await getForm();
					return;
				}
				formData = { username, email, password }
			}
			await getForm();
			await db.query("INSERT INTO users SET ?", [{
				username: formData.username,
				email: formData.email,
				password: formData.password,
				deleted: false,
				admin: false,
				discordId: user.id,
				graduated: false
			}]);
			await user.send("Tu cuenta ha sido registrada, puedes iniciar sesion, felicidades!");
		}
		else if (interaction.customId.startsWith("deciline-signup-")) {
			await interaction.deferReply({ ephemeral: true });
			const user = await client.users.fetch(interaction.customId.slice("deciline-signup-".length));
			let dmable = true;
			let testmsg;
			try {
				const testmsg = await user.send(".");
				testmsg.delete();
			}
			catch (err) {
				logs.error("bot", err.message);
				dmable = false;
			}
			if (testmsg) await testmsg.delete();
			await db.query("DELETE FROM pending_users WHERE pending_users.discordId = ?", [user.id]);
			if (dmable) {
				await user.send("Tu solicitud de inscripcion en Clynet Room ha sido rechazada");
				interaction.editReply("El usuario ha sido rechazado y notificado.");
				await interaction.message.delete();
			}
			else {
				interaction.editReply("El usuario ha sido rechazado pero no pudo ser notificado.");
				await interaction.message.delete();
			}
		}
	}
});
// WebSockets server
wss.on("connection", wssHandler);
/**
 * @param {WebSocket} ws
 */
async function wssHandler(ws) {
	ws.onmessage = async function (event) {
		const data = JSON.parse(event.data);
		/**
		 * @type {string} eventName
		 */
		const eventName = data.event;
		/**
		 * @type {string[]} eventArgs
		 */
		const eventArgs = data.args;
		switch (eventName) {
			case "auth-unique-id": {
				ws.uniqueId = eventArgs[0];
			}
			case "path-set": {
				ws.currentPath = eventArgs[0];
			}
		}
	}
}
client.login(process.env.TOKEN);
module.exports = client;