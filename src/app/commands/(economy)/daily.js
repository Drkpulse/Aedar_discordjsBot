import { SlashCommandBuilder } from 'discord.js';
import economyManager from '../../../utils/economyManager.js';

const DAILY_AMOUNT = 100; // Daily reward amount
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const command = new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Recebe uma recompensa diária de moedas').toJSON();

export const chatInput = async ({ interaction }) => {
    const userId = interaction.user.id;
    const now = new Date();

    try {
        // Get the last claim time from database
        const lastClaimTime = await economyManager.getLastDailyClaimTime(userId);

        if (lastClaimTime) {
            const timeRemaining = COOLDOWN - (now - new Date(lastClaimTime));

            if (timeRemaining > 0) {
                // User is on cooldown
                const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
                const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
                return await interaction.reply({
                    content: `Você já recebeu sua recompensa diária. Aguarde mais ${hours}h ${minutes}m.`,
                    ephemeral: true
                });
            }
        }

        // Add the daily reward amount
        const newBalance = await economyManager.addBalance(userId, DAILY_AMOUNT);

        // Update the last claim time
        await economyManager.updateDailyClaimTime(userId);

        await interaction.reply(
            `🎉 **Recompensa diária recebida!** 🎉\n` +
            `Você ganhou **${DAILY_AMOUNT}** moedas.\n` +
            `Seu saldo atual: **${newBalance}** moedas.`
        );
    } catch (error) {
        console.error('Erro ao dar recompensa diária:', error);
        await interaction.reply({
            content: 'Ocorreu um erro ao receber sua recompensa diária. Tente novamente mais tarde.',
            ephemeral: true
        });
    }
};
