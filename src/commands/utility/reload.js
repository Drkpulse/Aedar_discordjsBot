const { SlashCommandBuilder } = require('discord.js');
const { ReloadType } = require('commandkit');
const cooldowns = require('../../validations/cooldowns');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads all Commands')
    ,

	run: async ({interaction, client, handler}) => {
	  await interaction.deferReply();

	  await handler.reloadCommands();

	  interaction.followUp('All Reloaded!');
	},
	options: {
		//cooldown: '1h',
		devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
  };
