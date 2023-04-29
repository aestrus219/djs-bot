const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcomer')
        .setDescription('Manage the welcome module for this server'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Welcome Module')
            .setColor('Random')
            .addFields(
                {
                    name: "Channel", value: "#channel"
                },
                {
                    name: "AutoRoles", value: "@Newbies"
                },
                {
                    name: "Message", value: "Welcome {user} to the server!"
                }
            )
            .setDescription('Give your new users a great welcome! Use the buttons below to configure the welcome module.');

        const settings = new ButtonBuilder()
            .setCustomId('settings')
            .setLabel('Manage Settings')
            .setStyle(ButtonStyle.Primary)

        const disable = new ButtonBuilder()
            .setCustomId('disable')
            .setLabel('Disable Module')
            .setStyle(ButtonStyle.Danger)

        const reset = new ButtonBuilder()
            .setCustomId('reset')
            .setLabel('Reset settings to default')
            .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder()
            .addComponents(settings, disable, reset);

        const response = await interaction.reply({
            embeds: [embed],
            components: [row]
        })
        
        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
        
            if (confirmation.customId === 'settings') {
               const modal = new ModalBuilder()
               .setCustomId('welcomeModal')
               .setTitle('Welcome Module Settings');

               const channelList = new TextInputBuilder()
               .setCustomId('channels')
               .setLabel('Select a channel')
               .setStyle(TextInputStyle.Short)
               .setRequired(true)
               .setPlaceholder('Type the channel to log messages in');

               const welcomeMessage = new TextInputBuilder()
               .setCustomId('welcomeMessage')
               .setLabel('Welcome Message')
               .setStyle(TextInputStyle.Paragraph)
               .setRequired(true)
               .setPlaceholder('Type the greeting message for newcomers')
               .setValue('Welcome {user} to the server!');

               const row1 = new ActionRowBuilder().addComponents(channelList)
               const row2 = new ActionRowBuilder().addComponents(welcomeMessage)

               modal.addComponents(row1, row2);
               await confirmation.showModal(modal);
            } else if (confirmation.customId === 'disable') {
                await response.edit({content: "Disabled", components: []})
            } else if (confirmation.customId === 'resey') {
                await response.edit({content: "Reset", components: []})
            }
        } catch (e) {
            await console.log(e);
        }
    },
}