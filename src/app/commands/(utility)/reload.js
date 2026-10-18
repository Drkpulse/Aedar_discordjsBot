import { MessageFlags } from 'discord.js';
import { DEV_GUILD_IDS } from '../../../helpers/devConfig.js';

export const command = {
	name: 'reload',
	description: 'Reloads all Commands',
};

export const metadata = {
	guilds: DEV_GUILD_IDS,
};

export const chatInput = async ({ interaction, commandkit }) => {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	// Reloading commands also reloads their middleware (the old "validations").
	// While developing with `npm run dev`, CommandKit already hot-reloads files on save.
	await commandkit.reloadCommands();
	await commandkit.reloadEvents();

	await interaction.followUp({ content: 'All Reloaded', flags: MessageFlags.Ephemeral });

	// Log command usage
	const date = new Date();
	const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
	console.log(`[${dateTime}] User: ${interaction.user.tag} | Interaction: ${interaction.commandName}`);
};

export const options = {
	devOnly: true,
};
