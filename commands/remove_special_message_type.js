import _pullAt from 'lodash.pullat'
import { safeToLowerCase } from '../util.js';

export const name = 'remove_special_message_type';
export const description = 'Removes a special word and all related messages';
export const args = 2;
export const usage = '<word> <role name>';
export const aliases = ['rsmt', 'dsmt', 'delete_special_message_type']
export function execute(message, args) {
    const { client } = message;

    let specialMessages = client.settings.get(message.guild.id, "specialMessages")
    const word = safeToLowerCase(args[0]);
    const role = args[1];

    if (specialMessages === undefined && specialMessages.length <= 0) {
        return message.reply("No special words added.");
    }
    
    for (let i = 0; i < specialMessages.length; i++) {
        const msg = specialMessages[i];
        if (msg.word === word && msg.role === role) {
            _pullAt(specialMessages, i)
            client.settings.set(message.guild.id, specialMessages, "specialMessages");
            return message.channel.send(`Removed special word:\n> \`${word}\` -> **${role}**`);
        }
    }
    return message.reply(`No special word found with:\n>  \`${word}\` -> **${role}**`);
}