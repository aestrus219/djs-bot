require('dotenv').config();
const { readdirSync } = require("fs");
const { join } = require("path");
const { Client, GatewayIntentBits, Collection, REST, Routes, Partials } = require('discord.js');
const chalk = require("chalk");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageTyping],
    partials: [Partials.Message, Partials.Channel, Partials.User]
});

//Events Handler
const eventsPath = join(__dirname, 'client/events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

//Interactions Handler
const interactionsPath = join(__dirname, 'client/interactions');
const interactionsFiles = readdirSync(interactionsPath).filter(file => file.endsWith('.js'));

for (const file of interactionsFiles) {
    const interactionsFilePath = join(interactionsPath, file);
    const interaction = require(interactionsFilePath);
    if (interaction.once) {
        client.once(interaction.name, (...args) => interaction.execute(...args));
    } else {
        client.on(interaction.name, (...args) => interaction.execute(...args));
    }
}

//Commands Handler
client.commands = new Collection();
const commandFiles = readdirSync('./client/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./client/commands/${file}`);
    client.commands.set(command.data.name, command);
}

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