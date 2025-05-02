const { ActivityType } = require('discord.js');

module.exports = async (client, handler) => {
	// Array of status configurations
	const statuses = [
		{
			name: 'Codificando um novo projeto 💻',
			type: ActivityType.Playing,
		},
		{
			name: 'Assistindo a streams de programação 🎥',
			type: ActivityType.Watching,
		},
		{
			name: 'Aprendendo novas linguagens de programação 📚',
			type: ActivityType.Streaming,
			url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
		},
		{
			name: 'Jogando meu jogo favorito 🎮',
			type: ActivityType.Playing,
		},
		{
			name: 'Debugando um código complicado 🐞',
			type: ActivityType.Custom,
		},
		{
			name: 'Participando de um hackathon 🚀',
			type: ActivityType.Playing,
		},
		{
			name: 'Desenvolvendo um novo jogo 🕹️',
			type: ActivityType.Playing,
		},
		{
			name: 'Aguardando a próxima atualização do jogo ⏳',
			type: ActivityType.Custom,
		},
		{
			name: 'Competindo em um torneio de eSports 🏆',
			type: ActivityType.Competing,
		},
		{
			name: 'Treinando habilidades de programação 🧠',
			type: ActivityType.Playing,
		},
		{
			name: 'Assistindo a competições de jogos 🎮',
			type: ActivityType.Watching,
		},
		{
			name: 'Criando um novo mod para um jogo 🎨',
			type: ActivityType.Listening,
		},
		{
			name: 'Desafiando amigos em um jogo online 🕹️',
			type: ActivityType.Custom,
		},
		{
			name: 'Ajustando configurações do meu setup 🔧',
			type: ActivityType.Playing,
		},
		{
			name: 'Explorando novos jogos indie 🌍',
			type: ActivityType.Playing,
		},
		{
			name: 'Preparando-se para a próxima maratona de jogos 🎉',
			type: ActivityType.Custom,
		},
		{
			name: 'Participando de eventos de programação 💻',
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
