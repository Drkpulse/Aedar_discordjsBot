import { Client, GatewayIntentBits } from 'discord.js';

// CommandKit loads the commands in src/app/commands and the events in src/app/events,
// registers the slash commands and logs the bot in. This file only creates the client.
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

// The .env file uses BOT_TOKEN (CommandKit's default names are TOKEN or DISCORD_TOKEN).
client.token = process.env.BOT_TOKEN ?? process.env.DISCORD_TOKEN ?? null;

export default client;
