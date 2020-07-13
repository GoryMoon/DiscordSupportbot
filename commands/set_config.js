import { getChannelFromMention } from '../util.js'

export const name = 'set_config';
export const description = 'Sets channel where you are able to configure the bot. Use no arguments to clear this.';
export const usage = '[channel]';
export const aliases = ['sc']
export function execute(message, args) {
    const { client } = message;
    let channel = getChannelFromMention(client, args[0]);
    if (args[0] && !channel) {
        return message.reply('Invalid channel mention!')
    }
    
    client.settings.set(message.guild.id, !args[0] ? 0: channel.id, 'configChannel');
    if (!args[0]) {
        return message.reply("Cleared bot configure channel");
    }
    message.reply(`Bot configure channel set to ${channel}`);
}

