const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removerole')
		.setDescription('Remove uma Role de todos os utilizadores')
		.addRoleOption((option) =>
			option
				.setName('role')
				.setDescription('A Role que é para remover')
				.setRequired(true)
		)
		.addBooleanOption((option) =>
			option
				.setName('delete')
				.setDescription('Deletar a Role após a remoção?')
				.setRequired(false)
		),

	run: async ({ interaction, client }) => {
		await interaction.deferReply({ fetchReply: true });

		const role = interaction.options.getRole('role');
		const deleteRole = interaction.options.getBoolean('delete') || false;

		// Check if the interaction is in a guild
		if (!interaction.guild) {
			return interaction.editReply('Este comando só funciona num servidor.');
		}

		// Check if the role is manageable
		if (!role.editable) {
			return interaction.editReply('Não consigo remover essa Role. Deve ser uma Role com permissões superiores as minhas.');
		}

		const members = await interaction.guild.members.fetch();
		const membersWithRole = members.filter(member => member.roles.cache.has(role.id));

		const totalMembers = membersWithRole.size;
		let removedCount = 0;

		// If there are no members with the role and delete is true, delete the role immediately
		if (deleteRole && totalMembers === 0) {
			try {
				await role.delete();
				return await interaction.editReply(`A Role **${role.name}** foi deletada com sucesso, pois não havia utilizadores com essa Role.`);
			} catch (error) {
				if (error.code === 10011) {
					return await interaction.editReply(`A Role **${role.name}** não pôde ser deletada porque não existe.`);
				} else {
					console.error('Erro ao deletar a role:', error);
					return await interaction.editReply('Ocorreu um erro ao tentar deletar a Role.');
				}
			}
		}

		if (totalMembers === 0) {
			return await interaction.editReply('Não existem clientes com essa Role.');
		}

		const updateReply = async () => {
			await interaction.editReply(`A remover a role **${role.name}**... ${removedCount}/${totalMembers} utilizadores mudados.`);
		};

		const removeRole = async (member) => {
			await member.roles.remove(role);
			removedCount++;
			await updateReply(); // Update the reply after each removal
		};

		const membersArray = Array.from(membersWithRole.values()); // Convert Collection to Array

		const interval = setInterval(async () => {
			const membersToProcess = membersArray.splice(0, 30); // Get the next 30 members
			if (membersToProcess.length === 0) {
				clearInterval(interval);
				await interaction.editReply(`A Role **${role.name}** foi removido com sucesso de ${removedCount} utilizadores.`);
				if (deleteRole) {
					// Ask for confirmation before deleting the role
					await interaction.followUp(`Você tem certeza que deseja deletar a Role **${role.name}**? Digite o nome da Role para confirmar.`);

					const filter = response => response.author.id === interaction.user.id && response.content === role.name;
					const confirmation = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] }).catch(() => null);

					if (confirmation) {
						try {
							await role.delete();
							await interaction.followUp(`A Role **${role.name}** foi deletada com sucesso.`);
						} catch (error) {
							if (error.code === 10011) {
								await interaction.followUp(`A Role **${role.name}** não pôde ser deletada porque não existe.`);
							} else {
								console.error('Erro ao deletar a role:', error);
								await interaction.followUp('Ocorreu um erro ao tentar deletar a Role.');
							}
						}
					} else {
						await interaction.followUp('A deleção da Role foi cancelada, pois o nome não corresponde ou o tempo expirou.');
					}
				}
			} else {
				membersToProcess.forEach(member => removeRole(member));
			}
		}, 1000); // 1000 ms = 1 second
	},
	options: {
		cooldown: '1s',
	},
};
