const { Events, ActivityType } = require("discord.js");
const chalk = require("chalk");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(c) {
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
    }
}