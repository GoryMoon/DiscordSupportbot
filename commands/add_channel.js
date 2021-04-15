import { getChannelFromMention } from '../util.js'
import _includes from 'lodash.includes'

export const name = 'add_channel';
export const description = 'Adds a channel to listen and respond in';
export const args = 1;
export const usage = '<channel>';
export const aliases = ['ac']
export function execute(message, args) {
    const { client } = message;
    let channel = getChannelFromMention(client, args[0]);
    if (channel === null) {
        return message.reply(`Couldn't find the supplied channel, make sure to mention it using a \`#\`.`)
    }
    let channels = client.settings.get(message.guild.id, "channels")
    if (_includes(channels, channel.id)) {
        return message.reply(`Channel ${channel} is already in the list.`)
    }

    channels.push(channel.id);
    client.settings.set(message.guild.id, channels, "channels");
    message.reply(`Added channel: ${channel}`);
}