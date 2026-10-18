export const command = {
	name: 'invite',
	description: 'Como dar invite a alguém',
};

export const chatInput = async ({ interaction, client }) => {
interaction.reply(`Para receber um invite é necessário comparecer num dos nossos eventos principais`);

};

export const options = {
	cooldown: '1m',
};
