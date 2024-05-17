const { ModalBuilder, EmbedBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: {
		name: 'botfeedback',
		description: 'Send feedback about the bot',
	},

	run: async ({ interaction, client }) => {
		// Fetch the channel where you want to send the result
		const feedbackChannelId = '1237868787991056404'; // Replace with your channel ID
		const feedbackChannel = await client.channels.fetch(feedbackChannelId);

		if (!feedbackChannel) {
			return interaction.reply('Error: Channel not defined.');
		}

		const modal = new ModalBuilder({
			customId: `myModal-${interaction.user.id}`,
			title: 'Sugestão para o bot',
		});

		const botInput = new TextInputBuilder({
			customId: 'sugestInput',
			label: "Tens alguma opinão que querias partilhar?",
			style: TextInputStyle.Paragraph,
		});

		// An action row only holds one text input,
		const firstActionRow = new ActionRowBuilder().addComponents(botInput);

		// Add inputs to the modal
		modal.addComponents(firstActionRow);

		// Show the modal to the user
		await interaction.showModal(modal);

		const filter = (interaction) => interaction.customId === `myModal-${interaction.user.id}`;

		interaction
			.awaitModalSubmit({ filter, time: 60000 })
			.then((modalInteraction) => {
				const sugestValue = modalInteraction.fields.getTextInputValue('sugestInput');

				const embed = new EmbedBuilder()
				.setColor('#C200EB')
				.setTitle(`Sugestão para o Bot`)
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
				interaction.followUp({ content: 'O bot precisa de umas férias, tenta novamente', ephemeral: true });
			});
		// Log command usage
		 const date = new Date();
		 const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		 const user = interaction.user.tag;
		 const interactionId = interaction.commandName;

		 console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},

	options: {
		//devOnly: true,
		cooldown: '10m',
		//userPermissions: [],
		//botPermissions: [],
		//deleted: false,
	},
};

