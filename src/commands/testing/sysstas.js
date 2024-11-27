const os = require('os');
const { execSync } = require('child_process');

module.exports = {
	data: {
		name: 'systemstats',
		description: 'Print system statistics',
	},

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply();

		// Get total system memory and free memory
		const totalMemory = Math.round(os.totalmem() / (1024 * 1024)); // Convert bytes to megabytes
		const freeMemory = Math.round(os.freemem() / (1024 * 1024)); // Convert bytes to megabytes

		// Calculate RAM usage
		const ramUsage = `${totalMemory - freeMemory} MB / ${totalMemory} MB`;

		// Calculate CPU usage
		const cpuUsage = process.cpuUsage();
		const cpuUsagePercentage = calculateCpuUsage(cpuUsage);

		// Get CPU temperature (Linux only)
		let cpuTemperature;
		try {
			cpuTemperature = execSync('sensors | grep "Package id 0"').toString().trim();
		} catch (error) {
			console.error('Error fetching CPU temperature:', error);
			cpuTemperature = 'N/A';
		}

		const response = `RAM Usage: ${ramUsage}\nCPU Usage Percentage: ${cpuUsagePercentage}%\nCPU Temperature: ${cpuTemperature}`;
		await interaction.editReply(response);

		// Log command usage
		const dateTime = new Date().toISOString();
		const user = interaction.user.tag;
		const interactionId = interaction.commandName;

		console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},
	options: {
		devOnly: true,
	},
};

function calculateCpuUsage(cpuUsage) {
	const totalCpuTime = (cpuUsage.user + cpuUsage.system) / 1000; // Convert microseconds to milliseconds
	const availableCpuTime = os.cpus().length * os.cpus()[0].speed * 1000000; // Total CPU time available for all cores (in microseconds)
	const cpuUsagePercentage = ((totalCpuTime / availableCpuTime) * 100).toFixed(2); // Calculate CPU usage percentage
	return cpuUsagePercentage;
}
