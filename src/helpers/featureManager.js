import { getDatabase } from './mongoClient.js';

// Per-server feature switches, managed with /features.
// A feature is either a command category (every command in src/app/commands/(category)/)
// or an automatic feature that runs from an event handler.
// Everything is on by default; only the switches an admin turned off are stored.

const COLLECTION = 'featureSettings';

// Categories that can never be turned off, so admins can't lock themselves out of /features.
export const CORE_CATEGORIES = ['admin'];

// Labels for the command categories. A new (category) folder still shows up without an entry here.
const CATEGORY_INFO = {
	economy: { label: 'Economy', emoji: '💰', description: 'Balance, shop, daily, work, transfers' },
	fun: { label: 'Fun & Games', emoji: '🎲', description: 'Blackjack, slots, roulette, 8ball, gifs...' },
	helpful: { label: 'Helpful', emoji: '💡', description: 'Help, info and invite commands' },
	moderation: { label: 'Moderation', emoji: '🛡️', description: 'Event roles, feedback, suggestions, reports' },
	testing: { label: 'Testing', emoji: '🧪', description: 'Embeds, modals and other test commands' },
	utility: { label: 'Utility', emoji: '🔧', description: 'Ping, reload and other tools' },
	warframe: { label: 'Warframe', emoji: '🚀', description: 'Alerts, Baro, cycles, drops, fissures' },
	weather: { label: 'Weather', emoji: '🌦️', description: 'Weather and forecast' },
};

// Features that run from event handlers rather than slash commands.
export const AUTOMATIC_FEATURES = {
	welcome: { label: 'Welcome messages', emoji: '👋', description: 'Greets new members in the welcome channel' },
	birthdays: { label: 'Birthday announcements', emoji: '🎂', description: 'Posts birthday messages at midnight' },
	aiChat: { label: 'AI chat', emoji: '🤖', description: 'Answers when the bot is mentioned or replied to' },
	autoReplies: { label: 'Auto replies', emoji: '💬', description: 'Joke replies to certain words in chat' },
	translate: { label: 'Flag translations', emoji: '🌍', description: 'Translates a message when someone reacts with a flag' },
	eventRoles: { label: 'Event roles', emoji: '🎟️', description: 'Gives a role to people interested in a server event' },
	eventRepeat: { label: 'Repeating events', emoji: '🔁', description: 'Recreates [daily]/[weekly]/... events when they end' },
	chatHistory: { label: 'Chat history logging', emoji: '📝', description: 'Saves messages to the database' },
	commandLogging: { label: 'Command usage logging', emoji: '📊', description: 'Saves which commands are used' },
};

// guildId -> Set of disabled feature keys
const disabled = new Map();

// Feature keys: "category:<name>" for command categories, "auto:<name>" for automatic features.
export const categoryKey = (category) => `category:${String(category).toLowerCase()}`;
export const autoKey = (name) => `auto:${name}`;

/** Info for a command category, with a fallback for categories without an entry above. */
export function getCategoryInfo(category) {
	const name = String(category).toLowerCase();
	return CATEGORY_INFO[name] ?? {
		label: name.charAt(0).toUpperCase() + name.slice(1),
		emoji: '📁',
		description: `Commands in the ${name} category`,
	};
}

/** Whether a feature key is on for a server. Outside a server (DMs) everything is on. */
export function isFeatureEnabled(key, guildId) {
	if (!guildId) return true;
	return !disabled.get(guildId)?.has(key);
}

/** Whether the commands in a category can run in a server. */
export function isCategoryEnabled(category, guildId) {
	if (!category || CORE_CATEGORIES.includes(String(category).toLowerCase())) return true;
	return isFeatureEnabled(categoryKey(category), guildId);
}

/** Whether an automatic feature can run in a server. */
export function isAutomaticFeatureEnabled(name, guildId) {
	return isFeatureEnabled(autoKey(name), guildId);
}

/**
 * Turns features on or off for a server and saves the change.
 * @param {string} guildId
 * @param {Record<string, boolean>} changes feature key -> enabled
 * @param {string} [updatedBy] user id of the admin making the change
 */
export async function setFeatures(guildId, changes, updatedBy = null) {
	const entries = Object.entries(changes);
	if (entries.length === 0) return;

	const db = await getDatabase();
	await db.collection(COLLECTION).bulkWrite(
		entries.map(([feature, enabled]) => ({
			updateOne: {
				filter: { guildId, feature },
				update: { $set: { enabled, updatedAt: new Date(), updatedBy } },
				upsert: true,
			},
		})),
	);

	// Only update memory once the database write worked
	const set = disabled.get(guildId) ?? new Set();
	for (const [feature, enabled] of entries) {
		if (enabled) set.delete(feature);
		else set.add(feature);
	}
	disabled.set(guildId, set);
}

/** Loads all saved switches from MongoDB. Called once when the bot starts. */
export async function loadFeatureStates(db) {
	const settings = await db.collection(COLLECTION).find({ enabled: false }).toArray();
	disabled.clear();
	for (const { guildId, feature } of settings) {
		if (!disabled.has(guildId)) disabled.set(guildId, new Set());
		disabled.get(guildId).add(feature);
	}
	return settings.length;
}
