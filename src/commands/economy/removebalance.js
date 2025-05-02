const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const economyManager = require('../../utils/economyManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removebalance')
        .setDescription('Remove uma quantia do saldo do usuário especificado')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('O usuário cujo saldo será alterado')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('A quantidade a ser removida')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Admin only command

    run: async ({ interaction }) => {
        const userId = interaction.options.getUser('user').id; // Get the target user ID
        const amount = interaction.options.getInteger('amount'); // Get the amount to remove

        try {
            if (amount <= 0) {
                return await interaction.reply({ content: 'A quantidade deve ser maior que zero.', ephemeral: true });
            }

            try {
                const newBalance = await economyManager.removeBalance(userId, amount);
                await interaction.reply(`Removido **${amount}** moedas do saldo de <@${userId}>. Saldo atual: **${newBalance}** moedas.`);
            } catch (error) {
                if (error.message === 'Insufficient balance') {
                    return await interaction.reply({
                        content: `O usuário não tem saldo suficiente para remover ${amount} moedas.`,
                        ephemeral: true
                    });
                }
                throw error;
            }
        } catch (error) {
            console.error('Erro ao remover saldo:', error.message);
            await interaction.reply({ content: 'Ocorreu um erro ao remover saldo. Tente novamente mais tarde.', ephemeral: true });
        }
    },
};
