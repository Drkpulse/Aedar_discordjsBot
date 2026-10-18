import { SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import economyManager from '../../../utils/economyManager.js';

export const command = new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Aposte suas moedas para ter a chance de ganhar mais')
    .addIntegerOption(option =>
        option.setName('amount')
            .setDescription('Quantidade de moedas para apostar')
            .setRequired(true)
    ).toJSON();

export const chatInput = async ({ interaction }) => {
    const userId = interaction.user.id;
    const amount = interaction.options.getInteger('amount');

    try {
        if (amount <= 0) {
            return await interaction.reply({
                content: 'Você precisa apostar pelo menos 1 moeda.',
                ephemeral: true
            });
        }

        // Get current balance
        const balance = await economyManager.getBalance(userId);

        if (balance < amount) {
            return await interaction.reply({
                content: `Você não tem moedas suficientes. Seu saldo atual é de ${balance} moedas.`,
                ephemeral: true
            });
        }

        // Generate a random number between 0 and 100
        const roll = Math.floor(Math.random() * 101);

        const embed = new EmbedBuilder()
            .setTitle('🎲 Aposta 🎲')
            .setColor('#ff9900')
            .setDescription(`Você apostou **${amount}** moedas.`)
            .addFields({ name: 'Seu número', value: `${roll}`, inline: true })
            .setTimestamp();

        // Determine win or loss
        if (roll <= 40) {
            // Loss - 40% chance
            await economyManager.removeBalance(userId, amount);
            const newBalance = await economyManager.getBalance(userId);

            embed.addFields({ name: 'Resultado', value: '❌ Você perdeu!', inline: true })
                .addFields({ name: 'Novo Saldo', value: `${newBalance} moedas`, inline: true })
                .setColor('#ff0000');

            await interaction.reply({ embeds: [embed] });
        } else if (roll > 40 && roll <= 85) {
            // Small win (1.5x) - 45% chance
            const winnings = Math.floor(amount * 1.5);
            await economyManager.addBalance(userId, winnings - amount); // Add winnings, subtract initial bet
            const newBalance = await economyManager.getBalance(userId);

            embed.addFields({ name: 'Resultado', value: `✅ Você ganhou **${winnings}** moedas!`, inline: true })
                .addFields({ name: 'Lucro', value: `${winnings - amount} moedas`, inline: true })
                .addFields({ name: 'Novo Saldo', value: `${newBalance} moedas`, inline: true })
                .setColor('#00ff00');

            await interaction.reply({ embeds: [embed] });
        } else {
            // Big win (2x) - 15% chance
            const winnings = amount * 2;
            await economyManager.addBalance(userId, winnings - amount); // Add winnings, subtract initial bet
            const newBalance = await economyManager.getBalance(userId);

            embed.addFields({ name: 'Resultado', value: `🎉 GRANDE VITÓRIA! Você ganhou **${winnings}** moedas!`, inline: true })
                .addFields({ name: 'Lucro', value: `${winnings - amount} moedas`, inline: true })
                .addFields({ name: 'Novo Saldo', value: `${newBalance} moedas`, inline: true })
                .setColor('#00ff00');

            await interaction.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erro ao apostar:', error.message);
        await interaction.reply({
            content: 'Ocorreu um erro ao processar sua aposta. Tente novamente mais tarde.',
            ephemeral: true
        });
    }
};
