import { ApplicationCommandType } from 'discord.js';

export const command = {
	name: 'Give Info',
	type: ApplicationCommandType.Message,
};

export const messageContextMenu = ({ interaction, client }) => {
	const mentionedUser = interaction.targetMessage.author.toString();
	interaction.reply(`Olá ${mentionedUser} gostava que atualizasses as tuas roles <id:customize> \n Obrigado :blush: `);
};

export const metadata = {
	userPermissions: ['Administrator'],
};
