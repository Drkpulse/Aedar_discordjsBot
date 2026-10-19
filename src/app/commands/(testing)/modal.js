import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { DEV_GUILD_IDS } from '../../../helpers/devConfig.js';

export const command = {
	name: 'modal',
	description: 'Pong!',
};

export const chatInput = async ({ interaction }) => {

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

	interaction.awaitModalSubmit({ filter, time: 60_000}).then((modalInteraction) => {
		const favoriteColorValue = modalInteraction.fields.getTextInputValue('favoriteColorInput');
		const hobbiesValue = modalInteraction.fields.getTextInputValue('hobbiesInput');

		modalInteraction.reply(`Your favorite color: ${favoriteColorValue}\nYour hobbies: ${hobbiesValue}`);
	})
	.catch((err) => {
		console.log(err);
	})
};

export const options = {
	devOnly: true,
};

export const metadata = {
	guilds: DEV_GUILD_IDS,
};
