require("dotenv").config();

const { Events } = require("discord.js");
module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        const prefix = process.env.CLIENT_PREFIX
        const dev = process.env.CLIENT_OWNER
        if (message.content == `${prefix}ping`) {
            if (message.author.id !== dev) return;
            var latency = client.ws.ping;
            let color = 'White';
            if (latency <= 100)
                color = 'Green'
            else if (latency <= 500 && latency > 100)
                color = 'Yellow'
            else color = 'Red'

            if (message.guild) {
                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle("Connection Status")
                    .setDescription(`Latency: \`${latency}\` ms`)
                    .setTimestamp()
                message.reply({ embeds: [embed] })
            } else return
        } else if (message.content == `${prefix}eval`) {
            if (message.author.id !== dev) return
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            try {
                eval(args.join(' '))
            } catch (e) {
                message.reply({ content: e })
            }
        }
    }
} 