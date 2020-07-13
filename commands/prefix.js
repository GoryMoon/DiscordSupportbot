export const name = 'prefix';
export const description = 'Sets the prefix used by the bot.';
export const args = 1;
export const usage = '<new_prefix>';
export function execute(message, args, logger) {
    message.client.settings.set(message.guild.id, args[0], "prefix");
    message.reply(`Prefix set to '${args[0]}'`);
}