const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'botfeedback', //TODO: Change all this to feedback modal and change reply method and add Embed to response
        description: 'Send feedback about the bot',
    },

    run: async ({ interaction, client }) => {
        // Fetch the channel where you want to send the result
        const feedbackChannelId = '1237868787991056404'; // Replace with your channel ID
        const feedbackChannel = await client.channels.fetch(feedbackChannelId);

        if (!feedbackChannel) {
            return interaction.reply('Error: Feedback channel not found.');
        }

        const modal = new ModalBuilder({
            customId: `myModal-${interaction.user.id}`,
            title: 'Feedback Modal',
        });

        // Create the text input components
        const favoriteColorInput = new TextInputBuilder({
            customId: 'favoriteColorInput',
            label: "What's your favorite color?",
            style: TextInputStyle.Short,
        });

        const hobbiesInput = new TextInputBuilder({
            customId: 'hobbiesInput',
            label: "What are some of your favorite hobbies?",
            style: TextInputStyle.Paragraph,
        });

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
        const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);

        const filter = (interaction) => interaction.customId === `myModal-${interaction.user.id}`;

        interaction
            .awaitModalSubmit({ filter, time: 60000 })
            .then((modalInteraction) => {
                const favoriteColorValue = modalInteraction.fields.getTextInputValue('favoriteColorInput');
                const hobbiesValue = modalInteraction.fields.getTextInputValue('hobbiesInput');

                // Send the result to the feedback channel
                feedbackChannel.send(`Feedback from ${interaction.user}: Favorite color: ${favoriteColorValue}, Hobbies: ${hobbiesValue}`);
            })
            .catch((err) => {
                console.error('Error:', err);
                interaction.reply('An error occurred while processing your feedback.');
            });
    },

    options: {
        devOnly: true,
    },
};
