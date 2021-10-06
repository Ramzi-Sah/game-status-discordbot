const Common = require('../common/common.js');
const Log = require('../common/log.js');
const DBManager = require('../common/DBManager.js');

const {Client} = require('discord.js');
const fs = require('fs');
const http = require('http');
const fetch = require('node-fetch');

class Bot {
    constructor() {};

    static config;
    static db;
    static client;
    static isReady;
    static guildManager;
    static timezones =  [
        [-12, 0] ,[-11, 0] ,[-10, 0] ,[-9, 30] ,[-9, 0] ,[-8, 0] ,[-7, 0] ,[-6, 0] ,[-5, 0] ,[-4, 0] ,[-3, 30] ,[-3, 0] ,[-2, 0] ,[-1, 0] ,[0, 0],
        [1, 0] ,[2, 0] ,[3, 0] ,[3, 30] ,[4, 0] ,[4, 30] ,[5, 0] ,[5, 30] ,[5, 45] ,[6, 0] ,[6, 30] ,[7, 0] ,[8, 0] ,[8, 45] ,[9, 0] ,[9, 30] ,[10, 0] ,[10, 30] ,[11, 0] ,[12, 0] ,[12, 45] ,[13, 0] ,[14, 0]
    ];
    static translations = [];

    static init(GuildManager) {
        // set state
        Bot.isReady = false;

        // get translations
        Bot.translations = {
            "DE" : JSON.parse(fs.readFileSync(__dirname + '/translations/DE.json', {encoding:'utf8', flag:'r'})),
            "EN" : JSON.parse(fs.readFileSync(__dirname + '/translations/EN.json', {encoding:'utf8', flag:'r'})),
            "ES" : JSON.parse(fs.readFileSync(__dirname + '/translations/ES.json', {encoding:'utf8', flag:'r'})),
            "FR" : JSON.parse(fs.readFileSync(__dirname + '/translations/FR.json', {encoding:'utf8', flag:'r'})),
            "IT" : JSON.parse(fs.readFileSync(__dirname + '/translations/IT.json', {encoding:'utf8', flag:'r'})),
			"PL" : JSON.parse(fs.readFileSync(__dirname + '/translations/PL.json', {encoding:'utf8', flag:'r'})),
            "RU" : JSON.parse(fs.readFileSync(__dirname + '/translations/RU.json', {encoding:'utf8', flag:'r'})),
            "SW" : JSON.parse(fs.readFileSync(__dirname + '/translations/SW.json', {encoding:'utf8', flag:'r'}))
        };

        // set guildManager
        Bot.guildManager = GuildManager;

        // set config
        Bot.config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8'));

        // init data-base handler
        Bot.db = new DBManager(
            Bot.config["db_hostname"],
            Bot.config["db_port"],
            Bot.config["db_name"],
            Bot.config["db_Username"],
            Bot.config["db_Password"]
        );

        // create client and login
        // discord.js messageEditHistoryMaxSize option causes mem leak by default set to -1 and this is mentioned nowhere
        Bot.client = new Client(
            {
                messageEditHistoryMaxSize: 0,
                presence: {
                    status: 'online',
                    activity: {
                      type: 'WATCHING',
                      name: "gamestatus.xyz"
                    }
                }
            }
        );

        Bot.client.login(Bot.config["discordBotToken"]).catch(function(error) {
            Log.print("error connecting to discord, retrying...", 2, "Bot Client");
            Log.printError(error);

            // sould retry
            Bot.init(Bot.config, Bot.guildManager);
        });

        // handle client events
        Bot.handleEvents();

        // start shard api
        Bot.apiInit();
    };

    static handleEvents() {
        // on redy event
        Bot.client.on('ready', async() => {
            // get shard guilds
            let guilds = [];
            Bot.client.guilds.cache.each(guild => {
                guilds.push(guild.id);
				
            });
			
			
			// couldn't do it on the previous loop :(
			for (let i = 0; i < guilds.length; i++) {
				// add to guild manager
                Bot.guildManager.addGuild(guilds[i]);
				
				// shouldn't spamm discord's API
				await Common.sleep(1000);	
			};
			

            Log.print("Logged in as " + Bot.client.user.tag + " Shard " + (Bot.client.shard.ids[0] + 1) + " handles " + guilds.length + " guild.", 0, "Bot Client");

            let db = Bot.db;

            // check guild exists on db
            Bot.db.getGuilds(function (error, results) {
                if (error) return;

                // check if all guilds are registred on db
                for (let i = 0; i < guilds.length; i++) {
                    let isRegistred = false;
                    for (let j = 0; j < results.length; j++) {
                        if (results[j].guild_id == guilds[i]) {
                            isRegistred = true;
                            break;
                        };
                    };

                    if (!isRegistred) {
                        // guild is not registred on db then create it
                        Log.print("Joined a new guild (" + guilds[i] + ") while bot was offline.");
                        db.insertGuild(guilds[i]);
                    };
                };
            });

            // set isReady
            Bot.isReady = true;

            // send is ready signal to shard manager
            let postData = {
                shardId : (Bot.client.shard.ids[0] + 1)
            };
            fetch(
                "http://localhost:" + Bot.config["APIPort"] + "/shard/ready",
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        });

        // on join new guild
        Bot.client.on("guildCreate", guild => {
            Log.print("Joined a new guild: " + guild.name + " (" + guild.id + "), assigned to Shard " + (Bot.client.shard.ids[0] + 1));

            // insert new guild to db
            Bot.db.insertGuild(guild.id);

            // add to guild manager
            Bot.guildManager.addGuild(guild.id);
        });

        // on quit guild
        Bot.client.on("guildDelete", guild => {
            Log.print("kicked from guild: " + guild.name + " (" + guild.id + ").");

            // delete guild from db
            Bot.db.deleteGuild(guild.id);

            // remove from guild manager
            Bot.guildManager.removeGuild(guild.id);
        });

        // on message event
        Bot.client.on('message', message => {
            try {
                // check if message is from a bot
                if (message.author.bot) return;

                // check if message is a dm
                if (message.guild === null) {
                    message.reply('i don\'t respond to strangers.').catch(function(err) {
                        Log.print("could not replay to direct message.", 1);
                        Log.printError(err);
                    });
                    return;
                };

                // check for command
                if (message.content.substring(0, Bot.config["botPerfix"].length) === Bot.config["botPerfix"]) {
                    const [command, ...args] = message.content
                        .trim()
                        .substring(Bot.config["botPerfix"].length)
                        .split(/\s+/);
            
                    if (command === "") {
                        return;
                    };

                    // Log.print("[" + message.author.tag + "] " + " command: (" + command + ") with args [" + args + "]");
                };

                // Log.print("[" + message.author.tag + "] " + message.content);
            } catch (err) {
                Log.print("something went wrong.", 2, "message event");
                Log.printError(err);
            };
        });

        Bot.client.on('raw', packet => {
            if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

            // do not respond to won messages
            if (packet.d.user_id == Bot.client.user.id) return;
            
            // get message channel
            let channel = Bot.client.channels.cache.get(packet.d.channel_id);
            
            // fetch all messages
            channel.messages.fetch(packet.d.message_id).then(message => {
                // check message is from bot
                if (message.author.id != Bot.client.user.id) return;

                // update status message
                Bot.guildManager.updateInstanceStatusMessage(message.guild, message.id);
            }).catch(function(error) {});
        });
    };

    // ---------------------------------------------------------------------------------------------
    static getGuilds() {
        try {
            let i = 0;
            let guilds = "[";
            Bot.client.guilds.cache.each(guild => {
                if (i != 0) guilds += ",";
                guilds += "\"" + guild.id + "\"";
                i++;
            });
            guilds += "]";

            return guilds;
        } catch (error) {
            Log.print("could not get guilds for shard (" + (Bot.client.shard.ids[0] + 1) + ").");
            Log.printError(error);

            return "[]";
        };
    };

    static getChannels(guildId) {
        try {
            let guild = Bot.client.guilds.cache.get(guildId);
            let channels = guild.channels.cache.filter(chx => (chx.type === "text" || chx.type === "news"));
            
            let i = 0;
            let response = "{ \"error\": \"\", \"channels\": [";
            channels.each(channel => {
                if (i != 0) response += ", ";
                response += "{\"id\" : \"" + channel.id + "\", \"name\" : \"" + channel.name + "\"}";
                i++;
            });
            response += "]}";

            return response;
        } catch (error) {
            Log.print("could not get channels for guild (" + guildId + ").");
            Log.printError(error);

            return "{ \"error\":\"could not get channels for the guild.\", \"channels\":\"\"}";
        };
    };

    // ---------------------------------------------------------------------------------------------
    static createNewInstance(guildId, instanceName) {
        // get guild
        let guild = Bot.guildManager.getGuild(guildId);

        // check if shard manages this guild
        if (guild == null) return;

        // generate random instance id
        let instanceId = Common.generateID();

        // register instance on db
        Bot.db.createInstance(guildId, instanceId, instanceName);

        // create instance
        Bot.guildManager.addInstance(guild, instanceId, instanceName);
    };

    static deleteInstance(guildId, instanceId) {
        // get guild
        let guild = Bot.guildManager.getGuild(guildId);

        // check if shard manages this guild
        if (guild == null) return;

        // delete instance from db
        Bot.db.deleteInstance(guildId, instanceId);

        // create instance
        Bot.guildManager.removeInstance(guild, guildId, instanceId);
    };


    // -----------------------------message edited.----------------------------------------------------------------
    static editInstance(
        guildId,
        instanceId,
        name,
        channel,
        host,
        port,
        game,

        graph,
        hide_ip,
        hide_port,
        logo,
        language,
        playerlist,
        full_playerlist,
        timezone,
        timeformat,
        minimal,
        color
    ) {
        // get guild
        let guild = Bot.guildManager.getGuild(guildId);

        // check if shard manages this guild
        if (guild == null) return;

        // get instance
        let instance = guild.getInstance(instanceId);

        // edit instance name on db
        Bot.db.setInstanceName(instanceId, name);
        // edit instance name
        instance.name = name;

        // check if same channel
        if (instance.channel != channel) {
            // edit instance channel on db
            Bot.db.setInstanceChannel(instanceId, channel);

            // delete old messages on old channel
            if (instance.channel != undefined) Bot.clearMessages(instance.channel, 0, function(error) {});

            // set channel
            instance.channel = channel;

            // restart the instance
            if (instance.started) instance.restart();
        };

        // edit instance host on db
        Bot.db.setInstanceHost(instanceId, host);
        // edit instance host
        instance.host = host;

        // edit instance port on db
        Bot.db.setInstancePort(instanceId, port);
        // edit instance port
        instance.port = port;

        // edit instance game on db
        Bot.db.setInstancegame(instanceId, game);
        // edit instance game
        instance.game = game;

        // edit instance graph on db
        Bot.db.setInstanceGraph(instanceId, graph);
        // edit instance graph
        instance.graph = parseInt(graph);
		
        // edit instance hide_ip on db
        Bot.db.setInstanceHideIP(instanceId, hide_ip);
        // edit instance hide_ip
        instance.hide_ip = parseInt(hide_ip);
		
        // edit instance hide_port on db
        Bot.db.setInstanceHidePort(instanceId, hide_port);
        // edit instance hide_port
        instance.hide_port = parseInt(hide_port);

        // edit instance playerlist on db
        Bot.db.setInstancePlayerlist(instanceId, playerlist);
        // edit instance playerlist
        instance.playerlist = parseInt(playerlist);
		
        // edit instance full_playerlist on db
        Bot.db.setInstanceFullPlayerlist(instanceId, full_playerlist);
        // edit instance full_playerlist
        instance.full_playerlist = parseInt(full_playerlist);

        // edit instance language on db
        Bot.db.setInstanceLogo(instanceId, logo);
        // edit instance timezone
        instance.logo = logo;

        // edit instance language on db
        Bot.db.setInstanceLanguage(instanceId, language);
        // edit instance timezone
        instance.language = language;

        // edit instance timezone on db
        Bot.db.setInstanceTimezone(instanceId, timezone);
        // edit instance timezone
        instance.timezone = parseInt(timezone);

        // edit instance timeformat on db
        Bot.db.setInstanceTimeformat(instanceId, timeformat);
        // edit instance timeformat
        instance.timeformat = parseInt(timeformat);

        // edit instance minimal on db
        Bot.db.setInstanceMinimal(instanceId, minimal);
        // edit instance minimal
        instance.minimal = parseInt(minimal);

        // edit instance color on db
        Bot.db.setInstanceColor(instanceId, color);
        // edit instance minimal
        instance.color = color;
    };

    // ---------------------------------------------------------------------------------------------
    static startInstance(guildId, instanceId) {
        // get guild
        let guild = Bot.guildManager.getGuild(guildId);

        // check if shard manages this guild
        if (guild == null) return;

        // start instance
        guild.getInstance(instanceId).start();
    };
    static stopInstance(guildId, instanceId) {
        // get guild
        let guild = Bot.guildManager.getGuild(guildId);

        // check if shard manages this guild
        if (guild == null) return;

        // stop instance
        guild.getInstance(instanceId).stop();
    };
    static restartInstance(guildId, instanceId) {
        // get guild
        let guild = Bot.guildManager.getGuild(guildId);

        // check if shard manages this guild
        if (guild == null) return;

        // edit instance started on db
        Bot.db.setInstanceStarted(instanceId, true);
        
        // restart instance game
        guild.getInstance(instanceId).restart();
    };

    static clearGraphInstance(guildId, instanceId) {
        // get guild
        let guild = Bot.guildManager.getGuild(guildId);

        // check if shard manages this guild
        if (guild == null) return;

        guild.getInstance(instanceId).graphData.clear();
    };

    static HandleUpVoteMessage(user, points, allPoints) {
        // Log.print("user " + user + " just voted.", 0, "API");
        try {
            // send message to upvote channel
            Bot.sendMessage(Bot.config["upvotesChannel"], "this guy <@" + user + "> is amazing he just voted on the bot, here +" + points + " points for you, you have now " + allPoints + " points.", function (error) {});
        } catch(error) {};
    };

    static HandleDonationMessage(user, points_amount, user_points, payment_amount) {
        // Log.print("user " + user + " just donated.", 0, "API");
        try {
            // send message to upvote channel
            // Bot.sendMessage(Bot.config["upvotesChannel"], "this guy <@" + user + "> is amazing he just donated something for the bot, here +" + points_amount + " points for you, you have now " + user_points + " points.", function (error) {});
            
            // send message to donation channel
            Bot.sendMessage(Bot.config["donationChannel"], "this guy <@" + user + "> just donated ||" + payment_amount + "$|| for the bot, here +" + points_amount + " points for you, you have now " + user_points + " points, thank you a lot!", function (error) {});
        } catch(error) {};
    };

    // ---------------------------------------------------------------------------------------------
    static sendMessage(channelId, msg, callback) {
        try {
            return Bot.client.channels.cache.get(channelId).send(msg).then(message => {
                return callback(null, message);
            }).catch(function(error) {
                // Log.print("Could not send message on channel (" + channelId + ").", 2, "Bot Client");
                // Log.printError(error);
                return callback(error);
            });
        } catch(error) {
            return callback(error);
        };
    };
    
    static clearMessages(channelId, nbr, callback) {
        try {
            // get messeges
            return Bot.client.channels.cache.get(channelId).messages.fetch({limit: 99}).then(messages => {
                // select bot messages
                messages = messages.filter(msg => (msg.author.id == Bot.client.user.id && !msg.system && !Bot.guildManager.checkIsUsed(msg.guild.id, msg)));

                // keep track of all promises
                var promises = [];

                // delete messages
                let i = 0;
                messages.each(mesasge => {
                    // let nbr last messages
                    if (i >= nbr) {
                        // push to promises
                        promises.push(
                            mesasge.delete().catch(function(error) {
                                // Log.print("Could not delete message " + mesasge.id + " on channel (" + channelId + ").", 1, "Bot Client");
                                // Log.printError(error);
                                return callback(error);
                            })
                        );
                    };
                    i += 1;
                });
                
                // return when all promises are done
                return Promise.all(promises).then(() => {
                    return callback(null);
                });

            }).catch(function(error) {
                // Log.print("Could not clear messages on channel (" + channelId + ").", 1, "Bot Client");
                // Log.printError(error);
                return callback(error);
            });
        } catch(error) {
            return callback(error);
        };
    };

    static getLastMessage(channelId, nbr, callback) {
        try {
            return Bot.client.channels.cache.get(channelId).messages.fetch({limit: 25}).then(messages => {
                // select bot messages
                messages = messages.filter(msg => (msg.author.id == Bot.client.user.id && !msg.system && !Bot.guildManager.checkIsUsed(msg.guild.id, msg)));

                let statusMessage;
                let graphMessage;
                let i = 0;
                messages.each(mesasge => {
                    if (nbr == 1) {
                        statusMessage = mesasge;
                    } else {
                        if (i == 0) graphMessage = mesasge;
                        if (i == 1) statusMessage = mesasge;
                    }
                    i += 1;
                });

                return callback(null, statusMessage, graphMessage);

            }).catch(function(error) {
                // Log.print("Could not get messages on channel (" + channelId + ").", 1, "Bot Client");
                // Log.printError(error);
                return callback(error);
            });
        } catch(error) {
            return callback(error);
        };
    };

    static editMessage(mesasge, data, callback) {
        return mesasge.edit(data).then(() => {
            // return null error
            return callback(null);
        }).catch(function(error) {
            // discord api reporting spam
            if (
                error == "AbortError: The user aborted a request." || 
                error == "Response: Internal Server Error" ||
                error == "Response: Service Unavailable" ||
                error.toString().split(" ")[0] == "FetchError:"
            ) {
                // these errors are safe
                return callback(null);
            };

            // Log.print("Could not edit message (" + mesasge.id + ").", 1, "Bot Client");
            // Log.printError(error);

            return callback(error);
        });
    };

    // ---------------------------------------------------------------------------------------------
    static apiInit() {
        let shardAPIport = Bot.config["APIPort"] + (Bot.client.shard.ids[0] + 1);
        // init web server
        const server = http.createServer((request, response) => {
            if (request.method === 'POST') {
                let chunks = [];
                request.on('data', function (chunk) {
                    chunks.push(chunk);
                });

                request.on('end', function() {
                    // read chunks
                    try {
                        var data = JSON.parse(chunks.toString());
                    } catch (error) {
                        Log.print("recieaved wierd data format", 2, "API");

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end('not ok.');
                    };

                    // do not respond if bot not ready
                    if (!Bot.isReady)  {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end('not ready yet to handle the request.');
                    };

                    if (request.url === '/instance/create') {
                        Bot.createNewInstance(data.guild, data.instance_name);
                    } else if (request.url === '/instance/delete') {
                        Bot.deleteInstance(data.guild, data.instance_id);
                    } else if (request.url === '/instance/edit') {
                        Bot.editInstance(
                            data.guild,
                            data.instance,
                            data.name,
                            data.channel,
                            data.host,
                            data.port,
                            data.game,

                            data.graph,
                            data.hide_ip,
                            data.hide_port,
                            data.logo,
                            data.language,
                            data.playerlist,
                            data.full_playerlist,
                            data.timezone,
                            data.timeformat,
                            data.minimal,
                            data.color
                        );
                    };

                    if (request.url === '/shard/getGuilds') {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end(Bot.getGuilds());
                    } else if (request.url === '/guild/getChannels') {
                        // get guild
                        let guild = Bot.guildManager.getGuild(data.guildId);

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');

                        // check if shard manages this guild
                        if (guild == null) {
                            return response.end('{ \"error\": \"shard does not support this guild.\", \"channels\": []}');
                        };

                        return response.end(Bot.getChannels(data.guildId));
                    };

                    if (request.url === '/instance/start') {
                        Bot.startInstance(data.guild, data.instance_id);
                    } else if (request.url === '/instance/stop') {
                        Bot.stopInstance(data.guild, data.instance_id);
                    } else if (request.url === '/instance/restart') {
                        Bot.restartInstance(data.guild, data.instance_id);
                    } else if (request.url === '/instance/clearGraph') {
                        Bot.clearGraphInstance(data.guild, data.instance_id);
                    };

                    if (request.url === '/webhook/vote') {
                        Bot.HandleUpVoteMessage(data.user, data.points, data.allPoints);
                    } else if (request.url === '/webhook/donation') {
                        Bot.HandleDonationMessage(data.user, data.points_amount, data.user_points, data.payment_amount);
                    };

                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'text/plain');
                    return response.end('is ok.');
                });
            };
        });

        // start web server
        server.listen(shardAPIport, function () {
            Log.print('started shard ' + (Bot.client.shard.ids[0] + 1) + ' api listning on port ' + shardAPIport, 0, "shard API");
        }).on('error', function (error) {
            Log.print("shard " + (Bot.client.shard.ids[0] + 1) + " api port (" + shardAPIport + ") alredy in use.", 2);
            Log.printError(error);

            process.exit(1);
        });
    };
};

module.exports = Bot;