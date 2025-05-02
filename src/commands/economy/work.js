const { SlashCommandBuilder } = require('@discordjs/builders');
const economyManager = require('../../utils/economyManager');

// Work options with min/max rewards
const workOptions = [
    { job: 'minerador', messages: ['Você extraiu minérios valiosos', 'Você encontrou pedras preciosas em uma caverna', 'Você trabalhou nas minas'] },
    { job: 'lenhador', messages: ['Você cortou várias árvores antigas', 'Você vendeu madeira nobre', 'Você transportou toras para a serraria'] },
    { job: 'pescador', messages: ['Você pescou alguns peixes raros', 'Você vendeu sua pesca no mercado', 'Você capturou criaturas marinhas exóticas'] },
    { job: 'fazendeiro', messages: ['Você colheu uma safra abundante', 'Você vendeu produtos frescos no mercado', 'Você cuidou dos animais da fazenda'] },
    { job: 'caçador', messages: ['Você caçou criaturas selvagens', 'Você vendeu peles de alta qualidade', 'Você rastreou e capturou presas difíceis'] },
    { job: 'alquimista', messages: ['Você criou poções valiosas', 'Você vendeu elixires mágicos', 'Você descobriu uma nova fórmula alquímica'] },
    { job: 'ferreiro', messages: ['Você forjou armas de qualidade', 'Você consertou armaduras para aventureiros', 'Você criou ferramentas especiais'] },
    { job: 'mercador', messages: ['Você negociou mercadorias exóticas', 'Você fez ótimos negócios na feira', 'Você vendeu itens raros por um bom preço'] }
];

const COOLDOWN = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Trabalhe para ganhar moedas'),

    run: async ({ interaction }) => {
        const userId = interaction.user.id;
        const now = new Date();

        try {
            // Get the last work time from database
            const lastWorkTime = await economyManager.getLastWorkTime(userId);

            if (lastWorkTime) {
                const timeRemaining = COOLDOWN - (now - new Date(lastWorkTime));

                if (timeRemaining > 0) {
                    // User is on cooldown
                    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
                    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
                    return await interaction.reply({
                        content: `Você está cansado demais para trabalhar agora. Descanse por mais ${hours}h ${minutes}m.`,
                        ephemeral: true
                    });
                }
            }

            // Choose a random job and message
            const workOption = workOptions[Math.floor(Math.random() * workOptions.length)];
            const message = workOption.messages[Math.floor(Math.random() * workOption.messages.length)];

            // Generate a random amount between 50 and 200
            const amount = Math.floor(Math.random() * 151) + 50;

            // Add the earned amount
            const newBalance = await economyManager.addBalance(userId, amount);

            // Update the last work time in database
            await economyManager.updateWorkTime(userId);

            await interaction.reply(
                `**${message} como ${workOption.job}!**\n` +
                `Você ganhou **${amount}** moedas pelo seu trabalho.\n` +
                `Seu saldo atual: **${newBalance}** moedas.`
            );
        } catch (error) {
            console.error('Erro ao trabalhar:', error);
            await interaction.reply({
                content: 'Ocorreu um erro ao processar seu trabalho. Tente novamente mais tarde.',
                ephemeral: true
            });
        }
    },
};
