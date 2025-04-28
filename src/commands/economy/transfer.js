const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
    economyManager = await createEconomyManager();
})();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfere dinheiro para outro usuário')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Usuário para receber o dinheiro')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Quantidade a transferir')
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
        ),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const sender = interaction.user;
        const recipient = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const currency = interaction.options.getString('currency');

        // Prevent transferring to self
        if (sender.id === recipient.id) {
            return await interaction.editReply('Você não pode transferir dinheiro para si mesmo.');
        }

        try {
            // First remove from sender
            await economyManager.removeBalance(sender.id, amount, currency);

            // Then add to recipient
            await economyManager.addBalance(recipient.id, amount, currency);

            const currencyEmoji = {
                gold: '🥇',
                silver: '🥈',
                bronze: '🥉'
            };

            const embed = new EmbedBuilder()
                .setColor('#4287f5')
                .setTitle(`💸 Transferência Realizada`)
                .setDescription(`${sender} transferiu **${amount}** ${currencyEmoji[currency]} **${currency}** para ${recipient}`)
                .setFooter({ text: 'Sistema de Economia' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            if (error.message === "Insufficient balance or user not found.") {
                await interaction.editReply('Você não tem saldo suficiente para essa transferência.');
            } else {
                await interaction.editReply('Ocorreu um erro ao fazer a transferência.');
            }
        }
    },

    options: {
        cooldown: '30s',
    },
};
