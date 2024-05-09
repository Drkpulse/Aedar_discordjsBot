const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'sugestion', //TODO: Change all this to suggestion modal and add predifined channel
        description: 'Pong!',
    },

    run: async ({ interaction }) => {

        const modal = new ModalBuilder({
			customId: `myModal-${interaction.user.id}`,
            title: 'My Modal',
		})


        // Create the text input components
        const favoriteColorInput = new TextInputBuilder({
			customId: 'favoriteColorInput',
            // The label is the prompt the user sees for this input
            label: "What's your favorite color?",
            // Short means only a single line of text
            style: TextInputStyle.Short,
			});

		const hobbiesInput = new TextInputBuilder({
			customId: 'hobbiesInput',
            // The label is the prompt the user sees for this input
            label: "What's some of your favorite hobbies?",
            // Short means only a single line of text
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
		  .awaitModalSubmit({ filter, time: 60_000})
		  .then((modalInteraction) => {
			const favoriteColorValue = modalInteraction.fields.getTextInputValue('favoriteColorInput');
			const hobbiesValue = modalInteraction.fields.getTextInputValue('hobbiesInput');

			modalInteraction.reply(`Your favorite color: ${favoriteColorValue}\nYour hobbies: ${hobbiesValue}`);
		  })
		  .catch((err) => {
			console.log(err);
		  })
    },

    options: {
        //cooldown: '1h',
        devOnly: true,
        //userPermissions: ['Adminstrator'],
        //botPermissions: ['BanMembers'],
        //deleted: true,
    },
};
