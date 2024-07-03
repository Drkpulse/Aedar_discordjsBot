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
			`Bem-vinde ${guildMember.toString()} 🥳🥳🥳 \nAcabaste de entrar no melhor grupo de patins de sempre 🔥\nPara teres uma ideia de como organizamos aqui o nosso discord vê o <#1220459599384018992>`,
			`Saudações, ${guildMember.toString()} , e seja bem-vinde ao melhor grupo de patins do universo! \nVê o canal <#1220459599384018992> para saber como estamos organizados, pega teus patins e bora patinar!`,
			`Ora ${guildMember.toString()} decidiste te juntar ao melhor grupo de rodas da zona e arredores!\nPois, Bem Vindo/a, para aprenderes um pouco da tematica da uma olhada no <#1220459599384018992> e diverte te ao maximo!`
			`Se Bem-vinde ${guildMember.toString()} ao melhor, mais incrivel, unico, magnifico, espetacular grupo Patins no Porto!\nPara perceberes como esta organizado o nosso servidor de Discord vê o <#1220459599384018992>.\nVem patinar e Diverte-te`
			`Hello, ${guildMember.toString()}\nSeja bem-vinde ao melhor grupo de patinagem de sempre 🙌🏼🤩\nSugiro que comeces dando uma olhadinha no <#1220459599384018992> para conheceres melhor como que a comunidade funciona 🥳\nAguardamos por ti no próximo encontro. Se precisares de ajuda, esteja sempre à vontade para questionar aos membros, somos todos muito prestativos 🥰⛸️`
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
