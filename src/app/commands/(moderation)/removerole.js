import { SlashCommandBuilder, InteractionContextType, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

// Takes a role away from everyone who has it, and can delete it afterwards (after a confirm button).

export const command = new SlashCommandBuilder()
	.setName('removerole')
	.setDescription('Remove uma role de todos os utilizadores')
	.setContexts(InteractionContextType.Guild)
	.addRoleOption((option) =>
		option.setName('role')
			.setDescription('A role a remover')
			.setRequired(true)
	)
	.addBooleanOption((option) =>
		option.setName('delete')
			.setDescription('Apagar a role depois de a remover?')
			.setRequired(false)
	).toJSON();

export const chatInput = async ({ interaction }) => {
	const role = interaction.options.getRole('role');
	const deleteRole = interaction.options.getBoolean('delete') ?? false;

	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	try {
		if (role.id === interaction.guild.id || role.managed) {
			return interaction.editReply('Essa role não pode ser removida (é a @everyone ou é gerida por uma integração).');
		}
		if (!role.editable) {
			return interaction.editReply(`Não consigo remover a role **${role.name}**: está acima da minha role mais alta.`);
		}

		const members = await interaction.guild.members.fetch();
		const withRole = [...members.filter((member) => member.roles.cache.has(role.id)).values()];

		let removed = 0;
		for (const member of withRole) {
			await member.roles.remove(role, `/removerole by ${interaction.user.tag}`);
			removed++;
			if (removed % 10 === 0) {
				await interaction.editReply(`A remover a role **${role.name}**... ${removed}/${withRole.length}`).catch(() => {});
			}
		}

		const summary = withRole.length
			? `✅ Role **${role.name}** removida de **${removed}** utilizadores.`
			: `Ninguém tinha a role **${role.name}**.`;

		if (!deleteRole) return interaction.editReply(summary);

		const confirmRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('removerole_delete').setLabel('Apagar role').setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId('removerole_keep').setLabel('Manter').setStyle(ButtonStyle.Secondary),
		);
		const message = await interaction.editReply({
			content: `${summary}\nTem a certeza que quer apagar a role **${role.name}**?`,
			components: [confirmRow],
		});

		const choice = await message.awaitMessageComponent({
			componentType: ComponentType.Button,
			filter: (button) => button.user.id === interaction.user.id,
			time: 30_000,
		}).catch(() => null);

		if (!choice) {
			return interaction.editReply({ content: `${summary}\nTempo esgotado: a role não foi apagada.`, components: [] });
		}
		if (choice.customId === 'removerole_keep') {
			return choice.update({ content: `${summary}\nA role foi mantida.`, components: [] });
		}

		await role.delete(`/removerole by ${interaction.user.tag}`).catch((error) => {
			if (error.code !== 10011) throw error; // 10011: role already gone
		});
		await choice.update({ content: `${summary}\n🗑️ A role **${role.name}** foi apagada.`, components: [] });
	} catch (error) {
		console.error('Erro no /removerole:', error);
		await interaction.editReply({ content: 'Ocorreu um erro ao remover a role. Verifique as minhas permissões e tente novamente.', components: [] }).catch(() => {});
	}
};

export const options = {
	cooldown: '10s',
};

export const metadata = {
	userPermissions: ['ManageRoles'],
	botPermissions: ['ManageRoles'],
};
