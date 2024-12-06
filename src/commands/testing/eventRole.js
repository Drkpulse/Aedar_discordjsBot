const { SlashCommandBuilder } = require('discord.js');
const consoleLog = require('../../events/ready/console-log');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eventrole')
		.setDescription('Seleciona um evento e uma role para dar aos que vão')
		.addStringOption((option) =>
			option
				.setName('event')
				.setDescription('Escolher o evento')
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addRoleOption((option) =>
			option
				.setName('role')
				.setDescription('Role a adicionar aos utilizadores')
				.setRequired(false) // Make this option not required
		),

	run: async ({ interaction, client }) => {
		const selectedEventId = interaction.options.getString('event');
		const role = interaction.options.getRole('role');

		// Log the interaction options for debugging
		console.log('Interaction Options:', interaction.options);

		// Check if the interaction is in a guild
		if (!interaction.guild) {
			return interaction.reply('Este comando só funciona num servidor.');
		}

		const guild = client.guilds.cache.get(interaction.guild.id);
		if (!guild) {
			return interaction.reply('Guild not found in cache.');
		}

		let roleToUse = role;

		// If no role is provided, create a new role with the event name
		if (!roleToUse) {
			try {
				// Fetch the event to get its name
				const event = await guild.scheduledEvents.fetch(selectedEventId);
				const eventName = event.name; // Get the event name

				roleToUse = await guild.roles.create({
					name: eventName, // Use the event name as the role name
					reason: `Role created for event: ${eventName}`,
				});
				console.log(`Created new role: ${roleToUse.name}`);
			} catch (error) {
				console.error('Error creating role:', error);
				return interaction.reply('Erro ao criar a role. Tente novamente.');
			}
		}

		try {
			// Fetch the scheduled event
			const guildScheduledEvent = await guild.scheduledEvents.fetch(selectedEventId);

			// Fetch subscribers of the scheduled event
			const subscribers = await guildScheduledEvent.fetchSubscribers();

			// Initialize a message to show progress
			const progressMessage = await interaction.reply({ content: 'A adicionar roles...', fetchReply: true });

			// Convert subscribers to an array
			const subscriberArray = Array.from(subscribers);
			const totalSubscribers = subscriberArray.length;

			// Check if there are any subscribers
			if (totalSubscribers === 0) {
				return interaction.editReply('Não existem clientes com esse evento.');
			}

			// Process subscribers in batches of 30
			const batchSize = 30;
			let usersAdded = 0; // Counter for users added

			const updateReply = async () => {
				await progressMessage.edit(`Adicionados **${usersAdded} de ${totalSubscribers}** utilizadores com a role **${roleToUse.name}**.`);
			};

			for (let i = 0; i < totalSubscribers; i += batchSize) {
				const batch = subscriberArray.slice(i, i + batchSize);

				for (const [id, subscriber] of batch) {
					// Fetch the member using the User ID
					const member = await interaction.guild.members.fetch(id).catch(err => {
						console.log(`Member not found for user ID: ${id}`);
						return null; // Return null if the member is not found
					});
					// Check if the member is valid
					if (member) {
						// Check if the member already has the role
						if (!member.roles.cache.has(roleToUse.id)) { // Use roleToUse.id instead of role.id
							await member.roles.add(roleToUse);
							usersAdded++; // Increment the counter
							await updateReply(); // Update the reply after each addition
						}
					}
				}
				// Wait for 1 second before processing the next batch
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
			// Final message after all users have been processed
			await progressMessage.edit(`Todos os participantes do evento **${guildScheduledEvent.name}** receberam a role **${roleToUse.name}**.`);
		} catch (error) {
			console.error(error);
			await progressMessage.edit('An error occurred while processing your request. Please check the event ID and role.');
		}
	},
	autocomplete: async ({ interaction, client }) => {
		const focusedEventOption = interaction.options.getFocused(true);

		if (focusedEventOption.name === 'event') {
			try {
								// Fetch ongoing scheduled events
								const ongoingEvents = await client.guilds.cache.get(interaction.guild.id).scheduledEvents.fetch();

								// Map the filtered choices to the format required for autocomplete
								const results = ongoingEvents.map(event => {
									return {
										name: `${event.name}`,
										value: event.id,
									};
								});

								// Respond with the first 25 results
								await interaction.respond(results.slice(0, 25));
							} catch (error) {
								console.error('Error fetching events:', error);
								await interaction.respond([]);
							}
						}
					},
				};

