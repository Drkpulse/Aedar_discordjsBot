/**
 * @param {import('discord.js').GuildMember} guildMember
 */

module.exports = async (guildMember) => {
    console.log("Joined");
    try {
        if (guildMember.user.bot) return;

        const welcomeChannelId = process.env.WELCOME_CHANNELID;
        const welcomeChannel = guildMember.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) return;

        // Array of welcome messages
        const welcomeMessages = [
            `Bem-vindo(a) ${guildMember.toString()} 🥳🥳🥳 \nAcabaste de entrar no melhor grupo de patins de sempre 🔥\nPara teres uma ideia de como organizamos aqui o nosso discord vê o <#1220459599384018992>`,
            `Olá ${guildMember.toString()}! 👋 Esperamos que te divirtas muito no nosso servidor de patins! 🛼 <#1220459599384018992>`,
            `E aí ${guildMember.toString()}! 👋 Bem-vindo(a) ao nosso grupo! 😊 Vamos patinar juntos!  🌟 <#1220459599384018992>`
            // Add more welcome messages as needed
        ];

        // Select a random welcome message from the array
        const randomWelcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        // Send the selected welcome message to the welcome channel
        welcomeChannel.send({ content: randomWelcomeMessage });
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};
