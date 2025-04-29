const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('assignrole')
		.setDescription('Assigns a chosen role to everyone in a selected event.')
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('The role to assign')
				.setRequired(true)
		),

	run: async ({ interaction, client }) => {
		try {
			// Get the role from the command options
			const role = interaction.options.getRole('role');

			const events = await client.guilds.cache.get(interaction.guildId).scheduledEvents.fetch();
			if (!events.size) {
				return interaction.reply({ content: 'No events found in this guild.', ephemeral: true });
			}

			const selectOptions = events.map((event, id) =>
				new StringSelectMenuOptionBuilder()
					.setLabel(event.name)
					.setValue(id)
			);

			const selectMenus = splitIntoSelectMenus(selectOptions, 'select_event', 'Select an event');

			await interaction.reply({
				content: 'Select an event to assign the role to all attendees:',
				components: selectMenus.map(menu => new ActionRowBuilder().addComponents(menu)),
				ephemeral: true
			});

			const filter = i => i.customId.startsWith('select_event') && i.user.id === interaction.user.id;
			const collectedEvent = await interaction.channel.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect });

			const eventId = collectedEvent.values[0];
			const event = events.get(eventId);

			await assignRoleToEventAttendees(client, interaction.guildId, eventId, role.id);

			await collectedEvent.update({ content: `Role ${role.name} has been assigned to all attendees of the event ${event.name}.`, components: [] });
		} catch (error) {
			console.error('Error assigning role to event attendees:', error);
			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({ content: `Error assigning role to event attendees: ${error.message}`, ephemeral: true });
			} else {
				await interaction.followUp({ content: `Error assigning role to event attendees: ${error.message}`, ephemeral: true });
			}
		}
	},
	options: {
		userPermissions: ['Administrator'],
		devOnly: true,
	},
};

async function assignRoleToEventAttendees(client, guildId, eventId, roleId) {
	try {
		const guild = await client.guilds.fetch(guildId);
		const event = await guild.scheduledEvents.fetch(eventId, { withUserCount: true });

		let attendees = [];
		let lastId = null;
		do {
			const fetchedAttendees = await client.rest.get(`/guilds/${guildId}/scheduled-events/${eventId}/users`, {
				query: {
					limit: 100,
					after: lastId
				}
			});
			attendees = attendees.concat(fetchedAttendees);
			lastId = fetchedAttendees.length > 0 ? fetchedAttendees[fetchedAttendees.length - 1].user.id : null;
		} while (lastId);

		for (const attendee of attendees) {
			const member = await guild.members.fetch(attendee.user.id);
			if (!member.roles.cache.has(roleId)) {
				await member.roles.add(roleId);
				console.log(`Added role to user ${member.user.tag}`);
			} else {
				console.log(`User ${member.user.tag} already has the role`);
			}
		}

		console.log(`Role added to all users attending the event ${eventId}`);
	} catch (error) {
		console.error('Error assigning roles to event attendees:', error);
	}
}

function splitIntoSelectMenus(options, customId, placeholder) {
	const menus = [];
	for (let i = 0; i < options.length; i += 25) {
		const menu = new StringSelectMenuBuilder()
			.setCustomId(`${customId}_${i / 25}`)
			.setPlaceholder(placeholder)
			.addOptions(options.slice(i, i + 25));
		menus.push(menu);
	}
	return menus;
}
