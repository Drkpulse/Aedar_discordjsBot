const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const os = require('os');

module.exports = {
	data: {
		name: 'pong',
		description: 'Displays detailed bot statistics and performance metrics',
	},

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ ephemeral: true });

		// Calculate initial ping
		const startTime = Date.now();
		const reply = await interaction.fetchReply();
		const ping = reply.createdTimestamp - interaction.createdTimestamp;

		// Get uptime
		const uptime = process.uptime();
		const uptimeString = formatUptime(uptime);

		// Get bot start time
		const botStartTime = new Date(Date.now() - (uptime * 1000)).toLocaleString();

		// Get memory usage
		const memoryUsage = process.memoryUsage();
		const usedHeapSize = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
		const totalHeapSize = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
		const memoryUsagePercent = ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1);

		// Get system info
		const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
		const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
		const usedMem = (totalMem - freeMem).toFixed(2);
		const cpuCount = os.cpus().length;
		const systemUptime = formatUptime(os.uptime());
		const platform = `${os.type()} ${os.release()} (${os.platform()})`;

		// Get command count
		const commandCount = handler?.commands?.size || 'Unknown';

		// Get server and user count
		const serverCount = client.guilds.cache.size;
		const userCount = client.users.cache.size;

		// Calculate websocket ping
		const websocketPing = client.ws.ping;

		// Get bot owner
		const ownerId = process.env.OWNER_ID || '121746634542415872';
		const botOwner = await client.users.fetch(ownerId).catch(() => null);
		const botOwnerTag = botOwner ? botOwner.tag : 'Unknown';

		// Generate embed color based on ping performance
		let statusColor;
		let statusText;
		if (ping < 100) {
			statusColor = '#00FF00'; // Green
			statusText = '🟢 Excellent';
		} else if (ping < 200) {
			statusColor = '#FFFF00'; // Yellow
			statusText = '🟡 Good';
		} else if (ping < 500) {
			statusColor = '#FFA500'; // Orange
			statusText = '🟠 Moderate';
		} else {
			statusColor = '#FF0000'; // Red
			statusText = '🔴 Poor';
		}

		// Calculate database ping (simulated for this example)
		const dbPingStart = Date.now();
		await new Promise(resolve => setTimeout(resolve, 10)); // Simulate DB operation
		const dbPing = Date.now() - dbPingStart;

		// Create embed
		const embed = new EmbedBuilder()
			.setTitle('📊 Bot Status & Statistics')
			.setColor(statusColor)
			.setDescription(`**Overall Status:** ${statusText}\n\n**Discord API:** \`${websocketPing}ms\`\n**Bot Response:** \`${ping}ms\`\n**Database Ping:** \`${dbPing}ms\``)
			.addFields(
				{ name: '⏱️ Uptime', value: `Bot started <t:${Math.floor((Date.now() - uptime * 1000) / 1000)}:R>\n\`${uptimeString}\``, inline: true },
				{ name: '🖥️ System Uptime', value: `\`${systemUptime}\``, inline: true },
				{ name: '🤖 Bot Info', value: `Servers: \`${serverCount}\`\nUsers: \`${userCount}\`\nCommands: \`${commandCount}\``, inline: true },
				{ name: '💾 Memory Usage', value: `Bot: \`${usedHeapSize}MB / ${totalHeapSize}MB (${memoryUsagePercent}%)\`\nSystem: \`${usedMem}GB / ${totalMem}GB\``, inline: false },
				{ name: '🧠 System', value: `CPUs: \`${cpuCount}\`\nPlatform: \`${platform}\``, inline: false },
				{ name: '👑 Owner', value: `\`${botOwnerTag}\``, inline: true }
			)
			.setFooter({
				text: `Requested by ${interaction.user.tag} • Last refreshed`,
				iconURL: interaction.user.displayAvatarURL()
			})
			.setTimestamp();

		// Create refresh button
		const refreshButton = new ButtonBuilder()
			.setCustomId('refresh_ping')
			.setLabel('Refresh Stats')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('🔄');

		const detailsButton = new ButtonBuilder()
			.setCustomId('ping_details')
			.setLabel('Detailed View')
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('📋');

		const row = new ActionRowBuilder().addComponents(refreshButton, detailsButton);

		// Send the embed with button
		await interaction.editReply({
			embeds: [embed],
			components: [row]
		});

		// Create a collector for button interactions
		const filter = i =>
			i.customId === 'refresh_ping' ||
			i.customId === 'ping_details' &&
			i.user.id === interaction.user.id;

		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			time: 60000
		});

		collector.on('collect', async i => {
			await i.deferUpdate();

			if (i.customId === 'refresh_ping') {
				// Recalculate all metrics
				const newPing = Date.now() - startTime;
				const newWebsocketPing = client.ws.ping;
				const newUptime = process.uptime();
				const newUptimeString = formatUptime(newUptime);

				const newMemoryUsage = process.memoryUsage();
				const newUsedHeapSize = (newMemoryUsage.heapUsed / 1024 / 1024).toFixed(2);
				const newMemoryUsagePercent = ((newMemoryUsage.heapUsed / newMemoryUsage.heapTotal) * 100).toFixed(1);

				// Recalculate status color
				let newStatusColor;
				let newStatusText;
				if (newPing < 100) {
					newStatusColor = '#00FF00';
					newStatusText = '🟢 Excellent';
				} else if (newPing < 200) {
					newStatusColor = '#FFFF00';
					newStatusText = '🟡 Good';
				} else if (newPing < 500) {
					newStatusColor = '#FFA500';
					newStatusText = '🟠 Moderate';
				} else {
					newStatusColor = '#FF0000';
					newStatusText = '🔴 Poor';
				}

				const dbPingStart = Date.now();
				await new Promise(resolve => setTimeout(resolve, 10)); // Simulate DB operation
				const newDbPing = Date.now() - dbPingStart;

				// Update embed
				embed
					.setColor(newStatusColor)
					.setDescription(`**Overall Status:** ${newStatusText}\n\n**Discord API:** \`${newWebsocketPing}ms\`\n**Bot Response:** \`${newPing}ms\`\n**Database Ping:** \`${newDbPing}ms\``)
					.setFields(
						{ name: '⏱️ Uptime', value: `Bot started <t:${Math.floor((Date.now() - newUptime * 1000) / 1000)}:R>\n\`${newUptimeString}\``, inline: true },
						{ name: '🖥️ System Uptime', value: `\`${systemUptime}\``, inline: true },
						{ name: '🤖 Bot Info', value: `Servers: \`${serverCount}\`\nUsers: \`${userCount}\`\nCommands: \`${commandCount}\``, inline: true },
						{ name: '💾 Memory Usage', value: `Bot: \`${newUsedHeapSize}MB / ${totalHeapSize}MB (${newMemoryUsagePercent}%)\`\nSystem: \`${usedMem}GB / ${totalMem}GB\``, inline: false },
						{ name: '🧠 System', value: `CPUs: \`${cpuCount}\`\nPlatform: \`${platform}\``, inline: false },
						{ name: '👑 Owner', value: `\`${botOwnerTag}\``, inline: true }
					)
					.setTimestamp();
			} else if (i.customId === 'ping_details') {
				// Show detailed technical information
				const detailedEmbed = new EmbedBuilder()
					.setTitle('📋 Detailed Technical Information')
					.setColor(statusColor)
					.addFields(
						{ name: 'Node.js Version', value: `\`${process.version}\``, inline: true },
						{ name: 'Discord.js Version', value: `\`${require('discord.js').version}\``, inline: true },
						{ name: 'Operating System', value: `\`${os.type()} ${os.release()}\``, inline: true },
						{ name: 'Architecture', value: `\`${os.arch()}\``, inline: true },
						{ name: 'CPU Model', value: `\`${os.cpus()[0].model}\``, inline: true },
						{ name: 'Process PID', value: `\`${process.pid}\``, inline: true },
						{ name: 'Memory Usage (Detailed)', value: [
							`RSS: \`${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB\``,
							`External: \`${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB\``,
							`Array Buffers: \`${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB\``,
						].join('\n'), inline: false },
						{ name: 'Process Started', value: `\`${botStartTime}\``, inline: false },
						{ name: 'User Agent', value: `\`${process.env.npm_config_user_agent || 'N/A'}\``, inline: false }
					)
					.setFooter({
						text: `Requested by ${interaction.user.tag}`,
						iconURL: interaction.user.displayAvatarURL()
					})
					.setTimestamp();

				await i.editReply({ embeds: [detailedEmbed] });

				// Add a timeout to return to the main view
				setTimeout(async () => {
					await i.editReply({ embeds: [embed] }).catch(() => {});
				}, 10000);
			}
		});
	},

	options: {
		cooldown: '5s',
		isActive: true,
		isAdmin: false,
	},
};

// Function to format uptime
function formatUptime(uptime) {
	const days = Math.floor(uptime / 86400);
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
