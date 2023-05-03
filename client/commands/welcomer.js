const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const emojis = require("../emojis.json");
const vDB = require("../database/vDB");

const db = new vDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcomer')
        .setDescription('Manage the welcome module for this server')
        .addChannelOption(option =>
            option
            .setName('channel')
            .setDescription('Select a channel to welcome new users'))
        .addRoleOption(option =>
            option
            .setName('role')
            .setDescription('Select the role to be assigned to new users')
            ),
    async execute(interaction) {
        await interaction.deferReply();
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        if(channel){
            db.update(interaction.guild.id, 'welc_channel', channel.id)
        }
         if(role){
            db.update(interaction.guild.id, 'welc_role', role.id)
         }
        const message = await db.read(interaction.guild.id, "welc_message")
        const newChannel = await db.read(interaction.guild.id, "welc_channel");
        const newRole = await db.read(interaction.guild.id, "welc_role");
        const embed = new EmbedBuilder()
            .setTitle(`${emojis.wave} Welcome Module`)
            .setColor('Random')
            .addFields(
                {
                    name: `${emojis.channel} **Channel**`, value: `<#${newChannel}>`
                },
                {
                    name: `${emojis.at} **Auto Roles**`, value: `<@&${newRole}>`
                },
                {
                    name: `${emojis.message} **Message**`, value: message
                }
            )
            .setDescription(
                "**Give your new users a great welcome! Use the buttons below to configure the welcome module.\nMessage variables:\n\`{user.name}\`- Verfont\n\`{user.mention}\` - <@1101387030367309886>\n\`{attach.<IMAGE_URL>}\` - Sends an attachment with the URL provided**\n\n*Example Usage: Welcome {user.mention} to the server! {attach.https://example.com }*"
                );

        const welc_msg = new ButtonBuilder()
            .setCustomId('welc_msg')
            .setLabel('Welcome Message')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.message)

        const disable = new ButtonBuilder()
            .setCustomId('disable')
            .setLabel('Disable Module')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.close)

        const row = new ActionRowBuilder()
            .addComponents(welc_msg, disable);

            
        const response = await interaction.editReply({
            embeds: [embed],
            components: [row]
        })
        
        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 300_000 });
        
            if (confirmation.customId === 'welc_msg') {
               const modal = new ModalBuilder()
               .setCustomId('welcomeModal')
               .setTitle('Update Message for newcomers');

               const welcomeMessage = new TextInputBuilder()
               .setCustomId('welcomeMessage')
               .setLabel('Welcome Message')
               .setStyle(TextInputStyle.Paragraph)
               .setRequired(true)
               .setPlaceholder('Type the greeting message for newcomers')
               .setValue(message);

               const row1 = new ActionRowBuilder().addComponents(welcomeMessage)

               modal.addComponents(row1);
               await confirmation.showModal(modal);
            } else if (confirmation.customId === 'disable') {
                await response.edit({content: "Disabled", components: []})
            }
        } catch (e) {
            await response.edit({
                content: `No activity detected for 5 minutes`,
                components: [],
                embeds: []
            });
        }
    },
}