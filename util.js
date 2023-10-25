export function getChannelFromMention(client, mention) {
	if (!mention) return null;

	if (mention.startsWith('<#') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		return client.channels.cache.get(mention);
	}
	return null;
}

export function safeToLowerCase(s) {
	return s === undefined ? undefined: s.toLowerCase();
}

export async function findRole(rolesCache, name) {
	const roles = await rolesCache.fetch();

	var not = name.startsWith('!');
	var r = roles.find(role => role.name == (not ? name.substring(1): name));
	var role = { name: r.name };
	if (role !== undefined && not) {
		role.name = '!' + role.name;
	}
	return role;
}