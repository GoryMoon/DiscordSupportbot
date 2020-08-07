import { safeToLowerCase, findRole } from '../util.js';

export const name = 'add_special_message';
export const description = 'Adds a special message that can show when the bot responds to a role with a keyword in a channel.';
export const args = 3;
export const usage = '<word> <role name> <message>';
export const aliases = ['asm']
export function execute(message, args) {
    const { client } = message;

    let specialMessages = client.settings.get(message.guild.id, "specialMessages")
    const word = safeToLowerCase(args[0]);
    const role = args[1];
    const msg = args.slice(2).join(' ');

    let work = null;
    if (specialMessages === undefined) {
        work = addWord(message, word, role)
    } else {
        work = new Promise(function(resolve, reject) {
            for (let i = 0; i < specialMessages.length; i++) {
                const smessage = specialMessages[i];
                if (smessage.word == word && smessage.role == role) {
                    return resolve(smessage);
                }
            }
            addWord(message, word, role, specialMessages).then(resolve)
        });
    }
    
    work.then(function(smessage) {
        if (smessage == null) {
            return;
        }
        smessage.messages.push(msg)

        client.settings.set(message.guild.id, specialMessages, "specialMessages");
        return message.channel.send(`Added special message:\n> \`${word}\` -> **${role}**: ${msg}`);
    });
}

function addWord(message, word, roleName, messages) {
    return findRole(message.guild.roles, roleName)
        .then(role => {
            if (!role) {
                message.reply(`Could not find role with name: **${roleName}**`);
                return null;
            }
            
            let msg = {
                word,
                role: role.name,
                messages: []
            };
            messages.push(msg)

            message.client.settings.set(message.guild.id, messages, "specialMessages");
            return msg;
        });
}