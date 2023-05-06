const { Events, EmbedBuilder } = require("discord.js");
const emojis = require("../emojis.json")
const vDB = require('../../database/vDB');
const db = new vDB({ instance: "Guild" });

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === "welcomeModal") {
            const message = interaction.fields.getTextInputValue("welcomeMessage");
            const embed = new EmbedBuilder()
                .setTitle(`${emojis.message} Welcome Message`)
                .setColor('Green')
                .setDescription(`**Successfully changed the welcome message to:**\n${message}`)
                .setTimestamp()
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL() })
            await db.update(interaction.guild.id, "welc_message", message)
                .then(interaction.reply({
                    embeds: [embed],
                }))


        }

    }
}