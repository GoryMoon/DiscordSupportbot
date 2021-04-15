import _find from 'lodash.find';

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

export function findRole(roles, name) {
	return roles.fetch()
        .then(roles => {
			var not = name.startsWith('!');
			var r = _find(roles.cache.array(), ['name', not ? name.substring(1): name]);
			var role = { name: r.name };
			if (role !== undefined && not) {
				role.name = '!' + role.name;
			}
            return role;
		});
}