const { ApplicationCommandType, EmbedBuilder } = require('discord.js');

module.exports = {
	data: {
		name: 'Reporta Mensagem',
		type: ApplicationCommandType.Message,
	},

	run: async ({ interaction, client, handler }) => {
		try {
			// Defer the reply to indicate that the bot is processing
			await interaction.deferReply({ ephemeral: true });

			// Send the reported message to a specific channel
			const reportChannelId = process.env.REPORT_CHANNELID;
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
			 await interaction.followUp({ content: 'A Mensagem foi reportada!', ephemeral: true });
			} catch (error) {
				console.error('Error reporting data:', error);
				await interaction.followUp({ content: 'Ocorreu um erro a reportar, tenta novamente', ephemeral: true });
			}
	},

	options: {
		cooldown: '20s',
	},
};

