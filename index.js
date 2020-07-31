import 'dotenv/config.js';

import fs from 'fs'
import { Client, Collection, Permissions } from 'discord.js';
import Enmap from 'enmap';
import _includes from 'lodash.includes'
import _random from 'lodash.random'
import _indexOf from 'lodash.indexof'
import _takeRight from 'lodash.takeright'


import chalk from 'chalk';
import moment from 'moment';
import winston from 'winston';
const { format, transports } = winston;

const displayStack = winston.format((info) => {
    info.message += info.stack ? `\n${info.stack}` : ""
    return info
})

const logger = winston.createLogger({
    transports: [
        new transports.Console({
            format: format.combine(
                displayStack(),
                format.printf(log => `[${chalk.gray(moment().format("YYYY/MM/DD HH:mm:ss"))}][${colorLog(log.level)}] - ${log.message}`)
            )
        }),
        new transports.File({
            maxsize: 2000000,
            maxFiles: 5,
            tailable: true,
            filename: 'log',
            format: format.combine(
                displayStack(),
                format.printf(log => `[${moment().format("YYYY/MM/DD HH:mm:ss")}][${log.level.toUpperCase()}] - ${log.message}`)
            )
        }),
    ],
});
function colorLog(level) {
    var l = level.toUpperCase();
    if (l == "INFO") {
        return chalk.blueBright(l);
    } else if (l == "ERROR") {
        return chalk.red(l);
    } else if (l == "WARN") {
        return chalk.yellow(l);
    } else {
        return chalk.white(l);
    }
}
const defaultSettings = {
    prefix: ".",
    messages: [],
    channels: [],
    configChannel: 0,
    lastMessages: []
}

const client = new Client();
client.commands = new Collection();
client.settings = new Enmap({
    name: "settings",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});

// Commands 
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith(".js"));
const promises = []
for (const file of commandFiles) {
    promises.push(import(`./commands/${file}`)
        .then(m => {
            client.commands.set(m.name, m)
        }));
}
Promise.all(promises).then(() => {
    client.commands.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
});

// Logging events
client.on('ready', () => logger.info(`Logged in as ${client.user.tag}!`));
client.on('debug', m => logger.debug(m));
client.on('warn', m => logger.warn(m));
client.on('error', m => logger.error(m));
client.on('shardReconnecting', (id) => logger.info(`Shard with ID ${id} reconnected.`));

client.on('guildCreate', (guild) => logger.info(`Joined guild ${guild}`));
client.on('guildDelete', (guild) => {
    logger.info(`Left guild ${guild}`)
    client.settings.delete(guild.id)
});


// Message event
client.on('message', msg => {
    if (!msg.guild || msg.author.bot) return;

    const guildConf = client.settings.ensure(msg.guild.id, defaultSettings);

    // Commands channel
    if ((msg.channel.id === guildConf.configChannel || guildConf.configChannel === 0) && msg.content.indexOf(guildConf.prefix) === 0) {
        if (!msg.member.permissions.any(Permissions.FLAGS.ADMINISTRATOR)) return;

        const args = msg.content.slice(guildConf.prefix.length).split(/\s+/g);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.aliases && _includes(cmd.aliases, commandName));

        if (!command) return;

        if (command.args && command.args > args.length) {
            let reply = `You didn't provide any arguments, ${msg.author}!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${guildConf.prefix}${command.name} ${command.usage}\``;
            }

            return msg.channel.send(reply);
        }

        try {
            command.execute(msg, args, logger);
        } catch (error) {
            logger.error("Error executing command", error)
            msg.reply("There was an error trying to execute that command!");
        }
        return;
    }

    // Any other message in channel
    if (_includes(guildConf.channels, msg.channel.id) && guildConf.messages.length > 0) {
        let num = -1;
        do {
            num = _random(guildConf.messages.length - 1);
        } while(_indexOf(guildConf.lastMessages, num) != -1 && guildConf.messages.length > 1)
        
        if (guildConf.lastMessages == undefined) {
            guildConf.lastMessages = [];
        }
        guildConf.lastMessages.push(num);
        client.settings.set(msg.guild.id, _takeRight(guildConf.lastMessages, Math.ceil(guildConf.messages.length * 0.3)), "lastMessages")

        msg.channel.send(guildConf.messages[num]);
    }
    
});

client.login(process.env.TOKEN);