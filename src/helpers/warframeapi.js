const axios = require('axios');

const WARFRAME_API_URL = 'https://api.warframestat.us/pc';

async function getWarframeAlerts() {
	try {
		const response = await axios.get(`${WARFRAME_API_URL}/alerts`);
		return response.data;
	} catch (error) {
		console.error('Error fetching alerts:', error);
		return [];
	}
}

async function getVoidFissures() {
	try {
		const response = await axios.get(`${WARFRAME_API_URL}/fissures`);
		return response.data;
	} catch (error) {
		console.error('Error fetching fissures:', error);
		return [];
	}
}

async function getWarframeInvasions() {
	try {
		const response = await axios.get(`${WARFRAME_API_URL}/invasions`);
		return response.data;
	} catch (error) {
		console.error('Error fetching invasions:', error);
		return [];
	}
}

// Add a language parameter to your API request
async function getWarframeSortie() {
	try {
		const response = await fetch('https://api.warframestat.us/pc/sortie?language=en');
		// Alternatively: 'https://api.warframestat.us/pc/sortie', { headers: { 'Accept-Language': 'en' } }

		if (!response.ok) {
			throw new Error(`API responded with status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching Warframe sortie data:', error);
		return null;
	}
}

async function getWarframeNightwave() {
	try {
		const response = await axios.get(`${WARFRAME_API_URL}/nightwave`);
		return response.data;
	} catch (error) {
		console.error('Error fetching nightwave:', error);
		return null;
	}
}

async function getWarframeBaro() {
	try {
		const response = await axios.get(`${WARFRAME_API_URL}/voidTrader`);
		return response.data;
	} catch (error) {
		console.error('Error fetching void trader:', error);
		return null;
	}
}

async function getWarframeArbitration() {
	try {
		const response = await axios.get(`${WARFRAME_API_URL}/arbitration`);
		return response.data;
	} catch (error) {
		console.error('Error fetching arbitration:', error);
		return null;
	}
}

// Function to get current cycle information for open worlds
async function getWarframeCycles() {
	try {
		// Earth/Cetus cycle
		const earthResponse = await fetch('https://api.warframestat.us/pc/earthCycle');
		const earthData = await earthResponse.json();

		// Orb Vallis cycle
		const vallisResponse = await fetch('https://api.warframestat.us/pc/vallisCycle');
		const vallisData = await vallisResponse.json();

		// Cambion Drift cycle
		const cambionResponse = await fetch('https://api.warframestat.us/pc/cambionCycle');
		const cambionData = await cambionResponse.json();

		// Zariman cycle
		const zarimanResponse = await fetch('https://api.warframestat.us/pc/zarimanCycle');
		const zarimanData = await zarimanResponse.json();

		return {
			earthCycle: {
				isDay: earthData.isDay,
				timeLeft: earthData.timeLeft ? parseInt(earthData.timeLeft.replace('m', '').replace('s', '')) : 0
			},
			vallisCycle: {
				isWarm: vallisData.isWarm,
				timeLeft: vallisData.timeLeft ? parseInt(vallisData.timeLeft.replace('m', '').replace('s', '')) : 0
			},
			cambionCycle: {
				state: cambionData.active,
				timeLeft: cambionData.timeLeft ? parseInt(cambionData.timeLeft.replace('m', '').replace('s', '')) : 0
			},
			zarimanCycle: {
				state: zarimanData.state,
				timeLeft: zarimanData.timeLeft ? parseInt(zarimanData.timeLeft.replace('m', '').replace('s', '')) : 0
			}
		};
	} catch (error) {
		console.error('Error fetching Warframe cycle data:', error);
		return null;
	}
}

// Function to get a player's Warframe profile
async function getWarframeProfile(username) {
	try {
		const response = await fetch(`https://api.warframestat.us/profile/${encodeURIComponent(username)}`);

		// Check if response is successful
		if (response.status === 404) {
			return null; // Player not found
		}

		if (!response.ok) {
			console.error(`Error fetching profile: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json();

		// If data is empty or has error, return null
		if (!data || data.error) {
			return null;
		}

		return data;
	} catch (error) {
		console.error('Error fetching Warframe profile data:', error);
		return null;
	}
}

// Function to get drop data for an item
async function getWarframeDrops(searchTerm) {
	try {
		// Endpoint to search for drops
		const response = await fetch(`https://api.warframestat.us/drops/search/${encodeURIComponent(searchTerm)}`);

		if (!response.ok) {
			console.error(`Error fetching drop data: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json();

		// Process and organize drop data
		const processedDrops = data.map(drop => {
			// Normalize the drop chance value
			let chance = drop.chance || 0;
			// If chance is already in percentage (>= 1), convert to decimal
			if (chance > 1 && chance <= 100) {
				chance = chance / 100;
			}
			// If chance is extremely high (likely already in percentage but not normalized)
			else if (chance > 100) {
				chance = chance / 10000; // Convert from basis points (10000 = 100%) to decimal
			}

			return {
				item: drop.item || 'Unknown Item',
				location: drop.place || 'Unknown Location',
				chance: chance,
				category: determineCategory(drop)
			};
		});

		// Sort by drop chance (highest first)
		return processedDrops.sort((a, b) => b.chance - a.chance);
	} catch (error) {
		console.error('Error fetching Warframe drop data:', error);
		return null;
	}
}

// Helper function to determine category for a drop
function determineCategory(drop) {
	if (!drop.place) return 'Other';

	// Mission rewards
	if (drop.place.includes('Mission Rewards')) {
		return 'Mission Rewards';
	}

	// Relics
	if (drop.place.includes('Relic')) {
		return 'Relics';
	}

	// Enemies
	if (drop.place.includes('Enemy')) {
		return 'Enemy Drops';
	}

	// Bounties
	if (drop.place.includes('Bounty') || drop.place.includes('Cetus') ||
		drop.place.includes('Fortuna') || drop.place.includes('Deimos')) {
		return 'Bounties';
	}

	// Market
	if (drop.place.includes('Market')) {
		return 'Market';
	}

	return 'Other Sources';
}

module.exports = {
	getWarframeAlerts,
	getVoidFissures,
	getWarframeInvasions,
	getWarframeSortie,
	getWarframeNightwave,
	getWarframeBaro,
	getWarframeArbitration,
	getWarframeCycles,
	getWarframeProfile,
	getWarframeDrops
};
