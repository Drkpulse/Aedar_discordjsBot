const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Atira uma bitcoin ao ar!'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ fetchReply: true });

        // Construct the custom emoji strings
        const headsEmoji = `<:bit_head:1240722456873009274>`;
        const tailsEmoji = `<:bit_tail:1240722455530700921>`;

        const outcome = Math.random() <= 0.5 ? 'Cara' : 'Croa';
        const emoji = outcome === 'Cara' ? headsEmoji : tailsEmoji;

        await interaction.editReply(`<:coinflip:1243537240815304766> A Bitcoin foi à blockchain e saiu **${outcome} ${emoji}**`);

        // Log command usage
        const date = new Date();
        const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        const user = interaction.user.tag;
        const interactionId = interaction.commandName;

        console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
    },
    options: {
        cooldown: '1m',
        //devOnly: true,
        //userPermissions: ['Administrator'],
        //botPermissions: ['BanMembers'],
        //deleted: true,
    },
};
