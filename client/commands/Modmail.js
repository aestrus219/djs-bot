const {SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require("discord.js");
const emojis =require("../emojis.json");
const vDB = require("../../database/vDB");
const db = new vDB();

module.exports = {
    data: new SlashCommandBuilder()
    .setName("modmail")
    .setDescription("Manage the Modmail module for this server")
    .addChannelOption(option => option
        .setName("category")
        .setDescription("Modmail tickets will open in this cateogry")
        )
        .addChannelOption(option => option
            .setName("logs")
            .setDescription("All logs will be sent in this channel")
            )
        .addRoleOption(option => option
            .setName("staff")
            .setDescription("Staff role to be pinged whenever there is a new ticket")
            ),
    async execute(interaction) {
        await interaction.deferReply();
        const category = interaction.options.getChannel("category");
        const logs = interaction.options.getChannel("logs");
        const staff = interaction.options.getRole("staff");

        if(category) db.update(interaction.guild.id, "mm_category", category.id);
        if(logs) db.update(interaction.guild.id, "mm_logs", logs.id);
        if(staff) db.update(interaction.guild.id, "mm_staff", staff.id);

        const message = await db.read(interaction.guild.id, "mm_message");
        const newCategory = await db.read(interaction.guild.id, "mm_category");
        const newLogs = await db.read(interaction.guild.id, "mm_logs");
        const newStaff = await db.read(interaction.guild.id, "mm_staff");

        const embed = new EmbedBuilder()
        .setTitle(`${emojis.mail} Modmail Module`)
        .setDescription(`Easily manage support system, and reports for your server using Verfont' Modmail module. Users can directly contact the server staff through their DMs in private.`)
        .setColor('Blurple')
        .addFields(
            {name: `${emojis.category} Category`, value: `<#${newCategory}>`},
            {name: `${emojis.channel} Logs Channel`, value: `<#${newLogs}>`},
            {name: `${emojis.staff} Staff Role`, value: `<@&${newStaff}>`},
            {name: `${emojis.message} Ticket Message`, value: message},
        );

        const msgBTN = new ButtonBuilder()
        .setCustomId("msg-btn")
        .setStyle(ButtonStyle.Primary)
        .setLabel("Modmail Ticket Message")
        .setEmoji(emojis.message);

        const disableBTN = new ButtonBuilder()
        .setCustomId("disable-btn")
        .setStyle(ButtonStyle.Danger)
        .setLabel("Disable Module");

        const row = new ActionRowBuilder()
        .addComponents(msgBTN, disableBTN);

        const response = await interaction.editReply({
            embeds: [embed],
            components: [row]
        })

        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 300_000 });
        
            if (confirmation.customId === 'msg-btn') {
               const modal = new ModalBuilder()
               .setCustomId('modmailModal')
               .setTitle('ModMail Ticket Message');

               const modmailMessage = new TextInputBuilder()
               .setCustomId('modmailMessage')
               .setLabel('Ticket Message')
               .setStyle(TextInputStyle.Paragraph)
               .setRequired(true)
               .setPlaceholder('Type here...')
               .setValue(message);

               const row1 = new ActionRowBuilder().addComponents(modmailMessage)

               modal.addComponents(row1);
               await confirmation.showModal(modal);
            } else if (confirmation.customId === 'disable-btn') {
                await response.edit({content: "Disabled", components: [], embeds: []})
                await db.update(interaction.guild.id, "mm_module", "disabled")
            }
        } catch (e) {
            await response.edit({
                content: `No activity detected for 5 minutes`,
                components: [],
                embeds: []
            });
            console.log(e);
        }
}
}