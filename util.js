import _indexOf from 'lodash.indexof'
import _random from 'lodash.random'
import _takeRight from 'lodash.takeright'

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

export function getRandomMessage(client, guildId) {
	let messages = client.settings.get(guildId, "messages")
	let lastMessages = client.settings.get(guildId, "lastMessages")

	let num = -1;
	do {
		num = _random(messages.length - 1);
	} while(_indexOf(lastMessages, num) != -1 && messages.length > 1)
	
	if (lastMessages == undefined) {
		lastMessages = [];
	}
	lastMessages.push(num);
	client.settings.set(guildId, _takeRight(lastMessages, Math.ceil(messages.length * 0.3)), "lastMessages")
	return messages[num];
}