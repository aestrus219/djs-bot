const { Events, EmbedBuilder } = require("discord.js");
const emojis = require("../emojis.json");
const vDB = require("../../database/vDB");
const guildDB = new vDB({ instance: "Guild" });
const userDB = new vDB({ instance: "User" });

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        interaction.deferReply()
        if (!interaction.isStringSelectMenu()) return
        if (interaction.customId !== "shared-guilds") return

        const guildID = interaction.values;
        const guild = interaction.client.guilds.cache.get(guildID)
        const checkSettings = await guildDB.read(guildID, "mm_module");
        if (checkSettings == "disabled")
            interaction.editReply({ content: `**The modmail module is disabled in ${guild}**` });
        else {
            await userDB.update(interaction.user.id, "mm_session", "on");
            const msg = await guildDB.read(guildID, "mm_message")
            const desc = (msg) ? msg : `A new ticket has been opened in ${guild}. Support is on their way!`

            const embed = new EmbedBuilder()
                .setTitle(`${emojis.mail_open} ModMail Ticket Opened`)
                .setColor('Green')
                .setDescription(desc)
                .setFooter({ text: `To close this ticket, type \`!CLOSE\``, iconURL: interaction.user.displayAvatarURL() });

            await interaction.editReply({
                embeds: [embed],
            })
        }


    }
}