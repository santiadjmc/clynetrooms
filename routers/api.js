const { Router } = require("express");
const db = require("../db");
const logs = require("../logs");
const router = Router();
const BotClient = require("../index");
const { MessageActionRow, MessageButton, MessageEmbed, TextChannel, Collection } = require("discord.js");
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function checkHeaderAuth(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).json({ status: 401, message: "Not authorized" });
    }
    else {
        const authArgs = req.headers.authorization.trim().split("-");
        const authType = authArgs[0];
        const authId = authArgs[1];
        const allowedTypes = ["user", "system"];
        if (!allowedTypes.some(type => type === authType)) return res.status(401).json({ status: 400, message: "Invalid auth type" });
        if (authType === "system") return;
        if (isNaN(authId)) return res.status(400).json({ status: 400, message: "ID is not a number" });
        const foundId = await db.query("SELECT * FROM users WHERE users.id = ?", [Number(authId)]);
        if (!foundId[0]) return res.status(401).json({ status: 400, message: "Not authorized" });
        return next();
    }
}

router.get("/", (req, res) => {
    res.status(403).json({ status: 403, message: "Forbbiden" });
});
const activeConfirmations = new Collection();
router.get("/discord/users", checkHeaderAuth, async (req, res) => {
    const guild = BotClient.guilds.cache.first();
    try {
        await guild.members.fetch();
    }
    catch (err) {
        logs.error("bot", err.message);
        return res.status(500).json({ warning: null, error: true, message: "Couldn't fetch members due to an unknown error" });
    }
    return res.json({
        warning: null, error: false, message: "", users: guild.members.cache.map(m => {
            m.tag = m.user.tag;
            return m;
        })
    });
});
router.post("/users/pending", checkHeaderAuth, async (req, res) => {
    const guild = BotClient.guilds.cache.first();
    /**
     * @type {TextChannel}
     */
    const channel = await BotClient.channels.fetch("947973283331047514");
    const user = await BotClient.users.fetch(req.body.data.discordId);
    const pendingUsers = await db.query("SELECT * FROM pending_users");
    const users = await db.query("SELECT * FROM users");
    if (activeConfirmations.has(user.id)) return res.json({ alreadyIn: null, dmable: null, alreadyRegistered: null, alreadyConfirmating: true });
    if (pendingUsers.find(u => u.discordId === user.id)) return res.json({ alreadyIn: true, dmable: null, alreadyRegistered: null, alreadyConfirmating: false });;
    if (users.find(u => u.discordId === user.id)) return res.json({ alreadyIn: false, dmable: null, alreadyRegistered: true, alreadyConfirmating: false });
    try {
        const testmsg = await user.send(".");
        testmsg.delete();
    }
    catch (err) {
        logs.error("bot", err.message);
        return res.json({ alreadyIn: false, dmable: false, alreadyRegistered: false, alreadyConfirmating: false });
    }
    res.json({ alreadyIn: false, dmable: true, alreadyRegistered: false, alreadyConfirmating: false });
    let userDM = await user.createDM();
    await user.send(`Se ha recibido una solicitud de inscripcion a Clynet Room a nombre de esta cuenta, si no fuiste tu di 'cancelar', de lo contrario di 'continuar'`);
    activeConfirmations.set(user.id, true);
    async function getReply() {
        const filter = m => true;
        const collected = await userDM.awaitMessages({ filter, max: 1 });
        return collected.first().content;
    }
    let confirmation = await getReply();
    activeConfirmations.delete(user.id);
    if (confirmation.toLowerCase().startsWith("cancelar")) {
        await user.send("Se ha cancelado la solicitud, gracias por confirmar.");
        return;
    }
    else if (!confirmation.toLowerCase().startsWith("cancelar") && !confirmation.toLowerCase().startsWith("continuar")) {
        await user.send("La respuesta no es valida, se ha cancelado el registro de manera automatica.");
        return;
    }
    await db.query("INSERT INTO pending_users SET ?", [{ discordId: user.id }]);
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(`accept-signup-${user.id}`)
                .setLabel("Aceptar")
                .setStyle("SUCCESS"),
            new MessageButton()
                .setCustomId(`deciline-signup-${user.id}`)
                .setLabel("Rechazar")
                .setStyle("DANGER")
        );
    const embed = new MessageEmbed()
        .setAuthor({ iconURL: user.displayAvatarURL({ dynamic: true }), name: user.username })
        .setTitle("Nueva solicitud de registro")
        .setDescription("Se les recuerda que deben analizar cuidadosamente la solicitud antes de rechazar o aceptar, pueden esntrevistar al usuario si asi lo desean")
        .addFields(
            {
                name: "Usuario",
                value: user.tag,
            },
            {
                name: "IP de quien envio la solicitud",
                value: req.body.data.ip
            },
            {
                name: "Mensaje",
                value: req.body.data.message
            }
        )
        .setColor("RANDOM")
    channel.send({ embeds: [embed], components: [row] });
    user.send("Tu solicitud ha sido enviada");
});
router.get("/users/pending", checkHeaderAuth, async (req, res) => {
    const pendingUsers = await db.query("SELECT * FROM pending_users");
    if (pendingUsers.length < 1) return res.json({ users: [] });
    else res.json({ users: pendingUsers.map(u => u.discordId) });
});
module.exports = router;