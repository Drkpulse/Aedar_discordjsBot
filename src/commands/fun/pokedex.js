const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pokedex')
		.setDescription('Mostra a informação de um Pokémon')
		.addStringOption((option) =>
			option
				.setName('pokemon')
				.setDescription('Nome do Pokémon')
				.setRequired(true)
		),

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ fetchReply: true });

		const pokemon = interaction.options.getString('pokemon');
		const response = await pokedex(pokemon);

		await interaction.editReply(response);
	},
	options: {
		cooldown: '1m',
	},
};

async function pokedex(pokemon) {
	try {
		const response = await axios.get(`https://pokeapi.glitch.me/v1/pokemon/${pokemon.toLowerCase()}`);

		if (response.status !== 200 || !response.data || response.data.length === 0) {
			return "```The given Pokemon is not found```";
		}

		const json = response.data[0];

		// Constructing the response in the desired format
		const previousEvolutions = json.family.evolutionLine.slice(0, -1).join(', ') || 'None';
		const nextEvolutions = json.family.evolutionLine.slice(1).join(', ') || 'None';
		const weaknesses = json.weaknesses.length > 0 ? json.weaknesses.join(', ') : 'None';
		const resistances = json.resistances.length > 0 ? json.resistances.join(', ') : 'None';
		const immunities = json.immunities.length > 0 ? json.immunities.join(', ') : 'None';

		const description = json.description || 'No description available.';

		const embed = new EmbedBuilder()
			.setTitle(`Gen ${json.gen} - ${json.name} #${json.number}`)
			.setColor('#FF0000')
			.setDescription(`
				♢ **Previous Evolutions**: ${previousEvolutions}
				♢ **Next Evolutions**: ${nextEvolutions}
				♢ **Weaknesses**: ${weaknesses}
				♢ **Resistances**: ${resistances}
				♢ **Immunities**: ${immunities}
				♢ **Description**: ${description}
			`);

		return { embeds: [embed] };
	} catch (error) {
		console.error(error);

		// Handling specific known error response
		if (error.response && error.response.data && error.response.data.message === "This command is outdated, please try again in a few minutes") {
			return "```The Pokédex API is currently outdated. Please try again in a few minutes.```";
		}

		return "```An error occurred while fetching Pokemon information. Please try again later.```";
	}
}
