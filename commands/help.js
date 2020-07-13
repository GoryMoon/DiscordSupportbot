export const name = 'help';
export const description = 'List all commands or info about a specific command.';
export const usage = '[command name]';
export function execute(message, args) {
    const data = [];
    const { commands } = message.client;
    const prefix = message.client.settings.get(message.guild.id, "prefix");

    if (!args.length) {
        data.push('Here\'s a list of all commands:');
        data.push(`${commands.map(command => `> ${command.name} ${command.aliases ? `(${command.aliases.join(', ')})`: ''}`).join('\n')}`);
        data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
        return message.channel.send(data, { split: true });
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));;

    if (!command) {
        return message.reply('That\'s not a valid command!');
    }
    data.push(`**Name:** ${command.name}`);
    if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
    if (command.description) data.push(`**Description:** ${command.description}`);
    if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
    message.channel.send(data, { split: true });
}