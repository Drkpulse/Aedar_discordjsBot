const { version } = require('../../../package.json');
const axios = require('axios');
const os = require('os');
const { execSync } = require('child_process');

module.exports = async (client, handler) => {
    console.log(`\n\x1b[35m╭────────────────────────────────────`);
    console.log(`\x1b[35m│ \x1b[32m${client.user.username} is ready!`);
    console.log(`\x1b[35m│ \x1b[33mBot Version: ${version}`);
    console.log(`\x1b[35m│`);
    console.log(`\x1b[35m│ \x1b[34mSystem Information:`);
    console.log(`\x1b[35m│`);
    await printSystemStats();
    console.log(`\x1b[35m│`);
    console.log(`\x1b[35m╰─────────────────────────────────────\x1b[37m\n`);
};


async function printSystemStats() {

    // Print CPU usage
    const cpuUsage = process.cpuUsage();
    const elapsedTime = process.uptime();
    const totalCpuTime = (cpuUsage.user + cpuUsage.system) / 1000; // Convert microseconds to milliseconds
    const cpuUsagePercentage = calculateCpuUsage(totalCpuTime, elapsedTime);
    console.log(`\x1b[35m│ \x1b[34mCPU Usage Percentage:\x1b[37m ${cpuUsagePercentage}%`);

    // Get total system memory and free memory
    const totalMemory = Math.round(os.totalmem() / (1024 * 1024)); // Convert bytes to megabytes
    const freeMemory = Math.round(os.freemem() / (1024 * 1024)); // Convert bytes to megabytes

    // Print RAM usage
    console.log(`\x1b[35m│ \x1b[34mRAM Usage:\x1b[37m ${totalMemory - freeMemory} MB / ${totalMemory} MB`);

    // Print Elapsed Time
    const formattedElapsedTime = formatElapsedTime(elapsedTime);
    console.log(`\x1b[35m│ \x1b[34mElapsed Time:\x1b[37m ${formattedElapsedTime}`);

    // Fetch latest release version from GitHub repository
    try {
        const response = await axios.get('https://api.github.com/repos/Drkpulse/jsdiscord/releases/latest');
        const latestVersion = response.data.tag_name;

        // Compare bot version with latest release version
        if (version !== latestVersion) {
            console.log(`\x1b[35m│ \x1b[31mUpdate Available: Latest version: ${latestVersion}`);
        } else {
            console.log(`\x1b[35m│ \x1b[32mUpdate Status: Bot is up to date.`);
        }
    } catch (error) {
        console.error('\x1b[41mError fetching latest version from GitHub:', error);
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


