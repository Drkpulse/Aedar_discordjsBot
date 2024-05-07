const { ApplicationCommandType } = require("discord.js");

module.exports = {
    data: {
        name: 'Give Info',
        type: ApplicationCommandType.Message,
    },

    run: ({ interaction, client, handler }) => {
        interaction.reply(`${interaction.user.}`);
    },

    options: {
        devOnly: true,
        userPermissions: [],
        botPermissions: [],
        deleted: false,
    },
};
