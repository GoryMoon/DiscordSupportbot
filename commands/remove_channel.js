import { getChannelFromMention } from '../util.js'
import _includes from 'lodash.includes'
import _pull from 'lodash.pull'

export const name = 'remove_channel';
export const description = 'Removes a channel to listen and respond in';
export const args = 1;
export const usage = '<channel>';
export const aliases = ['rc']
export function execute(message, args) {
    const { client } = message;
    let channel = getChannelFromMention(client, args[0]);
    if (!channel) {
        return message.reply('Invalid channel mention!')
    }
    let channels = client.settings.get(message.guild.id, "channels")
    if (!_includes(channels, channel.id)) {
        return message.reply(`Channel ${channel} isn't in the list.`)
    }

    _pull(channels, channel.id);
    client.settings.set(message.guild.id, channels, "channels");
    message.reply(`Removed channel ${channel}`);
}