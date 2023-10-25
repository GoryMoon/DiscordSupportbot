export const name = 'list_messages';
export const description = 'List all messages that can be used as respones';
export const aliases = ['lm']
export function execute(message) {
    const { client } = message;
    
    let messages = client.settings.get(message.guild.id, "messages")
    if (!messages.length) {
        return message.reply('No messages stored.')
    }
    
    let index = 0;
    return message.channel.send(`Messages:\n${messages.map(message => `> **${index++}**: ${message}`).join('\n')}`, { split: true });
}