<<<<<<< Updated upstream
const { version } = require('../../../package.json');
const axios = require('axios');
const { clear } = require('console');
const os = require('os');
require('dotenv').config();

module.exports = async (client, handler) => {
    await displayAsciiArt();
    console.log(`\x1b[36m╭─────────────────────────────────────\x1b[37m`);
    console.log(`\x1b[36m│ \x1b[32m${client.user.username} is ready!\x1b[37m`);
    console.log(`\x1b[36m│ \x1b[33mBot Version: ${version}\x1b[37m`);
    console.log(`\x1b[36m│\x1b[37m`);
    console.log(`\x1b[36m│ \x1b[34mSystem Information:\x1b[37m`);
    console.log(`\x1b[36m│\x1b[37m`);
    await printSystemStats();
    console.log(`\x1b[36m│\x1b[37m`);
    console.log(`\x1b[36m╰─────────────────────────────────────\x1b[37m\n`);
};

async function displayAsciiArt() {
    const asciiArt = `
    \x1b[35;1m  :::.    .,:::::::::::::-.    :::.    :::::::..
    \x1b[35;1m  ;;' ;;   ;;;;'''' ;;,   ';;  ;;' ;;   ;;;;'';;;;
    \x1b[35;1m ,[[ '[[,  [[cccc  '[[     [[ ,[[ '[[,  [[[,/[[['
    \x1b[35;1m c$cc$c $""""   $,    $c$cc$c $$c
    \x1b[35;1m 888   888,888oo,__ 888_,o8P' 888   888,888b "88bo,
    \x1b[35;1m   ""' """"YUMMMMMMMP"'   YMM   ""' MMMM   "W"
    \x1b[37m`;
    const lines = asciiArt.trim().split('\n');
    for (const line of lines) {
        console.log(line); // Print each line
    }
}

// Delay function using Promise
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function printSystemStats() {
    // Print CPU usage
    const cpuUsage = process.cpuUsage();
    const elapsedTime = process.uptime();
    const totalCpuTime = (cpuUsage.user + cpuUsage.system) / 1000; // Convert microseconds to milliseconds
    const cpuUsagePercentage = calculateCpuUsage(totalCpuTime, elapsedTime);
    console.log(`\x1b[36m│ \x1b[34mCPU Usage Percentage:\x1b[37m ${cpuUsagePercentage}%\x1b[37m`);

    // Get total system memory and free memory
    const totalMemory = Math.round(os.totalmem() / (1024 * 1024)); // Convert bytes to megabytes
    const freeMemory = Math.round(os.freemem() / (1024 * 1024)); // Convert bytes to megabytes

    // Print RAM usage
    console.log(`\x1b[36m│ \x1b[34mRAM Usage:\x1b[37m ${totalMemory - freeMemory} MB / ${totalMemory} MB\x1b[37m`);

    // Print Elapsed Time
    const formattedElapsedTime = formatElapsedTime(elapsedTime);
    console.log(`\x1b[36m│ \x1b[34mElapsed Time:\x1b[37m ${formattedElapsedTime}\x1b[37m`);

    // Fetch latest release version from GitHub repository
    try {
        const response = await axios.get('https://api.github.com/repos/Drkpulse/jsdiscord/releases/latest');
        const latestVersion = response.data.tag_name;

        // Compare bot version with latest release version
        if (version !== latestVersion) {
            console.log(`\x1b[36m│ \x1b[31mUpdate Available: Latest version: ${latestVersion}\x1b[37m`);
        } else {
            console.log(`\x1b[35m│ \x1b[32mUpdate Status: Bot is up to date.\x1b[37m`);
        }
    } catch (error) {
        console.error('\x1b[41mError fetching latest version from GitHub:\x1b[37m', error);
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
=======
const { version } = require('../../../package.json');
const axios = require('axios');
const { clear } = require('console');
const os = require('os');
require('dotenv').config();

module.exports = async (client, handler) => {
    await displayAsciiArt();
    console.log(`\x1b[36m╭─────────────────────────────────────\x1b[37m`);
    console.log(`\x1b[36m│ \x1b[32m${client.user.username} is ready!\x1b[37m`);
    console.log(`\x1b[36m│ \x1b[33mBot Version: ${version}\x1b[37m`);
    console.log(`\x1b[36m│\x1b[37m`);
    console.log(`\x1b[36m│ \x1b[34mSystem Information:\x1b[37m`);
    console.log(`\x1b[36m│\x1b[37m`);
    await printSystemStats();
    console.log(`\x1b[36m│\x1b[37m`);
    console.log(`\x1b[36m╰─────────────────────────────────────\x1b[37m\n`);
};

async function displayAsciiArt() {
    const asciiArt = `
    \x1b[35;1m  :::.    .,:::::::::::::-.    :::.    :::::::..
    \x1b[35;1m  ;;' ;;   ;;;;'''' ;;,   ';;  ;;' ;;   ;;;;'';;;;
    \x1b[35;1m ,[[ '[[,  [[cccc  '[[     [[ ,[[ '[[,  [[[,/[[['
    \x1b[35;1m c$cc$c $""""   $,    $c$cc$c $$c
    \x1b[35;1m 888   888,888oo,__ 888_,o8P' 888   888,888b "88bo,
    \x1b[35;1m   ""' """"YUMMMMMMMP"'   YMM   ""' MMMM   "W"
    \x1b[37m`;
    const lines = asciiArt.trim().split('\n');
    for (const line of lines) {
        console.log(line); // Print each line
    }
}

// Delay function using Promise
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function printSystemStats() {
    // Print CPU usage
    const cpuUsage = process.cpuUsage();
    const elapsedTime = process.uptime();
    const totalCpuTime = (cpuUsage.user + cpuUsage.system) / 1000; // Convert microseconds to milliseconds
    const cpuUsagePercentage = calculateCpuUsage(totalCpuTime, elapsedTime);
    console.log(`\x1b[36m│ \x1b[34mCPU Usage Percentage:\x1b[37m ${cpuUsagePercentage}%\x1b[37m`);

    // Get total system memory and free memory
    const totalMemory = Math.round(os.totalmem() / (1024 * 1024)); // Convert bytes to megabytes
    const freeMemory = Math.round(os.freemem() / (1024 * 1024)); // Convert bytes to megabytes

    // Print RAM usage
    console.log(`\x1b[36m│ \x1b[34mRAM Usage:\x1b[37m ${totalMemory - freeMemory} MB / ${totalMemory} MB\x1b[37m`);

    // Print Elapsed Time
    const formattedElapsedTime = formatElapsedTime(elapsedTime);
    console.log(`\x1b[36m│ \x1b[34mElapsed Time:\x1b[37m ${formattedElapsedTime}\x1b[37m`);

    // Fetch latest release version from GitHub repository
    try {
        const response = await axios.get('https://api.github.com/repos/Drkpulse/jsdiscord/releases/latest');
        const latestVersion = response.data.tag_name;

        // Compare bot version with latest release version
        if (version !== latestVersion) {
            console.log(`\x1b[36m│ \x1b[31mUpdate Available: Latest version: ${latestVersion}\x1b[37m`);
        } else {
            console.log(`\x1b[35m│ \x1b[32mUpdate Status: Bot is up to date.\x1b[37m`);
        }
    } catch (error) {
        console.error('\x1b[41mError fetching latest version from GitHub:\x1b[37m', error);
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
>>>>>>> Stashed changes
