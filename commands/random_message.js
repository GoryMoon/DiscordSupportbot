import { PermissionFlagsBits } from "discord.js";
import { getChannelFromMention, getRandomMessage } from "../util.js";

export const name = 'random_message';
export const description = 'Sends a random message as the bot in the specified channel.';
export const args = 1;
export const usage = '<channel>';
export const aliases = ['srm']
export async function execute(message, args) {
    const { client } = message;

    const channel = getChannelFromMention(client, args[0]);
    if (channel === null) {
        return await message.reply(`Couldn't find the supplied channel, make sure to mention it using a \`#\`.`)
    }

    const msg = getRandomMessage(client, message.guild.id);

    if (!msg) {
        return await message.reply(`No messages found.`);
    }

    if (channel.viewable) {
        if (!channel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
            await message.reply(`Not allowed to send messages in: ${channel}, give me permission to send messages.`);
        } else {
            await channel.send(msg);
            await message.channel.send(`Posted in: ${channel}\n > ${msg}`);
        }
    } else {
        await message.reply(`Not allowed to send messages in: ${channel}, add me to that channel to send messages.`);
    }
}