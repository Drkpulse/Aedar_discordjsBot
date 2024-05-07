const { ButtonKit } = require('commandkit');
const { ButtonStyle, ActionRowBuilder } = require('discord.js');

// Create a button
const button = new ButtonKit()
    .setEmoji('👍')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('button'); // Required to use onClick

const buttonRow = new ActionRowBuilder().addComponents(button);

const message = await channel.send({ components: [buttonRow] });

// Listen to the button interaction right away
button.onClick(
    (interaction) => {
        // Reply to the interaction
        interaction.reply('You clicked the button!');
    },
    { message },
);
