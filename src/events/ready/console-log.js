const { version } = require('../../../package.json');
const axios = require('axios');

module.exports = async (client, handler) => {
    console.log(`${client.user.username} is ready!`);
r
    // Print bot version
    console.log(`Bot Version: ${version}`);

    try {
        // Fetch latest release version from GitHub repository
        const response = await axios.get('https://api.github.com/repos/<owner>/<repository>/releases/latest');
        const latestVersion = response.data.tag_name;

        // Compare bot version with latest release version
        if (version !== latestVersion) {
            console.log(`There's a newer version available! Current version: ${version}, Latest version: ${latestVersion}`);
        } else {
            console.log('Bot is up to date.');
        }
    } catch (error) {
        console.error('Error fetching latest version from GitHub:', error);
    }
};

