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

async function getWarframeSortie() {
    try {
        const response = await axios.get(`${WARFRAME_API_URL}/sortie`);
        return response.data;
    } catch (error) {
        console.error('Error fetching sortie:', error);
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

module.exports = {
    getWarframeAlerts,
    getVoidFissures,
    getWarframeInvasions,
    getWarframeSortie,
    getWarframeNightwave,
    getWarframeBaro,
    getWarframeArbitration
};
