
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

		const welcomeMessage = `Welcome to the server, ${guildMember.user.tag}! We're glad you joined us.`;

		welcomeChannel.send({ content: welcomeMessage });
	} catch (error) {
		console.log(`Error in ${__filename}:\n`, error);
	}
};
