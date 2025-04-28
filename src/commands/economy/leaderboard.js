const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
    economyManager = await createEconomyManager();
})();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Mostra os usuários mais ricos')
        .addStringOption(option =>
            option
                .setName('currency')
                .setDescription('Tipo de moeda')
                .setRequired(true)
                .addChoices(
                    { name: 'Ouro', value: 'gold' },
                    { name: 'Prata', value: 'silver' },
                    { name: 'Bronze', value: 'bronze' }
                )
        ),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const currency = interaction.options.getString('currency');

        try {
            const topUsers = await economyManager.getTopUsers(currency, 10);

            if (!topUsers || topUsers.length === 0) {
                return await interaction.editReply('Não há usuários com saldo nesta moeda.');
            }

            const currencyEmoji = {
                gold: '🥇',
                silver: '🥈',
                bronze: '🥉'
            };

            let description = '';
            for (let i = 0; i < topUsers.length; i++) {
                const user = await client.users.fetch(topUsers[i].userId).catch(() => null);
                const username = user ? user.username : 'Usuário desconhecido';
                description += `**${i + 1}.** ${username}: ${topUsers[i].balance} ${currencyEmoji[currency]}\n`;
            }

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`🏆 Top ${topUsers.length} - ${currency.charAt(0).toUpperCase() + currency.slice(1)}`)
                .setDescription(description)
                .setFooter({ text: 'Sistema de Economia' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Ocorreu um erro ao buscar o ranking.');
        }
    },

    options: {
        cooldown: '30s',
    },
};
