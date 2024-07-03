const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('exampleembed')
		.setDescription('Displays an example embed with every possible field'),

	run: async ({ interaction, client, handler }) => {
		const exampleEmbed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle('Example Embed')
			.setURL('https://discord.js.org/')
			.setAuthor({
				name: 'Author Name',
				iconURL: 'https://i.imgur.com/wSTFkRM.png',
				url: 'https://discord.js.org'
			})
			.setDescription('This is an example embed showcasing every possible field.')
			.setThumbnail('https://i.imgur.com/wSTFkRM.png')
			.addFields(
				{ name: 'Regular field title', value: 'Some value here' },
				{ name: '\u200B', value: '\u200B' }, // Blank field
				{ name: 'Inline field title', value: 'Some value here', inline: true },
				{ name: 'Inline field title', value: 'Some value here', inline: true },
				{ name: 'Inline field title', value: 'Some value here', inline: true }
			)
			.setImage('https://i.imgur.com/wSTFkRM.png')
			.setTimestamp()
			.setFooter({ text: 'Example Footer', iconURL: 'https://i.imgur.com/wSTFkRM.png' });

		await interaction.reply({ embeds: [exampleEmbed] });
	},
	options: {
		devOnly: true,
	},
};
