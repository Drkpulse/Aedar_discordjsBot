const { SlashCommandBuilder } = require('discord.js');
const cooldowns = require('../../validations/cooldowns');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong?')
    ,

	run: async ({interaction, client, handler}) => {
	  await interaction.deferReply();

	  const reply = await interaction.fetchReply();

	  const ping = reply.createdTimestamp - interaction.createdTimestamp;

	  interaction.editReply(
		`Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`
	  );
	},
	options: {
		cooldown: '1h',
		devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
  };
