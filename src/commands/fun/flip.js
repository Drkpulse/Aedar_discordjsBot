const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flips a coin and shows the result'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ fetchReply: true });

        const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
        const emoji = outcome === 'heads' ? '🪙' : '⚫';

        await interaction.editReply(`The coin landed on ${outcome} ${emoji}`);

        // Log command usage
        const dateTime = new Date().toISOString();
        const user = interaction.user.tag;
        const interactionId = interaction.commandName;

        console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
    },
    options: {
        //cooldown: '1h',
        devOnly: true,
        //userPermissions: ['Administrator'],
        //botPermissions: ['BanMembers'],
        //deleted: true,
    },
};
