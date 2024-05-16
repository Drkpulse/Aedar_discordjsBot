const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokedex')
        .setDescription('Shows Pokemon information')
        .addStringOption((option) =>
            option
                .setName('pokemon')
                .setDescription('Pokemon name to get information for')
                .setRequired(true)
        ),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ fetchReply: true });

        const pokemon = interaction.options.getString('pokemon');
        const response = await pokedex(pokemon);

        await interaction.editReply(response);

        // Log command usage
		 const date = new Date();
		 const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		 const user = interaction.user.tag;
		 const interactionId = interaction.commandName;

		 console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
    },
    options: {
        cooldown: '1m',
        devOnly: true,
        //userPermissions: ['Administrator'],
        //botPermissions: ['BanMembers'],
        //deleted: true,
    },
};

async function pokedex(pokemon) {
    try {
        const response = await axios.get(`https://pokeapi.glitch.me/v1/pokemon/${pokemon.toLowerCase()}`);

        if (response.status !== 200 || !response.data || response.data.length === 0) {
            return "```The given Pokemon is not found```";
        }

        const json = response.data[0];

        const embed = new EmbedBuilder()
            .setTitle(`Pokédex - ${json.name}`)
            .setColor('#FF0000')
            .setThumbnail(json.sprite)
            .setDescription(
                `
                ♢ **ID**: ${json.number}
                ♢ **Name**: ${json.name}
                ♢ **Species**: ${json.species}
                ♢ **Type(s)**: ${json.types.join(', ')}
                ♢ **Abilities (normal)**: ${json.abilities.normal.join(', ')}
                ♢ **Abilities (hidden)**: ${json.abilities.hidden.join(', ')}
                ♢ **Egg group(s)**: ${json.eggGroups.join(', ')}
                ♢ **Gender**: ${json.gender}
                ♢ **Height**: ${json.height} feet
                ♢ **Weight**: ${json.weight} lbs
                ♢ **Current Evolution Stage**: ${json.family.evolutionStage}
                ♢ **Evolution Line**: ${json.family.evolutionLine.join(' -> ')}
                ♢ **Is Starter?**: ${json.starter ? 'Yes' : 'No'}
                ♢ **Is Legendary?**: ${json.legendary ? 'Yes' : 'No'}
                ♢ **Is Mythical?**: ${json.mythical ? 'Yes' : 'No'}
                ♢ **Generation**: ${json.gen}
                `
            )
            .setFooter({ text: json.description });

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
