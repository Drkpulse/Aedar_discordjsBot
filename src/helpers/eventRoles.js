// Shared naming for the roles given to people going to a scheduled event.
// The automatic add/remove/delete handlers in src/app/events and /eventrole all use this name,
// so a role made by /eventrole is also cleaned up when people leave or the event is deleted.
export const eventRoleName = (eventName) => `${eventName} Evento`;

/** Finds the event's role, creating it if needed. */
export async function getOrCreateEventRole(guild, event) {
	const roleName = eventRoleName(event.name);
	const existing = guild.roles.cache.find((role) => role.name === roleName);
	if (existing) return existing;

	return guild.roles.create({
		name: roleName,
		mentionable: true,
		color: 'Random',
		reason: `Role created for event: ${event.name}`,
	});
}

/** Returns the IDs of everyone subscribed to a scheduled event (Discord pages them 100 at a time). */
export async function fetchAllSubscriberIds(event) {
	const ids = [];
	let after;
	for (;;) {
		const page = await event.fetchSubscribers({ limit: 100, ...(after ? { after } : {}) });
		if (page.size === 0) break;
		ids.push(...page.keys());
		if (page.size < 100) break;
		after = page.lastKey();
	}
	return ids;
}
