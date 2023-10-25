export const name = 'list_channels';
export const description = 'List all channels that are monitored';
export const aliases = ['lc']
export function execute(message) {
    const { client } = message;
    
    let channels = client.settings.get(message.guild.id, "channels")
    if (!channels.length) {
        return message.reply('Not monitoring any channels.')
    }
    
    return message.channel.send(`Monitored channels:\n${channels.map(channel => `> ${client.channels.cache.get(channel)}`).join('\n')}`, { split: true });
}