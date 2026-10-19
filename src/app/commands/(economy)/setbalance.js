import { SlashCommandBuilder } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';
import economyManager from '../../../utils/economyManager.js';

export const command = new SlashCommandBuilder()
    .setName('setbalance')
    .setDescription('Define o saldo do usuário especificado para um valor específico')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('O usuário cujo saldo será definido')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('amount')
            .setDescription('O saldo que será definido')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON(); // Admin only command

export const chatInput = async ({ interaction }) => {
    const userId = interaction.options.getUser('user').id; // Get the target user ID
    const amount = interaction.options.getInteger('amount'); // Get the amount to set

    try {
        if (amount < 0) {
            return await interaction.reply({ content: 'O saldo não pode ser negativo.', ephemeral: true });
        }

        await economyManager.setBalance(userId, amount);
        await interaction.reply(`O saldo de <@${userId}> foi definido para **${amount}** moedas.`);
    } catch (error) {
        console.error('Erro ao definir saldo:', error.message);
        await interaction.reply({ content: 'Ocorreu um erro ao definir o saldo. Tente novamente mais tarde.', ephemeral: true });
    }
};
