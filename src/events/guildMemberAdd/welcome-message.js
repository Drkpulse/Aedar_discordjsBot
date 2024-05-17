
/**
 * @param {import {'discord.js'}.GuildMember} guildMember
 */

module.exports = async (guildMember) => {
	console.log("Joined");
	try {
		if (guildMember.user.bot) return;

		const welcomeChannelId = '1237868787991056404';
		const welcomeChannel = guildMember.guild.channels.cache.get(welcomeChannelId);
		if (!welcomeChannel) return;

		const welcomeMessage = `Bem-vindo(a) ${guildMember.user.tag} \n
		Acabaste de entrar no melhor grupo de patins de sempre \n
		Para teres uma ideia de como organizamos aqui o nosso discord vê o <#1220459599384018992>`;

		welcomeChannel.send({ content: welcomeMessage });
	} catch (error) {
		console.log(`Error in ${__filename}:\n`, error);
	}
};
