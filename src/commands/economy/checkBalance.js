const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
    economyManager = await createEconomyManager();
})();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Verifica seu saldo')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Usuário para verificar o saldo (opcional)')
                .setRequired(false)
        ),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user') || interaction.user;
        const userId = targetUser.id;

        try {
            const balances = await economyManager.getBalance(userId);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`💰 Saldo de ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL())
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
            await interaction.editReply('Ocorreu um erro ao verificar o saldo.');
        }
    },

    options: {
        cooldown: '10s',
    },
};

