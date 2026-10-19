import { SlashCommandBuilder } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';
import economyManager from '../../../utils/economyManager.js';

export const command = new SlashCommandBuilder()
    .setName('addbalance')
    .setDescription('Adiciona saldo ao usuário especificado')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('O usuário ao qual adicionar saldo')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('amount')
            .setDescription('A quantidade a ser adicionada')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON(); // Admin only command

export const chatInput = async ({ interaction }) => {
    const userId = interaction.options.getUser('user').id; // Get the target user ID
    const amount = interaction.options.getInteger('amount'); // Get the amount to add

    try {
        if (amount <= 0) {
            return await interaction.reply({ content: 'A quantidade deve ser maior que zero.', ephemeral: true });
        }

        const newBalance = await economyManager.addBalance(userId, amount);
        await interaction.reply(`Adicionado **${amount}** moedas ao saldo de <@${userId}>. Saldo atual: **${newBalance}** moedas.`);
    } catch (error) {
        console.error('Erro ao adicionar saldo:', error.message);
        await interaction.reply({ content: 'Ocorreu um erro ao adicionar saldo. Tente novamente mais tarde.', ephemeral: true });
    }
};
