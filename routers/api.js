const { Router } = require("express");
const db = require("../db");
const logs = require("../logs");
const router = Router();
const BotClient = require("../index");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

router.get("/", (req, res) => {
    res.status(403).json({ status: 403, message: "Forbbiden" });
});

router.get("/discord/users", async (req, res) => {
    const guild = BotClient.guilds.cache.first();
    try {
        await guild.members.fetch();
    }
    catch (err) {
        logs.error("bot", err.message);
        return res.status(500).json({ warning: null, error: true, message: "Couldn't fetch members due to a unknown error" });
    }
    return res.json({ warning: null, error: false, message: "", users: guild.members.cache.map(m => {
        m.tag = m.user.tag;
        return m;
    }) });
});
router.post("/users/pending", async (req, res) => {
    const guild = BotClient.guilds.cache.first();
    const channel = await BotClient.channels.fetch("947973283331047514");
    const user = await guild.members.fetch(req.body.discordId);
    const pendingUsers = await db.query("SELECT * FROM pending_users");
    if (pendingUsers.find(u => u.discordId === user.id)) return res.json({ alreadyIn: true, dmable: null });;
    try {
        user.user.send("Mensaje de prueba");
    }
    catch (err) {
        logs.error("bot", err.message);
        return res.json({ alreadyIn: false, dmable: false });
    }
    res.json({ alreadyIn: false, dmable: true });
    let mainMsg = await user.user.send(`Se ha recibido una solicitud de inscripcion a Clynet Room por parte de esta cuenta, si no fuiste tu di 'cancelar', de lo contrario di 'continuar'`);
    async function getReply() {
        const filter = m => m.author.id === user.id;
        const collected = await mainMsg.channel.awaitMessages({ filter, max: 1 });
        return collected.first().content;
    }
    let confirmation = await getReply();
    if (confirmation.toLowerCase() === "cancelar") {
        return await user.user.send("Se ha cancelado la solicitud, gracias por confirmar.");
    }
    else if (confirmation.toLowerCase() !== "cancelar" && confirmation.toLowerCase() !== "continuar") {
        return await user.user.send("La respuesta no es valida, se ha cancelado el registro de manera automatica.");
    }
    await db.query("INSERT INTO pending_users SET ?", [{ discordId: user.id }]);
    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setCustomId(`accept-signup-${user.id}`)
        .setLabel("Aceptar")
        .setStyle("SUCCESS"),
        new MessageButton()
        .setCustomId(`decilne-signup-${user.id}`)
        .setLabel("Rechazar")
        .setStyle("DANGER")
    );
    const embed = new MessageEmbed()
    .setAuthor({ iconURL: user.displayAvatarURL({ dynamic: true }), name: user.user.username })
    .setTitle("Nueva solicitud de registro")
    .setDescription("Se les recuerda que deben analizar cuidadosamente la solicitud antes de rechazar o aceptar, pueden esntrevistar al usuario si asi lo desean")
    .addFields(
        {
            name: "Usuario",
            value: user.tag,
        },
        {
            name: "Mensaje",
            value: req.body.message
        }
    )
    .setColor("RANDOM")
});
module.exports = router;