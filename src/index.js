require('dotenv/config');
const { Client, GatewayIntentBits } = require('discord.js');
const { CommandKit } = require('commandkit');
const commandStateManager = require('./helpers/commandStateManager');
const envManager = require('./helpers/envManager');

// Check if required environment variables are set
if (!envManager.displayStatus()) {
    console.error('Bot startup failed due to missing required environment variables');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences,
    ],
});

// Initialize command state manager and enable essential commands
(async () => {
    await commandStateManager.initialize();

    // Enable essential commands that should work by default
    await commandStateManager.enableEssentialCommands([
        'help',
        'togglecommand',
        'commandstates',
        'info',
        'ping'
        // Add other essential commands that don't need special env variables
    ]);

    console.log('Command state manager initialized');
})();

new CommandKit({
    client,
    devGuildIds: ['634306671908225026'],
    devUserIds: ['121746634542415872','212730393412108288'],
    eventsPath: `${__dirname}/events`,
    commandsPath: `${__dirname}/commands`,
    validationsPath: `${__dirname}/validations`,
    bulkRegister: true, // Cleans unusued commands and Registers all at once
    //skipBuiltInValidations: true, // Skips commmand options validation
});

client.login(process.env.BOT_TOKEN);
