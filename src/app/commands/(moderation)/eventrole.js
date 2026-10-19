import { SlashCommandBuilder, InteractionContextType, MessageFlags } from 'discord.js';
import { getOrCreateEventRole, fetchAllSubscriberIds } from '../../../helpers/eventRoles.js';

// Gives a role to everyone already going to a scheduled event.
// New sign-ups get the event role automatically (src/app/events/guildScheduledEventUserAdd),
// so this is for events that existed before the bot, or for giving a different role.

export const command = new SlashCommandBuilder()
	.setName('eventrole')
	.setDescription('Dá uma role a todos os que vão a um evento')
	.setContexts(InteractionContextType.Guild)
	.addStringOption((option) =>
		option.setName('event')
			.setDescription('Escolher o evento')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addRoleOption((option) =>
		option.setName('role')
			.setDescription('Role a dar (por defeito, a role "<evento> Evento")')
			.setRequired(false)
	).toJSON();

export const chatInput = async ({ interaction }) => {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	try {
		const event = await interaction.guild.scheduledEvents.fetch(interaction.options.getString('event')).catch(() => null);
		if (!event) return interaction.editReply('Evento não encontrado. Escolha um evento da lista.');

		const role = interaction.options.getRole('role') ?? await getOrCreateEventRole(interaction.guild, event);
		if (!role.editable) {
			return interaction.editReply(`Não consigo dar a role **${role.name}**: está acima da minha role mais alta.`);
		}

		const subscriberIds = await fetchAllSubscriberIds(event);
		if (subscriberIds.length === 0) {
			return interaction.editReply(`Ninguém está inscrito no evento **${event.name}**.`);
		}

		let added = 0;
		let alreadyHad = 0;
		let missing = 0;
		for (const [index, id] of subscriberIds.entries()) {
			const member = await interaction.guild.members.fetch(id).catch(() => null);
			if (!member) {
				missing++;
			} else if (member.roles.cache.has(role.id)) {
				alreadyHad++;
			} else {
				await member.roles.add(role, `/eventrole for ${event.name} by ${interaction.user.tag}`);
				added++;
			}

			if ((index + 1) % 10 === 0) {
				await interaction.editReply(`A dar a role **${role.name}**... ${index + 1}/${subscriberIds.length}`).catch(() => {});
			}
		}

		let summary = `✅ Role **${role.name}** dada a **${added}** participantes do evento **${event.name}**.`;
		if (alreadyHad) summary += `\n${alreadyHad} já tinham a role.`;
		if (missing) summary += `\n${missing} já não estão no servidor.`;
		await interaction.editReply(summary);
	} catch (error) {
		console.error('Erro no /eventrole:', error);
		await interaction.editReply('Ocorreu um erro ao dar a role. Verifique as minhas permissões e tente novamente.').catch(() => {});
	}
};

export const autocomplete = async ({ interaction }) => {
	try {
		const focused = interaction.options.getFocused().toLowerCase();
		const events = await interaction.guild.scheduledEvents.fetch();
		const choices = events
			.filter((event) => event.name.toLowerCase().includes(focused))
			.map((event) => ({ name: event.name.slice(0, 100), value: event.id }));
		await interaction.respond(choices.slice(0, 25));
	} catch (error) {
		console.error('Erro ao listar eventos:', error);
		await interaction.respond([]).catch(() => {});
	}
};

export const options = {
	cooldown: '10s',
};

export const metadata = {
	userPermissions: ['ManageRoles'],
	botPermissions: ['ManageRoles'],
};
