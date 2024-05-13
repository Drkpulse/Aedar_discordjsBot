require('dotenv/config');
const { Client, GatewayIntentBits } = require('discord.js');
const { CommandKit } = require('commandkit');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

new CommandKit({
	client,
	devGuildIds: ['634306671908225026'],
	devUserIds: ['121746634542415872'],
	eventsPath: `${__dirname}/events`,
	commandsPath: `${__dirname}/commands`,
	validationsPath: `${__dirname}/validations`,
	//bulkRegister: true, // Cleans unusued commands and Registers all at once
	//skipBuiltInValidations: true, // Skips commmand options validation

})

client.login(process.env.BOT_TOKEN);
