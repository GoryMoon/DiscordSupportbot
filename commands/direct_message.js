import { PermissionFlagsBits } from "discord.js";
import { getChannelFromMention } from "../util.js";

export const name = 'direct_message';
export const description = 'Sends a direct message as the bot in the specified channel.';
export const args = 2;
export const usage = '<channel> <message>';
export const aliases = ['dm']
export async function execute(message, args) {
    const { client } = message;

    const channel = getChannelFromMention(client, args[0]);
    if (channel === null) {
        return await message.reply(`Couldn't find the supplied channel, make sure to mention it using a \`#\`.`)
    }

    const msg = args.slice(1).join(' ');
    if (channel.viewable) {
        if (!channel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
            await message.reply(`Not allowed to send messages in: ${channel}, give me permission to send messages.`);
        } else {
            await channel.send(msg);
            await message.channel.send(`Posted in: ${channel}\n > ${msg}`);
        }
    } else {
        await message.reply(`Can not send messages in: ${channel}, add me to that channel to send messages.`);
    }
}