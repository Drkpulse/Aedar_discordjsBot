const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
    economyManager = await createEconomyManager();
})();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Tente roubar dinheiro de outro usuário')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Usuário para roubar')
                .setRequired(true)
        ),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const robber = interaction.user;
        const victim = interaction.options.getUser('user');

        // Prevent robbing self
        if (robber.id === victim.id) {
            return await interaction.editReply('❌ Você não pode roubar a si mesmo.');
        }

        try {
            // Get victim balance
            const victimBalance = await economyManager.getBalance(victim.id);

            // Check if victim has any money
            const totalVictimBalance = victimBalance.gold * 100 + victimBalance.silver * 10 + victimBalance.bronze;

            if (totalVictimBalance <= 0) {
                return await interaction.editReply(`❌ ${victim.username} não tem nada para roubar.`);
            }

            // Rob success chance (40%)
            const successChance = 0.4;
            const success = Math.random() < successChance;

            if (success) {
                // Decide which currency to steal from
                let currencyToSteal = 'bronze';
                let amountToSteal = 0;

                if (victimBalance.gold > 0) {
                    currencyToSteal = 'gold';
                    // Steal between 1 and half of their gold, maximum 3
                    amountToSteal = Math.min(3, Math.max(1, Math.floor(victimBalance.gold * Math.random() * 0.5)));
                } else if (victimBalance.silver > 0) {
                    currencyToSteal = 'silver';
                    // Steal between 1 and half of their silver, maximum 10
                    amountToSteal = Math.min(10, Math.max(1, Math.floor(victimBalance.silver * Math.random() * 0.5)));
                } else {
                    // Steal between 1 and half of their bronze, maximum 25
                    amountToSteal = Math.min(25, Math.max(1, Math.floor(victimBalance.bronze * Math.random() * 0.5)));
                }

                // Remove from victim
                await economyManager.removeBalance(victim.id, amountToSteal, currencyToSteal);

                // Add to robber
                await economyManager.addBalance(robber.id, amountToSteal, currencyToSteal);

                const currencyEmoji = {
                    gold: '🥇',
                    silver: '🥈',
                    bronze: '🥉'
                }[currencyToSteal];

                const embed = new EmbedBuilder()
                    .setColor('#000000')
                    .setTitle(`🦹 Roubo Bem-Sucedido!`)
                    .setDescription(`${robber} roubou **${amountToSteal}** ${currencyEmoji} **${currencyToSteal}** de ${victim}!`)
                    .setFooter({ text: 'Cuidado! Roubar é crime!' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } else {
                // Failed robbery - robber loses some money as punishment
                const penalty = Math.floor(Math.random() * 20) + 5; // 5-24 bronze

                // Get robber balance
                const robberBalance = await economyManager.getBalance(robber.id);

                // Check if robber has enough bronze
                if (robberBalance.bronze >= penalty) {
                    await economyManager.removeBalance(robber.id, penalty, 'bronze');
                } else if (robberBalance.silver > 0) {
                    await economyManager.removeBalance(robber.id, 1, 'silver');
                } else if (robberBalance.gold > 0) {
                    await economyManager.removeBalance(robber.id, 1, 'gold');
                }

                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle(`👮 Roubo Falhou!`)
                    .setDescription(`${robber} foi pego tentando roubar ${victim} e pagou uma multa!`)
                    .setFooter({ text: 'A polícia está de olho em você!' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Ocorreu um erro ao tentar roubar.');
        }
    },

    options: {
        cooldown: '10m', // Longer cooldown to prevent abuse
    },
};
