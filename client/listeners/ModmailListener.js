const { Events, StringSelectMenuBuilder, ActionRowBuilder, ChannelType, EmbedBuilder } = require("discord.js");
const emojis = require("../emojis.json");
const vDB = require("../../database/vDB")
const db = new vDB({ instance: "User" })

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.guild) return;
        if (message.author.bot) return;
        if (message.channel.type !== ChannelType.DM) return;
        const checkSession = await db.read(message.author.id, "mm_session");
        if(checkSession=="on") return;

        const mutualGuilds = message.client.guilds.cache.filter(guild => guild.members.cache.has(message.author.id) && guild.members.cache.has(message.client.user.id));
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('shared-guilds')
            .setPlaceholder('Select your server')
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions(mutualGuilds.map(guild => ({ label: guild.name, value: guild.id })));
        const row = new ActionRowBuilder()
            .addComponents(selectMenu);

        const embed = new EmbedBuilder()
        .setTitle(`${emojis.mail} ModMail`)
        .setColor('Aqua')
        .setDescription(`**Please choose the server from the below list you want to open a modmail ticket in:**`)
        .setThumbnail(message.author.displayAvatarURL())
        ;
        await message.reply({
            embeds: [embed],
            components: [row]
        })


    }
}