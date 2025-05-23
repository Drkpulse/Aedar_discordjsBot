const { ModalBuilder, EmbedBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: {
		name: 'sugestao',
		description: 'Envia a tua sugestão sobre o Server',
	},

	run: async ({ interaction, client }) => {
		// Fetch the channel where you want to send the result
		const feedbackChannelId = process.env.SUGGESTION_CHANNELID; // Replace with your channel ID
		const feedbackChannel = await client.channels.fetch(feedbackChannelId);

		if (!feedbackChannel) {
			return interaction.reply('Error: Channel not defined.');
		}

		const modal = new ModalBuilder({
			customId: `myModal-${interaction.user.id}`,
			title: 'Sugestão',
		});

		const feedbackInput = new TextInputBuilder({
			customId: 'suggestInput',
			label: "Tens alguma opinão que querias partilhar?",
			style: TextInputStyle.Paragraph,
		});

		// An action row only holds one text input,
		const firstActionRow = new ActionRowBuilder().addComponents(feedbackInput);

		// Add inputs to the modal
		modal.addComponents(firstActionRow);

		// Show the modal to the user
		await interaction.showModal(modal);

		const filter = (interaction) => interaction.customId === `myModal-${interaction.user.id}`;

		interaction
			.awaitModalSubmit({ filter, time: 60000 })
			.then((modalInteraction) => {
				const sugestValue = modalInteraction.fields.getTextInputValue('suggestInput');

				const embed = new EmbedBuilder()
				.setColor('#38B3E3')
				.setTitle(`Sugestão`)
				.setDescription(`${sugestValue}`)
				//.setThumbnail()
				.setTimestamp()
				.setFooter({ text: `Enviado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL()});

				// Send the result to the feedback channel
				feedbackChannel.send({ embeds: [embed] });

				// Positive Response to User
				modalInteraction.reply({ content: 'Obrigado pela Sugestão <a:hay:1202624710735822878>', ephemeral: true });

			})
			.catch((err) => {
				console.error('Error:', err);
				interaction.followUp({ content: 'Ups, alguem tropeçou numa ficha', ephemeral: true });
			});
	},

	options: {
		cooldown: '2m',
	},
};

