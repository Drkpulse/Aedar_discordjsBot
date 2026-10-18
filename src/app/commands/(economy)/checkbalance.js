import { SlashCommandBuilder } from 'discord.js';
import economyManager from '../../../utils/economyManager.js';

export const command = new SlashCommandBuilder()
    .setName('checkbalance')
    .setDescription('Verifica o saldo atual do usuário').toJSON();

export const chatInput = async ({ interaction }) => {
    const userId = interaction.user.id; // Get the user ID from the interaction

    try {
        const balance = await economyManager.getBalance(userId); // Call the getBalance method
        await interaction.reply(`Seu saldo atual em ouro é: **${balance}** moedas.`);
    } catch (error) {
        console.error('Erro ao verificar saldo:', error.message);
        await interaction.reply({ content: 'Ocorreu um erro ao verificar seu saldo. Tente novamente mais tarde.', ephemeral: true });
    }
};
