const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
    economyManager = await createEconomyManager();
})();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Trabalhe para ganhar dinheiro'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const userId = interaction.user.id;

        try {
            // List of possible jobs and their pay
            const jobs = [
                { name: 'Lixeiro', pay: { bronze: 20, silver: 5, gold: 0 }, message: 'Você coletou o lixo da cidade.' },
                { name: 'Entregador', pay: { bronze: 15, silver: 10, gold: 0 }, message: 'Você fez entregas de pacotes.' },
                { name: 'Garçom', pay: { bronze: 10, silver: 15, gold: 0 }, message: 'Você atendeu os clientes em um restaurante.' },
                { name: 'Professor', pay: { bronze: 5, silver: 20, gold: 1 }, message: 'Você deu aulas para os alunos.' },
                { name: 'Programador', pay: { bronze: 0, silver: 25, gold: 2 }, message: 'Você desenvolveu um software.' },
                { name: 'Médico', pay: { bronze: 0, silver: 20, gold: 3 }, message: 'Você tratou vários pacientes.' },
                { name: 'Advogado', pay: { bronze: 0, silver: 15, gold: 4 }, message: 'Você ganhou um caso no tribunal.' },
                { name: 'CEO', pay: { bronze: 0, silver: 10, gold: 5 }, message: 'Você liderou uma grande empresa hoje.' }
            ];

            // Randomly choose a job
            const job = jobs[Math.floor(Math.random() * jobs.length)];

            // Add the earnings to the user's balance
            if (job.pay.bronze > 0) await economyManager.addBalance(userId, job.pay.bronze, 'bronze');
            if (job.pay.silver > 0) await economyManager.addBalance(userId, job.pay.silver, 'silver');
            if (job.pay.gold > 0) await economyManager.addBalance(userId, job.pay.gold, 'gold');

            // Get updated balance
            const balances = await economyManager.getBalance(userId);

            // Create paycheck description
            let paycheckDesc = `${job.message}\n\nVocê recebeu:\n`;
            if (job.pay.gold > 0) paycheckDesc += `**${job.pay.gold}** 🥇 Ouro\n`;
            if (job.pay.silver > 0) paycheckDesc += `**${job.pay.silver}** 🥈 Prata\n`;
            if (job.pay.bronze > 0) paycheckDesc += `**${job.pay.bronze}** 🥉 Bronze\n`;

            const embed = new EmbedBuilder()
                .setColor('#4169E1')
                .setTitle(`💼 Trabalho: ${job.name}`)
                .setDescription(paycheckDesc)
                .addFields(
                    { name: '🥇 Ouro', value: `${balances.gold}`, inline: true },
                    { name: '🥈 Prata', value: `${balances.silver}`, inline: true },
                    { name: '🥉 Bronze', value: `${balances.bronze}`, inline: true }
                )
                .setFooter({ text: 'Você pode trabalhar novamente em 1 hora' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Ocorreu um erro ao trabalhar.');
        }
    },

    options: {
        cooldown: '1h',
    },
};
