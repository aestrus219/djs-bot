const { Events } = require("discord.js");
const vDB = require("../database/vDB");
const db = new vDB();

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (db.read(member.guild.id, "welc_module") === "disabled") return;
        const id = await db.read(member.guild.id, "welc_channel")
        const channel =  member.guild.channels.cache.get(id)
        const originalMessage = await db.read(member.guild.id, "welc_message")
        const modifiedMsg = await originalMessage.replace("{user.name}", member.user.username)
        const message = await modifiedMsg.replace("{user.mention}", `<@${member.id}>`)
        const match = /\{attach\.([^\}]+)\}/.exec(message);
        const attachment  = match ? match[1] : null;
        await channel.send({
            content: message,
            attachment: attachment,
        })
    }
}