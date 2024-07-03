const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scheduleevent')
		.setDescription('Schedules a new event after receiving 3 reactions.'),

		run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ ephemeral: true });

		// Create a modal
		const modal = new ModalBuilder()
			.setCustomId('eventModal')
			.setTitle('Schedule Event');

		// Add text input fields to the modal
		const nameInput = new TextInputBuilder()
			.setCustomId('eventName')
			.setLabel('Event Name')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Enter the event name')
			.setRequired(true);

		const descriptionInput = new TextInputBuilder()
			.setCustomId('eventDescription')
			.setLabel('Event Description')
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Enter the event description')
			.setRequired(true);

		const startTimeInput = new TextInputBuilder()
			.setCustomId('eventStartTime')
			.setLabel('Start Time (HH:mm)')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Enter the start time (HH:mm)')
			.setRequired(true);

		const locationInput = new TextInputBuilder()
			.setCustomId('eventLocation')
			.setLabel('Event Location')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Enter the event location')
			.setRequired(true);

		// Add inputs to the modal
		modal.addComponents(
			new ActionRowBuilder().addComponents(nameInput),
			new ActionRowBuilder().addComponents(descriptionInput),
			new ActionRowBuilder().addComponents(startTimeInput),
			new ActionRowBuilder().addComponents(locationInput)
		);

		// Show the modal
		await interaction.reply({ content: 'Schedule Event', components: [modal], ephemeral: true });

		// Handle the modal submission
		client.on('interactionCreate', async modalInteraction => {
			if (!modalInteraction.isModalSubmit()) return;

			if (modalInteraction.customId === 'eventModal') {
				const name = modalInteraction.fields.getTextInputValue('eventName');
				const description = modalInteraction.fields.getTextInputValue('eventDescription');
				const startTime = modalInteraction.fields.getTextInputValue('eventStartTime');
				const location = modalInteraction.fields.getTextInputValue('eventLocation');

				const [hour, minute] = startTime.split(':').map(Number);
				if (minute % 15 !== 0) {
					await modalInteraction.reply({ content: 'Please enter the time in increments of 15 minutes (e.g., 10:00, 10:15, 10:30).', ephemeral: true });
					return;
				}

				// Create and send an embed with the event details
				const embed = new EmbedBuilder()
					.setTitle(name)
					.setDescription(description)
					.addFields(
						{ name: 'Start Time', value: startTime },
						{ name: 'Location', value: location }
					)
					.setColor('#00FF00');

				const confirmationMessage = await modalInteraction.reply({ embeds: [embed], fetchReply: true });

				// React to the message
				await confirmationMessage.react('👍');

				const reactionFilter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;
				const collector = confirmationMessage.createReactionCollector({ filter: reactionFilter, max: 3, time: 60000 });

				collector.on('collect', (reaction, user) => {
					console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
				});

				collector.on('end', async collected => {
					if (collected.size === 3) {
						try {
							const guild = await interaction.guild.fetch();
							const eventManager = guild.scheduledEvents;

							const startDate = new Date();
							startDate.setHours(hour, minute, 0, 0);

							const newEvent = await eventManager.create({
								name,
								description,
								scheduledStartTime: startDate.toISOString(),
								scheduledEndTime: new Date(startDate.getTime() + 3600000).toISOString(), // 1 hour duration
								privacyLevel: 2, // GUILD_ONLY
								entityType: 3, // EXTERNAL
								entityMetadata: { location }
							});

							const successEmbed = new EmbedBuilder()
								.setTitle('Event Created')
								.setDescription(`The event **${newEvent.name}** has been created successfully.`)
								.setColor('#00FF00');

							await modalInteraction.followUp({ embeds: [successEmbed] });
						} catch (error) {
							console.error('Error creating event:', error);
							await modalInteraction.followUp({ content: 'There was an error creating the event.' });
						}
					} else {
						await modalInteraction.followUp({ content: 'Not enough reactions received to create the event.' });
					}
				});
			}
		});
	},

	options: {
		devOnly: true,
	},
};
