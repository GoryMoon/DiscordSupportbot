import _includes from "lodash.includes";
import { getChannelFromMention } from "../util.js";

export const name = 'direct_message';
export const description = 'Sends a direct message as the bot in the specified channel.';
export const args = 2;
export const usage = '<channel> <message>';
export const aliases = ['dm']
export function execute(message, args) {
    const { client } = message;

    const channel = getChannelFromMention(client, args[0]);
    if (channel === null) {
        return message.reply(`Couldn't find the supplied channel, make sure to mention it using a \`#\`.`)
    }

    const channels = client.settings.get(message.guild.id, "channels");
    if (!_includes(channels, channel.id)) {
        return message.reply(`Can only send messages to channels that I can react in, add a channel with the \`add_channel\` command.`);
    }

    const msg = args.slice(1).join(' ');
    channel.send(msg);
    message.channel.send(`Posted in: ${channel}\n > ${msg}`);
}