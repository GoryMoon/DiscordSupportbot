import { getChannelFromMention } from '../util.js'

export const name = 'add_message';
export const description = 'Adds a message that can show when the bot responds in a channel.';
export const args = 1;
export const usage = '<message>';
export const aliases = ['am']
export function execute(message, args) {
    const { client } = message;

    let messages = client.settings.get(message.guild.id, "messages")

    messages.push(args.join(' '));
    client.settings.set(message.guild.id, messages, "messages");
    message.channel.send(`Added message:\n> ${args.join(' ')}`);
}