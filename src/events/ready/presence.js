const { ActivityType } = require('discord.js');

module.exports = async (client, handler) => {
	// Array of status configurations
	const statuses = [
		{
			name: 'Aprender Slalom 🛼',
			type: ActivityType.Playing,
		},
		{
			name: 'Reels do Patins no Porto 🕵️‍♂️',
			type: ActivityType.Watching,
		},
		{
			name: 'Como aprender a patinar em 3H',
			type: ActivityType.Streaming,
			url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
		},
		{
			name: 'A ouvir musica da Teresa',
			type: ActivityType.Listening,
		},
		{
			name: 'A fazer umas manobras fixes 🛼',
			type: ActivityType.Custom,
		},
		{
			name: 'A limpar os rolamentos 🧼',
			type: ActivityType.Playing,
		},
		{
			name: 'A patinar no Porto 🛼',
			type: ActivityType.Playing,
		},
		{
			name: 'A espera da Ride de Sabado',
			type: ActivityType.Custom,
		},
		{
			name: 'Pelos prémios do Ano Patins no Porto 🎁',
			type: ActivityType.Competing,
		},
		{
			name: 'Treino de Slalom com amigos 🛼',
			type: ActivityType.Playing,
		},
		{
			name: 'Assistindo a competições de patinagem 🎥',
			type: ActivityType.Watching,
		},
		{
			name: 'Criando uma playlist para patinar 🎶',
			type: ActivityType.Listening,
		},
		{
			name: 'Desafiando amigos para manobras 🛼',
			type: ActivityType.Custom,
		},
		{
			name: 'Ajustando os patins para melhor desempenho 🔧',
			type: ActivityType.Playing,
		},
		{
			name: 'Explorando novas pistas de patinagem 🌍',
			type: ActivityType.Playing,
		},
		{
			name: 'Preparando-se para a competição de patins 🏆',
			type: ActivityType.Custom,
		},
		{
			name: 'Participando de eventos de patinagem 🎉',
			type: ActivityType.Competing,
		},
	];

	const setBotPresence = () => {
		try {
			const random = Math.floor(Math.random() * statuses.length);
			const status = statuses[random];
			//console.log('Setting bot presence:', status);
			client.user.setPresence({
				activities: [{
					name: status.name,
					type: status.type,
					url: status.url || null,
				}],
				status: 'online',
			});
			//console.log('Bot presence set to:', status.name);
		} catch (error) {
			console.error('Error in setBotPresence function:', error);
		}
	};

	setBotPresence(); // Set initial bot presence

	// Set bot presence every 60 seconds
	setInterval(() => {
		setBotPresence();
	}, 60000);
};
