require('dotenv').config();
const axios = require('axios');
const { Client, IntentsBitField, EmbedBuilder, userMention, ActivityType, TimestampStyles } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.GuildModeration,
		IntentsBitField.Flags.GuildPresences,
		IntentsBitField.Flags.GuildScheduledEvents,
	],
});


eventHandler(client);

client.login(
	process.env.DISCORD_BOT_TOKEN
);
