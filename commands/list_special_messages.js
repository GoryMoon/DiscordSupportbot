import { safeToLowerCase } from '../util.js';

export const name = 'list_special_messages';
export const description = 'List all messages that can be used as respones for a special word';
export const usage = '[word]';
export const aliases = ['lsm']
export function execute(message, args, _logger) {
    const { client } = message;
    
    let specialMessages = client.settings.get(message.guild.id, "specialMessages")
    let word = safeToLowerCase(args[0]);

    if (specialMessages === undefined || specialMessages.length <= 0) {
        return message.reply("No special words.");
    }

    let found = false;
    let messageToSend = [];
    for (let i = 0; i < specialMessages.length; i++) {
        const msg = specialMessages[i];
        if (word == undefined || msg.word === word) {
            found = true;

            let header = `\`${msg.word}\` -> **${msg.role}**:\n`
            if (!msg.messages.length) {
                messageToSend.push(`${header}> No messages stored.`);
                continue;
            }
            
            let index = 0;
            messageToSend.push(`${header}${msg.messages.map(m => `> **${index++}**: ${m}`).join('\n')}`);
        }
    }
    if (found) {
        message.channel.send(messageToSend.join('\n'), { split: true })
        return;
    }

    if (word !== undefined) {
        return message.reply(`No special message type found with word: \`${args[0]}\``);
    }
}