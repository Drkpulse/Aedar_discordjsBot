const { version } = require('../../../package.json');
const axios = require('axios');
const os = require('os');
const { execSync } = require('child_process');

module.exports = async (client, handler) => {
    console.log(`\n╭────────────────────────────────────`);
    console.log(`│ ${client.user.username} is ready!`);
    console.log(`│ Bot Version: ${version}`);
    console.log(`│`);
    console.log(`│ System Information:`);
    console.log(`│`);
    await printSystemStats();
    console.log(`│`);
    console.log(`╰─────────────────────────────────────\n`);

};

async function printSystemStats() {

    // Print CPU usage
    const cpuUsage = process.cpuUsage();
    const elapsedTime = process.uptime();
    const totalCpuTime = (cpuUsage.user + cpuUsage.system) / 1000; // Convert microseconds to milliseconds
    const cpuUsagePercentage = calculateCpuUsage(totalCpuTime, elapsedTime);
    console.log(`│ CPU Usage Percentage: ${cpuUsagePercentage}%`);

    // Get total system memory and free memory
    const totalMemory = Math.round(os.totalmem() / (1024 * 1024)); // Convert bytes to megabytes
    const freeMemory = Math.round(os.freemem() / (1024 * 1024)); // Convert bytes to megabytes

    // Print RAM usage
    console.log(`│ RAM Usage: ${totalMemory - freeMemory} MB / ${totalMemory} MB`);

    // Print Elapsed Time
    const formattedElapsedTime = formatElapsedTime(elapsedTime);
    console.log(`│ Elapsed Time: ${formattedElapsedTime}`);

    // Fetch latest release version from GitHub repository
    try {
        const response = await axios.get('https://api.github.com/repos/Drkpulse/jsdiscord/releases/latest');
        const latestVersion = response.data.tag_name;

        // Compare bot version with latest release version
        if (version !== latestVersion) {
            console.log(`│ Update Available: Latest version: ${latestVersion}`);
        } else {
            console.log(`│ Update Status: Bot is up to date.`);
        }
    } catch (error) {
        console.error('Error fetching latest version from GitHub:', error);
    }
}

function calculateCpuUsage(totalCpuTime, elapsedTime) {
    const availableCpuTime = os.cpus().length * elapsedTime * 1000; // Total CPU time available for all cores during the elapsed time (in microseconds)
    const cpuUsagePercentage = ((totalCpuTime / availableCpuTime) * 100).toFixed(2); // Calculate CPU usage percentage
    return cpuUsagePercentage;
}

function formatElapsedTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
}


