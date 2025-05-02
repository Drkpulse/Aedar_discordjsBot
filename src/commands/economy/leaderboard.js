const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const economyManager = require('../../utils/economyManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Mostra os usuários com mais moedas no servidor')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Número de usuários para mostrar (padrão: 10)')
                .setRequired(false)
        ),

    run: async ({ interaction, client }) => {
        try {
            await interaction.deferReply();

            const limit = interaction.options.getInteger('limit') || 10;
            if (limit < 1 || limit > 25) {
                return await interaction.editReply('O limite deve estar entre 1 e 25.');
            }

            const leaderboard = await economyManager.getLeaderboard(limit);

            if (leaderboard.length === 0) {
                return await interaction.editReply('Ninguém possui moedas ainda!');
            }

            const embed = new EmbedBuilder()
                .setTitle('💰 Ranking de Riqueza 💰')
                .setColor('#FFD700')
                .setTimestamp();

            let description = '';
            for (let i = 0; i < leaderboard.length; i++) {
                const user = leaderboard[i];
                try {
                    const discordUser = await client.users.fetch(user.userId);
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
                    description += `${medal} **${discordUser.username}**: ${user.balance || 0} moedas\n`;
                } catch (error) {
                    description += `${i+1}. **Usuário ID ${user.userId}**: ${user.balance || 0} moedas\n`;
                }
            }

            embed.setDescription(description);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao buscar leaderboard:', error);
            await interaction.editReply('Ocorreu um erro ao buscar o ranking. Tente novamente mais tarde.');
        }
    },
};
