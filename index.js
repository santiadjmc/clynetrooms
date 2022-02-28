require("dotenv").config();
const { Client, MessageEmbed, MessageButton, MessageActionRow, Collection } = require("discord.js");
const logs = require("./logs");
const fs = require("fs");
const { WebSocketServer } = require("ws");
require("./server");
const wait = require("util").promisify(setTimeout);
const client = new Client({
	intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"]
});
const prefix = "c.";

client.on("ready", async () => {
	logs.success("bot", "Logged into discord");
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
// WebSockets server
const wss = new WebSocketServer({ port: 8888 });
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