const Log = require('./common/log.js');
const DBManager = require('./common/DBManager.js');

const fs = require('fs');
const fetch = require('node-fetch');
const { resolve } = require('path');

class ShardManager {
    constructor() {};

    static isReady = false;
    static config;
    static db;
    static manager;
    static nbrLaunchedShards = 0;

    static start() {
        // get config file
        ShardManager.config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

        // init data-base handler
        ShardManager.db = new DBManager(
            ShardManager.config["db_hostname"],
            ShardManager.config["db_port"],
            ShardManager.config["db_name"],
            ShardManager.config["db_Username"],
            ShardManager.config["db_Password"]
        );

        // init ShardingManager
        const { ShardingManager } = require('discord.js');
        ShardManager.manager = new ShardingManager('./src/bot/shards.js', {
            totalShards: ShardManager.config["nbrShards"],
            token: ShardManager.config["discordBotToken"],
            respawn: true
        });

        // attach listners
        ShardManager.manager.on('message', (shard, message) => {
            Log.print(`message from Shard[${shard.id}] : ${message._eval} : ${message._result}`, 0, "Shard Manager");
        });

        ShardManager.manager.on('shardCreate', shard => {
            // console.log(`Launched shard ${shard.id}`);

            shard.on('ready', () => {});
            shard.on('disconnect', (a, b) => {
                console.log('Shard disconnected')
                // console.log(a)
                // console.log(b)
            });
            shard.on('reconnecting', (a, b) => {
                console.log('Shard reconnecting')
                // console.log(a)
                // console.log(b)
            });
            shard.on('death', (a, b) => {
                console.log('Shard died')
                // console.log(a)
                // console.log(b)
            });
            shard.on('error', (a, b) => {
                console.log('Shard error')
                // console.log(a)
                // console.log(b)
            });

        });

        // spawn shards
        ShardManager.manager.spawn();
    };

    // called after all shards are ready
    static setUp() {
        // get all guilds
        ShardManager.getGuilds().then(shardsGuilds => {
            let guilds = [];

            for (let i = 0; i < shardsGuilds.length; i++)
                for (let j = 0; j < shardsGuilds[i].length; j++)
                    guilds.push(shardsGuilds[i][j]);

            let db = ShardManager.db;

            // check guild exists on db
            ShardManager.db.getGuilds(function (error, results) {
                if (error) return;

                // check on db for obsolete guilds
                for (let j = 0; j < results.length; j++) {
                    let exists = false;
                    for (let i = 0; i < guilds.length; i++) {
                        if (results[j].guild_id == guilds[i]) {
                            exists = true;
                            break;
                        };
                    };

                    // remove deleted guilds
                    // FIXME: removed very dangerous method.
                    if (!exists) {
                        Log.print("kicked from guild (" + results[j].guild_id + ") while bot was offline.");
                        db.deleteGuild(results[j].guild_id);
                    };
                };
            });

            // set isready flag for the api and bot status
            ShardManager.isReady = true;
            Log.print("ALL SHARDS ARE READY, BOT IS UP ----------------", 0, "Shard Manager");
        }).catch((error) => {
            Log.print("an unknown error hapened on setup.", 2, "Shard Manager");
            Log.printError(error);
        });

    };

    //-----------------------------------------------------------------------------------------------
    static getGuilds() {
        // reroote to all shards
        let postData = {};

        let urls = [];
        for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
            let shardAPIPort = ShardManager.config["APIPort"] + i;
            urls.push("http://localhost:" + shardAPIPort + "/shard/getGuilds");
        };

        return Promise.all(
            urls.map(url =>
                fetch(
                    url,
                    {
                        method: 'POST',
                        body: JSON.stringify(postData),
                        headers: { 'Content-Type': 'application/json' }
                    }
                ).catch((error) => {})
            )
        ).then(responses => {
            let promises = [];
            for (let i = 0; i < responses.length; i++) {
                if (responses[i] != undefined) promises.push(
                    responses[i].json().catch((error) => {})
                );
            };

            return Promise.all(promises);

            // return Promise.all(responses.map(res => res.json().catch((error) => {})));
        });
    };

    static getChannels(guild) {
        // reroote to all shards
        let postData = {
            guildId : guild
        };

        let urls = [];
        for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
            let shardAPIPort = ShardManager.config["APIPort"] + i;
            urls.push("http://localhost:" + shardAPIPort + "/guild/getChannels");
        };

        return Promise.all(
            urls.map(url =>
                fetch(
                    url,
                    {
                        method: 'POST',
                        body: JSON.stringify(postData),
                        headers: { 'Content-Type': 'application/json' }
                    }
                ).catch((error) => {})
            )
        ).then(responses => {
            let promises = [];
            for (let i = 0; i < responses.length; i++) {
                if (responses[i] != undefined) promises.push(
                    responses[i].json().catch((error) => {})
                );
            };

            return Promise.all(promises);
        });
    };

    //-----------------------------------------------------------------------------------------------
    static createNewInstance(guild, instance_name) {
        // reroote to all shards
        let postData = {
            guild : guild,
            instance_name : instance_name
        };
        for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
            let shardAPIPort = ShardManager.config["APIPort"] + i;
            fetch(
                "http://localhost:" + shardAPIPort + "/instance/create",
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: { 'Content-Type': 'application/json' }
                }
            ).catch((error) => {});
        };
    };
    static deleteInstance(guild, instance_id) {
        // reroote to all shards
        let postData = {
            guild : guild,
            instance_id : instance_id
        };
        for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
            let shardAPIPort = ShardManager.config["APIPort"] + i;
            fetch(
                "http://localhost:" + shardAPIPort + "/instance/delete",
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: { 'Content-Type': 'application/json' }
                }
            ).catch((error) => {});
        };
    };

    static editInstance(
        guild,
        instance,

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
        // reroote to all shards
        let postData = {
            guild : guild,
            instance : instance,

            name : name,
            channel : channel,
            host : host,
            port : port,
            game : game,

            graph : graph,
            hide_ip : hide_ip,
            hide_port : hide_port,
            logo : logo,
            language : language,
            playerlist : playerlist,
            full_playerlist : full_playerlist,
            timezone : timezone,
            timeformat : timeformat,
            minimal : minimal,
            color : color,
        };
        for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
            let shardAPIPort = ShardManager.config["APIPort"] + i;
            fetch(
                "http://localhost:" + shardAPIPort + "/instance/edit",
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: { 'Content-Type': 'application/json' }
                }
            ).catch((error) => {});
        };
    };

    static startInstance(guild, instance_id) {
        // reroote to all shards
        let postData = {
            guild : guild,
            instance_id : instance_id
        };
        for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
            let shardAPIPort = ShardManager.config["APIPort"] + i;
            fetch(
                "http://localhost:" + shardAPIPort + "/instance/start",
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: { 'Content-Type': 'application/json' }
                }
            ).catch((error) => {});
        };
    };
    static stopInstance(guild, instance_id) {
        // reroote to all shards
        let postData = {
            guild : guild,
            instance_id : instance_id
        };
        for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
            let shardAPIPort = ShardManager.config["APIPort"] + i;
            fetch(
                "http://localhost:" + shardAPIPort + "/instance/stop",
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: { 'Content-Type': 'application/json' }
                }
            ).catch((error) => {});
        };
    };
    static restartInstance(guild, instance_id) {
        // reroote to all shards
        let postData = {
            guild : guild,
            instance_id : instance_id
        };

        for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
            let shardAPIPort = ShardManager.config["APIPort"] + i;
            fetch(
                "http://localhost:" + shardAPIPort + "/instance/restart",
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: { 'Content-Type': 'application/json' }
                }
            ).catch((error) => {});
        };
    };

    static clearGraphInstance(guild, instance_id) {
        // reroote to all shards
        let postData = {
            guild : guild,
            instance_id : instance_id
        };
        for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
            let shardAPIPort = ShardManager.config["APIPort"] + i;
            fetch(
                "http://localhost:" + shardAPIPort + "/instance/clearGraph",
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: { 'Content-Type': 'application/json' }
                }
            ).catch((error) => {});
        };
    };

    //-----------------------------------------------------------------------------------------------
    static HandleUpVote(bot, user, type, query, isWeekend) {
        let points = 1;

        // add points
        ShardManager.db.addPoints(user, points, function(error, allPoints) {
            if (error) return;

            // ask shards to send message
            let postData = {
                user : user,
                points : points,
                allPoints : allPoints
            };
            for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
                let shardAPIPort = ShardManager.config["APIPort"] + i;
                fetch(
                    "http://localhost:" + shardAPIPort + "/webhook/vote",
                    {
                        method: 'POST',
                        body: JSON.stringify(postData),
                        headers: { 'Content-Type': 'application/json' }
                    }
                ).catch((error) => {});
            };
        });
    };

    //-----------------------------------------------------------------------------------------------
    static HandleDonation(user, points_amount, user_points, payment_amount) {
        let points = 1;
        
        // ask shards to send message
        let postData = {
            user : user,
            points_amount : points_amount,
            user_points : user_points,
            payment_amount : payment_amount
        };
        for (let i = 1; i <= ShardManager.config["nbrShards"]; i++) {
            let shardAPIPort = ShardManager.config["APIPort"] + i;
            fetch(
                "http://localhost:" + shardAPIPort + "/webhook/donation",
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: { 'Content-Type': 'application/json' }
                }
            ).catch((error) => {});
        };
    };
};

module.exports = ShardManager;