const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'modal',
        description: 'Pong!',
    },

    run: async ({ interaction, client, handler }) => {
        if (interaction.deferred || interaction.replied) return;

        await interaction.deferReply();

        const modal = new ModalBuilder()
            .setCustomId('myModal')
            .setTitle('My Modal');

        // Create the text input components
        const favoriteColorInput = new TextInputBuilder()
            .setCustomId('favoriteColorInput')
            // The label is the prompt the user sees for this input
            .setLabel("What's your favorite color?")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short);

        const hobbiesInput = new TextInputBuilder()
            .setCustomId('hobbiesInput')
            .setLabel("What's some of your favorite hobbies?")
            // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Paragraph);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
        const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow);

        // Show the modal to the user
        await interaction.reply({ content: 'Modal', components: modal });
    },

    options: {
        //cooldown: '1h',
        devOnly: true,
        //userPermissions: ['Adminstrator'],
        //botPermissions: ['BanMembers'],
        //deleted: true,
    },
};
