import { SlashCommandBuilder } from 'discord.js';
import { DEV_GUILD_IDS } from '../../../helpers/devConfig.js';

const data = new SlashCommandBuilder()
	.setName('simulate-join')
	.setDescription('Simulate a member joining.')
	.addUserOption((option) =>
		option
			.setName('target-user')
			.setDescription('The user you want to emulate joining.')
	);

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */
async function run({ interaction, client }) {
	const targetUser = interaction.options.getUser('target-user');

	let member;

	if (targetUser) {
		member =
			interaction.guild.members.cache.get(targetUser.id) ||
			(await interaction.guild.members.fetch(targetUser.id));
	} else {
		member = interaction.member;
	}

	client.emit('guildMemberAdd', member);

	interaction.reply({ content: 'Simulated join!', ephemeral: true });

	// Log command usage
	const dateTime = new Date().toISOString();
	const user = interaction.user.tag;
	const interactionId = interaction.commandName;

	console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
}

export const options = {
	devOnly: true,
};

export const metadata = {
	guilds: DEV_GUILD_IDS,
};

export const command = data.toJSON();
export const chatInput = run;
