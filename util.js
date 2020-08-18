import _find from 'lodash.find';

export function getChannelFromMention(client, mention) {
	if (!mention) return;

	if (mention.startsWith('<#') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		return client.channels.cache.get(mention);
	}
}

export function safeToLowerCase(s) {
	return s === undefined ? undefined: s.toLowerCase();
}

export function findRole(roles, name) {
	return roles.fetch()
        .then(roles => {
			var not = name.startsWith('!');
            return (not ? '!' : '') + _find(roles.cache.array(), ['name', not ? name.substring(1): name])
		});
}