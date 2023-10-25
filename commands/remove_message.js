import _pullAt from 'lodash.pullat'

export const name = 'remove_message';
export const description = 'Removes a message from the list of possible repsones, use the list command to get the id';
export const args = 1;
export const usage = '<message_id>';
export const aliases = ['rm', 'delete_message']
export function execute(message, args) {
    const { client } = message;

    let messages = client.settings.get(message.guild.id, "messages")
    if (!messages[args[0]]) {
        return message.reply(`Message id isn't in the list.`)
    }
    let i = parseInt(args[0]);
    if (isNaN(i)) {
        return message.reply('Bad value used as the message id.')
    }

    let m = _pullAt(messages, i);
    client.settings.set(message.guild.id, messages, 'messages');
    return message.channel.send(`Removed message:\n> ${m}`);
}