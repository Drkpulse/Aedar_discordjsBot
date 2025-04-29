const cooldowns = require('../../validations/cooldowns');


module.exports = {
	data:{
		name: 'info',
		description: 'Informações sobre os Patins no Porto',
	},

	run: async ({interaction, client, handler}) => {
	interaction.reply(`Os Patins no Porto são um grupo de pessoas que se juntam para patinar na cidade do Porto.\nRedes Socias em que estamos presentes:\nInstagram: https://www.instagram.com/patinsnoporto/`);
	},
	options: {
		cooldown: '10s',
	},
  };
