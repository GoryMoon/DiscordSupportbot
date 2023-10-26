import 'dotenv/config.js';

import fs from 'fs'
import { Client, Events, Collection, GatewayIntentBits, PermissionsBitField } from 'discord.js';
import Enmap from 'enmap';
import _includes from 'lodash.includes'
import _random from 'lodash.random'
import { getRandomMessage } from './util.js'

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
    lastMessages: [],
    specialMessages: [],
}

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]});
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
client.once(Events.ClientReady, c => logger.info(`Logged in as ${c.user.tag}!`));
client.on(Events.Debug, m => logger.debug(m));
client.on(Events.Warn, m => logger.warn(m));
client.on(Events.Error, m => logger.error(m));
client.on(Events.ShardReconnecting, (id) => logger.info(`Shard with ID ${id} reconnected.`));

client.on(Events.GuildCreate, (guild) => logger.info(`Joined guild ${guild}`));
client.on(Events.GuildDelete, (guild) => {
    logger.info(`Left guild ${guild}`)
    client.settings.delete(guild.id)
});

// Argument parser
const argRegex = new RegExp('"[^"]+"|[\\S]+', 'g');

// Message event
client.on(Events.MessageCreate, async msg => {
    if (!msg.guild || msg.author.bot) return;

    const guildConf = client.settings.ensure(msg.guild.id, defaultSettings);

    if (guildConf.specialMessages == undefined) {
        guildConf.specialMessages = [];
        client.settings.set(msg.guild.id, guildConf.specialMessages, "specialMessages");
    }

    // Commands channel
    if ((msg.channel.id === guildConf.configChannel || guildConf.configChannel === 0) && msg.content.indexOf(guildConf.prefix) === 0) {
        if (!msg.member.permissions.any(PermissionsBitField.Flags.Administrator)) return;
        await msg.channel.sendTyping();

        const args = [];
        msg.content
            .slice(guildConf.prefix.length)
            .match(argRegex)
            .forEach(element => {
                if (!element) return;
                return args.push(element.replace(/"/g, ''));
            });

        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.aliases && _includes(cmd.aliases, commandName));

        if (!command) return;

        if (command.args && command.args > args.length) {
            let reply = `You didn't provide any arguments!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${guildConf.prefix}${command.name} ${command.usage}\``;
            }

            return await msg.reply(reply);
        }

        try {
            await command.execute(msg, args, logger);
        } catch (error) {
            logger.error("Error executing command", error)
            msg.reply("There was an error trying to execute that command!");
        }
        return;
    }

    // Any other message in channel
    if (_includes(guildConf.channels, msg.channel.id) && guildConf.messages.length > 0) {
        let message = checkSpecial(guildConf, msg);
        if (message === null) {
            message = getRandomMessage(client, msg.guild.id);
        }
        await msg.channel.send(message);
    }
    
});

function checkSpecial(conf, msg) {
    let messagePool = [];
    for (let i = 0; i < conf.specialMessages.length; i++) {
        const message = conf.specialMessages[i];
        if(msg.content.toLowerCase().indexOf(message.word) !== -1) {
            var not = message.role.startsWith('!');
            var role = not ? message.role.substring(1): message.role;
            var hasRole = msg.member.roles.cache.some(r => r.name === role);
            if (not ? !hasRole: hasRole) {
                messagePool = messagePool.concat(message.messages)   
            }
        }
    }
    if (messagePool.length > 0) {
        let num = _random(messagePool.length - 1);
        return messagePool[num];
    }
    return null;
}

client.login(process.env.TOKEN);