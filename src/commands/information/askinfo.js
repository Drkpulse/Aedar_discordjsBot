const { ApplicationCommandType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('Info')
        .setDescription('Informações sobre os Patins no Porto')
    ,

    run: ({ interaction, client, handler }) => {
        const mentionedUser = interaction.targetMessage.author.toString();
    	interaction.reply(`Hey ${mentionedUser}!`);
    },

    options: {
        devOnly: true,
        userPermissions: [],
        botPermissions: [],
        deleted: false,
    },
};
