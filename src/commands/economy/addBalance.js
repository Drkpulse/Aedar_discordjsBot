const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
    economyManager = await createEconomyManager();
})();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-balance')
        .setDescription('Adiciona dinheiro a um usuário')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Usuário para adicionar dinheiro')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Quantidade a adicionar')
                .setRequired(true)
                .setMinValue(1)
        )
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
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const currency = interaction.options.getString('currency');

        try {
            await economyManager.addBalance(targetUser.id, amount, currency);
            const balances = await economyManager.getBalance(targetUser.id);

            const currencyEmoji = {
                gold: '🥇',
                silver: '🥈',
                bronze: '🥉'
            };

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`💰 Dinheiro Adicionado`)
                .setDescription(`Adicionado **${amount}** ${currencyEmoji[currency]} **${currency}** para ${targetUser}`)
                .addFields(
                    { name: '🥇 Ouro', value: `${balances.gold}`, inline: true },
                    { name: '🥈 Prata', value: `${balances.silver}`, inline: true },
                    { name: '🥉 Bronze', value: `${balances.bronze}`, inline: true }
                )
                .setFooter({ text: 'Sistema de Economia' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Ocorreu um erro ao adicionar dinheiro.');
        }
    },

    options: {
        devOnly: true,
    },
};
