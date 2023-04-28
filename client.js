require('dotenv').config();
const { readdirSync } = require("fs");
const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder, REST, Routes, ActivityType } = require('discord.js');
const chalk = require("chalk");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent]
});

client.once(Events.ClientReady, c => {
    console.log(`${chalk.green.bold(`Logged in as ${c.user.tag}`)}`);
    c.user.setPresence({
        activities: [
            {
                name: 'v1.0.0 development',
                type: ActivityType.Watching
            }
        ],
    });
    c.user.setStatus("dnd");
});

//Commands Handler
client.commands = new Collection();

const commandFiles = readdirSync('./client/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./client/commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Registering slash commands with Discord API
const commands = [];
for (const command of client.commands.values()) {
    commands.push(command.data.toJSON());
}

client.login(process.env.CLIENT_TOKEN);

const rest = new REST({ version: '9' }).setToken(process.env.CLIENT_TOKEN);

(async () => {
    try {
        console.log(chalk.cyan(`[ApplicationCommands] `) + chalk.yellow(`Started refreshing application (/) commands.`));

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(chalk.cyan(`[ApplicationCommands] `) + chalk.green(`Successfully reloaded application (/) commands.`));
    } catch (error) {
        console.error(error);
    }
})();

//dev-Only messageCommands
client.on(Events.MessageCreate, (message) => {
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
        if(message.author.id !== dev) return
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        try{
            eval(args.join(' '))
        } catch(e) {
            message.reply({ content: e})
        }
    }
})