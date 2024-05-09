const { ApplicationCommandType, EmbedBuilder } = require('discord.js');

module.exports = {
	data: {
		name: 'Report Message',
		type: ApplicationCommandType.Message,
	},

	run: async ({ interaction, client, handler }) => {
		try {
			// Defer the reply to indicate that the bot is processing
			await interaction.deferReply();

			// Send the reported message to a specific channel
			const reportChannelId = '707992801656176670';
			const reportChannel = interaction.guild.channels.cache.get(reportChannelId);
			if (!reportChannel) {
				return interaction.followUp('Error: Report channel not found.');
			}

			// Create an embed with information about the reported message
			const embed = new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle('Reported Message')
			.setDescription(`Author: ${interaction.targetMessage.author.toString()}`)
			.addFields(
				{ name: 'Message', value: interaction.targetMessage.content },
				{ name: 'Channel', value: `<#${interaction.targetMessage.channel.id}>` },
				{ name: 'Jump Link', value: `[Jump to Message](${interaction.targetMessage.url})` },
				{ name: 'Message Created At', value: interaction.targetMessage.createdAt.toLocaleString() },
			)
			.setTimestamp()
			.setFooter({ text: `Reported by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });


			// Send the embed to the report channel
			await reportChannel.send({ embeds: [embed] });

			// Reply to the interaction
			 await interaction.followUp({ content: 'Message reported successfully.', ephemeral: true });
			} catch (error) {
				console.error('Error reporting data:', error);
				await interaction.followUp({ content: 'An error occurred while reporting. Please try again later.', ephemeral: true });
			}
    },

    options: {
        devOnly: true,
        userPermissions: [],
        botPermissions: [],
        deleted: false,
    },
};

