import _pullAt from 'lodash.pullat'
import { safeToLowerCase } from '../util.js';

export const name = 'remove_special_message';
export const description = 'Removes a message from the list of possible repsones for the special word, use the list command to get the id';
export const args = 3;
export const usage = '<word> <role name> <message_id>';
export const aliases = ['rsm', 'dsm', 'delete_message_special']
export function execute(message, args) {
    const { client } = message;

    let specialMessages = client.settings.get(message.guild.id, "specialMessages")
    const word = safeToLowerCase(args[0]);
    const role = args[1];
    const msg_id = args[2];

    if (specialMessages === undefined && specialMessages.length <= 0) {
        return message.reply("No special words added,");
    }
    
    for (let i = 0; i < specialMessages.length; i++) {
        const msg = specialMessages[i];
        if (msg.word === word && msg.role === role) {
            if (!msg.messages[msg_id]) {
                return message.reply(`Message id isn't in the list.`)
            }
            let index = parseInt(msg_id);
            if (isNaN(index)) {
                return message.reply('Bad value used as the message id.')
            }

            let m = _pullAt(msg.messages, index);
            if (msg.messages.length <= 0) {
                _pullAt(specialMessages, i)
            }
            client.settings.set(message.guild.id, specialMessages, "specialMessages");
            return message.channel.send(`Removed message:\n> \`${word}\` -> **${role}**: ${m}`);
        }
    }
    return message.reply(`No special message type found with word and role:\n> \`${word}\` -> **${role}**`);
}