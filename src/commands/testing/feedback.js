const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, MessageButton, EmbedBuilder, MessageComponentInteraction } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Send feedback to a channel webhook')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Your feedback message')
                .setRequired(true)
        ),

		run: async ({interaction, client, handler}) => {
        // Defer the reply to indicate that the bot is processing
        await interaction.deferReply({ ephemeral: true });

        // Get the feedback message from the interaction options
        const feedbackMessage = interaction.options.getString('message');

        // Create a message action row with a single button to send the feedback
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new MessageButton()
                    .setCustomId('send_feedback')
                    .setLabel('Send Feedback')
                    .setStyle('PRIMARY')
            );

        // Create an embed with the feedback message
        const feedbackEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Feedback Confirmation')
            .setDescription(`Are you sure you want to send the following feedback?\n\n${feedbackMessage}`)
            .setTimestamp();

        // Send the feedback modal
        await interaction.editReply({ embeds: [feedbackEmbed], components: [actionRow] });
    },

    async executeButton(interaction) {
        // Check if the button interaction is from the original sender and the correct button
        if (interaction.user.id !== interaction.message.interaction.user.id || interaction.customId !== 'send_feedback') return;

        try {
            // Send a POST request to the webhook URL with the feedback message
            await axios.post(`${process.env.GUILD_FEEDBACK_CHANNEL_WEBHOOK}`, { content: interaction.message.embeds[0].description });

            // Acknowledge the button interaction
            await interaction.reply({ content: 'Feedback sent successfully!', ephemeral: true });
        } catch (error) {
            console.error('Error sending feedback:', error);

            // Acknowledge the button interaction
            await interaction.reply({ content: 'An error occurred while sending feedback. Please try again later.', ephemeral: true });
        }
    },
	options: {
		//cooldown: '1h',
		devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
};

