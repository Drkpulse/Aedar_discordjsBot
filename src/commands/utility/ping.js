const { EmbedBuilder } = require("discord.js");

module.exports = {
	data: {
		name: 'ping',
		description: 'Pong!',
	},

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ ephemeral: true });

		// Calculate ping
		const reply = await interaction.fetchReply();
		const ping = reply.createdTimestamp - interaction.createdTimestamp;

		// Get uptime
		const uptime = process.uptime();
		const uptimeString = formatUptime(uptime);

		// Get memory usage
		const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
		const memoryUsageString = `${Math.round(memoryUsage * 100) / 100} MB`;

		// Get command response time (placeholder)
		const commandResponseTime = '100ms'; // Placeholder value

		// Get bot owner
		const hardcodedOwnerId = '121746634542415872';
		const botOwner = client.users.cache.get(hardcodedOwnerId);
		const botOwnerMention = botOwner ? `<@${hardcodedOwnerId}>` : 'Unknown';

		// Generate random embed color
		const randomColor = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

		// Create embed
		const embed = new EmbedBuilder()
			.setTitle('Informações Meh')
			.setColor(`#${randomColor}`)
			.setDescription(
				`**Client Latency:** ${ping}ms\n` +
				`**Uptime:** ${uptimeString}\n` +
				`**Memory Usage:** ${memoryUsageString}\n` +
				`**Command Response Time:** ${commandResponseTime}\n` +
				`**Websocket Latency:** Loading...\n` + // Placeholder for WebSocket ping
				`**Bot Owner:** ${botOwnerMention}`
			)
			.setFooter({
				text: `Requested by ${interaction.user.tag}`,
				iconURL: interaction.user.displayAvatarURL()
			});

		// Send initial embed
		const sentMessage = await interaction.editReply({ embeds: [embed] });

		// Calculate WebSocket ping after sending the initial reply
		const websocketPing = client.ws.ping;
		embed.setDescription(
			`**Client Latency:** ${ping}ms\n` +
			`**Uptime:** ${uptimeString}\n` +
			`**Memory Usage:** ${memoryUsageString}\n` +
			`**Command Response Time:** ${commandResponseTime}\n` +
			`**Websocket Latency:** ${websocketPing}ms\n` + // Update WebSocket ping
			`**Bot Owner:** ${botOwnerMention}`
		);

		// Edit the original reply with the updated embed
		await interaction.editReply({ embeds: [embed] }).catch(console.error);

		// Log command usage
		 const date = new Date();
		 const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		 const user = interaction.user.tag;
		 const interactionId = interaction.commandName;

		 console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},

	options: {
		cooldown: '5s',
		//devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
};

// Function to format uptime
function formatUptime(uptime) {
	const days = Math.floor(uptime / 86400) ;
	const hours = Math.floor((uptime % 86400) / 3600);
	const minutes = Math.floor((uptime % 3600) / 60);
	const seconds = Math.floor(uptime % 60);

	let uptimeString = '';
	if (days > 0) uptimeString += `${days}d `;
	if (hours > 0) uptimeString += `${hours}h `;
	if (minutes > 0) uptimeString += `${minutes}m `;
	uptimeString += `${seconds}s`;

	return uptimeString;
}
