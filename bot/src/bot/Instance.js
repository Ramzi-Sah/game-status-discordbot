const Common = require('../common/common.js');
const Log = require('../common/log.js');
const Bot = require('./Bot.js');
const GraphData = require('./GraphData.js');

const fs = require('fs');
const {MessageEmbed} = require('discord.js');
const gamedig = require('gamedig');
const fetch = require('node-fetch');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const downsample = require('chartjs-plugin-downsample');

const width = 600;
const height = 400;

class Instance {
    constructor(id, name, channel, host, port, game, graph, hide_ip, hide_port, logo, language, playerlist, full_playerlist, timezone, timeformat, minimal, color) {
        this.id = id;
        this.name = name;
        this.channel = channel;
        this.host = host;
        this.port = port;
        this.game = game;

        this.graph = graph;
        this.hide_ip = hide_ip;
        this.hide_port = hide_port;
        this.logo = logo;
        this.language = language;
        this.playerlist = playerlist;
        this.full_playerlist = full_playerlist;
        this.timezone = timezone;
        this.timeformat = timeformat;
        this.minimal = minimal;
        this.color = color;

        this.started = false;
        this.actualBroadCast = 0;

        this.graphData = new GraphData(this.id);
        this.canvasRenderService = new ChartJSNodeCanvas({width, height});

        this.statusMessage;
        this.statusMessageData;
        this.lastUpdate = 0;
    };

    start() {
        this.statusMessage = undefined;
        this.startStatusBroadcast(this.actualBroadCast, false);
    };

    stop() {
        this.actualBroadCast += 1;
        this.started = false;
        this.statusMessage = undefined;
        
        // edit instance started on db
        Bot.db.setInstanceStarted(this.id, false);
    };

    restart() {
        this.stop();
        this.startStatusBroadcast(this.actualBroadCast, true);
    };

    // ------------------------------------------------------------------------------------------------------------------------------
    async startStatusBroadcast(broadcastId, isRestart) {
        try {
            var instance = this;

            // check if is alredy started
            if (instance.started) {
                Log.print("trying to restart alredy started instance (" + instance.id + ").", 2, "Status Broadcast");
                return;
            };

            // reset instance errors
            Bot.db.setInstanceError(instance.id, -1);

            // clear old messages
            if (isRestart) {
                await Bot.clearMessages(instance.channel, 0, function (error) {});
            } else {
                // await Bot.clearMessages(instance.channel, 1, function (error) {}); // TODO: remove
            };

            // get last status message
            // instance.statusMessage = undefined; // TODO should be safe to remove
            await Bot.getLastMessage(instance.channel, 1, function (error, mesasge_1) {
                if (!error) {
                    instance.statusMessage = mesasge_1;
                };
            });

            // create new status message if none found
            if (instance.statusMessage == undefined) {
                // clear all messages
                // await Bot.clearMessages(instance.channel, 0, function (error) {}); // TODO: remove

                // generate embed
                let embed = new MessageEmbed();
                embed.setTitle(Bot.translations[instance.language]["status_initiation"] + " ...");
                embed.setColor('#ffff00');

                // send message
                await Bot.sendMessage(instance.channel, 
                    {embed},
                    function (error, mesasge) {
                        if (!error) {
                            instance.statusMessage = mesasge;
                        } else {
                            // throw a big error to the dumb user
                            Bot.db.setInstanceError(instance.id, 1);

                            // log error
                            Log.print("could not create status message for instance (" + instance.id + "), instance stopped.", 2, "Status Broadcast");
                        };
                    }
                );
            };

            // return if could not create status message
            if (instance.statusMessage == undefined) return;

            // start the instance
            instance.started = true;

            // edit instance started on db
            Bot.db.setInstanceStarted(instance.id, true);

            // generate status message
            instance.statusMessageData = await instance.generateStatusEmbed();

            // start query instance
            instance.startStatusMessageQuery(instance, broadcastId);

            // start graph instance
            instance.startGraphBroadcast(instance, broadcastId);

            // react to status message
            instance.statusMessage.react('🔄').catch(() => {
                // reset instance errors
                Bot.db.setInstanceError(instance.id, 3);
            });

            // update status message
            while(instance.started && broadcastId == instance.actualBroadCast) {
                // update status message
                instance.updateStatusMessage(instance, broadcastId);

                // wait some time to reedit
                await Common.sleep(Bot.config["statusUpdateTime"] * 1000);
            };
        } catch(error) {
            Log.print("error on status broadcast for instance (" + instance.id + ").", 2, "Status Broadcast");
            Log.printError(error);
            
            // stop the instance
            instance.started = false;

            // edit instance started on db
            Bot.db.setInstanceStarted(instance.id, false);

            // throw a big error to the dumb user
            Bot.db.setInstanceError(instance.id, 1);
        };
    };

    async updateStatusMessage(instance, broadcastId) {
        try {
            // users should not spam discord api
            if ((new Date() - instance.lastUpdate) / 1000 < Bot.config["statusQueryTime"]) {
                // instance.lastUpdate = new Date();
                return;
            };
            instance.lastUpdate = new Date();

            // edit message
            await Bot.editMessage(instance.statusMessage, 
                instance.statusMessageData,
                function(error) {
                    if (error) {
                        // could not edit because bot restarted
                        if (!(instance.started && broadcastId == instance.actualBroadCast)) {
                            return;
                        };

                        // stop the instance
                        instance.started = false;

                        // edit instance started on db
                        Bot.db.setInstanceStarted(instance.id, false);

                        // throw a big error to the dumb user
                        Bot.db.setInstanceError(instance.id, 2);

                        // log error
                        Log.print("could not edit status message for instance (" + instance.id + "), instance stopped.", 2, "Status Broadcast");
                        Log.printError(error);
                    };
                }
            );
        } catch(error) {
            Log.print("error on status broadcast for instance (" + instance.id + ").", 2, "Status Broadcast");
            Log.printError(error);
            
            // stop the instance
            instance.started = false;

            // edit instance started on db
            Bot.db.setInstanceStarted(instance.id, false);

            // throw a big error to the dumb user
            Bot.db.setInstanceError(instance.id, 1);
        };
    };

    generateStatusEmbed() {
        try {
            //get this
            let instance = this;

            // init embed message
            let embed = new MessageEmbed();

            // set embed name and logo
            embed.setAuthor(instance.name, instance.logo);

            // set embed updated time
            instance.tic = !instance.tic;
            let ticEmojy = instance.tic ? "⚪" : "⚫";

            let updatedTime = new Date();

            updatedTime.setHours(updatedTime.getHours() + Bot.timezones[instance.timezone][0]);
            updatedTime.setMinutes(updatedTime.getMinutes() + Bot.timezones[instance.timezone][1]);

            embed.setFooter(
                ticEmojy + ' ' + 
                Bot.translations[instance.language]["update_text"] + ': ' + 
                updatedTime.toLocaleTimeString('en-US', {hour12: !instance.timeformat, month: 'short', day: 'numeric', hour: "numeric", minute: "numeric"}) + ' ' +
                "UTC" + (Bot.timezones[instance.timezone][0] > 0 ? "+" : "") + Bot.timezones[instance.timezone][0] + ":" + (Bot.timezones[instance.timezone][1] < 10 ? "0" : " ") + Bot.timezones[instance.timezone][1]
            );
            // get server status
            if (instance.game == "ragemp") {
                return fetch("https://cdn.rage.mp/master/").then((res) => res.json())
                .then((json) => {
                    if (!(instance.host + ":" + instance.port) in json) {
                        embed.setColor('#ff0000');
                        embed.setTitle('❌ ' + Bot.translations[instance.language]["status_offline"] + '.');
                        
                        // add graph data
                        instance.graphData.add(updatedTime, 0);
                        
                        return embed;
                    };
                    // get server data
                    json = json[instance.host + ":" + instance.port];

                    /*
                    {
                        "name":  "[RolePlay][Voice] GTA5RP.COM | RichMan | gta5rp.com/discord",
                        "gamemode":"roleplay",
                        "url":"https://gta5rp.com/",
                        "lang":"ru",
                        "players":691,
                        "peak":701,
                        "maxplayers":5000
                    }
                    */

                    embed.setColor(instance.color);
                    
                    // get name
                    let serverName = json["name"];
                    
                    // refactor server name
                    for (let i = 0; i < serverName.length; i++) {
                        if (serverName[i] == "^") {
                            serverName = serverName.slice(0, i) + " " + serverName.slice(i+2);
                        } else if (serverName[i] == "█") {
                            serverName = serverName.slice(0, i) + " " + serverName.slice(i+1);
                        } else if (serverName[i] == "�") {
                            serverName = serverName.slice(0, i) + " " + serverName.slice(i+2);
                        };
                    };

                    serverName = serverName.replace(/\[.*?\]/g, "");
                    serverName = serverName.trim();

                    // server name field
                    embed.addField(Bot.translations[instance.language]["server_label_name"] + ' :', serverName);

                    // basic server info
                    if (!instance.minimal) {
                        embed.addField(Bot.translations[instance.language]["server_label_direct_connect"] + ' :', "`" + instance.host + ":" + instance.port + "`", true);
                        embed.addField(Bot.translations[instance.language]["server_label_game_mode"] + ' :', json["gamemode"], true);
                        embed.addField(Bot.translations[instance.language]["server_label_game_type"] + ' :', instance.game , true);
                    };

                    embed.addField(Bot.translations[instance.language]["server_label_status"] + ' :', "✅ " + Bot.translations[instance.language]["status_online"], true);
                    embed.addField(Bot.translations[instance.language]["server_label_online_players"] + ' :', json["players"] + " / " + json["maxplayers"], true);
                    embed.addField(Bot.translations[instance.language]["server_label_peak"] + ' :', json["peak"], true);

                    // add graph data
                    instance.graphData.add(updatedTime, json["players"]);

                    // set graph image
                    if (instance.graph)
                        embed.setImage(
                            Bot.config["graphsLink"] + "/" + 'graph_' + instance.id + '.png' + "?id=" + Date.now()
                        );

                    return embed;
                }).catch((error) => {
                    // console.error(error);

                    embed.setColor('#ff0000');
                    embed.setTitle('❌ ' + Bot.translations[instance.language]["status_offline"] + '.');

                    // add graph data
                    instance.graphData.add(updatedTime, 0);
                    
                    return embed;
                });
            } else
            return gamedig.query({
                type: this.game,
                host: this.host,
                port: this.port,

                maxAttempts: 3,
                socketTimeout: 5000,
                debug: false
            }).then((state) => {
                // set embed color
                embed.setColor(instance.color);

                //-----------------------------------------------------------------------------------------------
                // set server name
                let serverName = state.name;
                
                // refactor server name
                for (let i = 0; i < serverName.length; i++) {
                    if (serverName[i] == "^") {
                        serverName = serverName.slice(0, i) + " " + serverName.slice(i+2);
                    } else if (serverName[i] == "█") {
                        serverName = serverName.slice(0, i) + " " + serverName.slice(i+1);
                    } else if (serverName[i] == "�") {
                        serverName = serverName.slice(0, i) + " " + serverName.slice(i+2);
                    };
                };

                // server name field
                embed.addField(Bot.translations[instance.language]["server_label_name"] + ' :', serverName);

                //-----------------------------------------------------------------------------------------------
				// direct connect
				let directConnect = state.connect;
				if (instance.hide_port)
					directConnect = directConnect.split(":")[0];
				
				if (!instance.hide_ip)
					embed.addField(Bot.translations[instance.language]["server_label_direct_connect"], "`" + directConnect + "`", true);
				
                // basic server info
                if (!instance.minimal) {
                    embed.addField(Bot.translations[instance.language]["server_label_game_type"] + ' :', this.game , true);
                    if (state.map == "") {
                        embed.addField("\u200B", "\u200B", true);
                    } else {
                        embed.addField(Bot.translations[instance.language]["server_label_map"] + ' :', state.map, true);
                    };
					
					if (instance.hide_ip)
						embed.addField("\u200B", "\u200B", true);
                };
				

                embed.addField(Bot.translations[instance.language]["server_label_status"] + ' :', "✅ " + Bot.translations[instance.language]["status_online"], true);
                embed.addField(Bot.translations[instance.language]["server_label_online_players"] + ' :', state.players.length + " / " + state.maxplayers, true);
				
				if (!instance.minimal || instance.hide_ip)
					embed.addField('\u200B', '\u200B', true);

                //-----------------------------------------------------------------------------------------------
                // player list
                if (instance.playerlist && state.players.length > 0) {
                    // recover game data
                    let dataKeys = Object.keys(state.players[0]);

                    // set name as first
                    if (dataKeys.includes('name')) {
                        dataKeys = dataKeys.filter(e => e !== 'name');
                        dataKeys.splice(0, 0, 'name');
                    };

                    // remove some unwanted data
                    dataKeys = dataKeys.filter(e => 
                        e !== 'frags' && 
                        e !== 'score' && 
                        e !== 'guid' && 
                        e !== 'id' && 
                        e !== 'team' &&
                        e !== 'squad' &&
                        e !== 'raw' &&
                        e !== 'skin'
                    );

                    if (!instance.graph && dataKeys.length > 0)
                        embed.addField('\u200B', '▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄');
                    
					// show all players
					let number_of_slices = 1;
					if (instance.full_playerlist)
						number_of_slices = Math.ceil(state.players.length / 50);
					
					// generate player list embed's data
					let numberOfDataKeys = instance.minimal ? 1 : 2;
					for (let l = 0; l < number_of_slices; l++) {
						for (let j = 0; j < dataKeys.length && j < numberOfDataKeys; j++) {
							// check if data key empty
							if (dataKeys[j] == "") {
								dataKeys[j] = "\u200B";
							};
							
							let player_datas = "```\n";
							for (let i = 50 * l; i < state.players.length; i++) {
								// break if too many players, prevent message overflow
								if (i + 1 > 50 * (l + 1)) {
									if (l == number_of_slices - 1) {
										if (j == 0) player_datas += "and " + (state.players.length - 50) + " others...";
										else player_datas += "...";
									};

									break;
								};
								
								// set player data
								if (state.players[i][dataKeys[j]] != undefined) {
									let player_data = state.players[i][dataKeys[j]].toString();
									if (player_data == "") {
										player_data = "-";
									};
									
									// handle discord markdown strings
									player_data = player_data.replace(/_/g, " ");
									for (let k = 0; k < player_data.length; k++) {
										if (player_data[k] == "^") {
											player_data = player_data.slice(0, k) + " " + player_data.slice(k+2);
										};
									};
									
									if (dataKeys[j] == "time") {
										let date = new Date(player_data * 1000);
										player_datas += ("0" + date.getHours()).substr(-2) + ':' + ("0" + date.getMinutes()).substr(-2) + ':' + ("0" + date.getSeconds()).substr(-2);
									} else {
										// handle very long strings
										player_data = (player_data.length > 18) ? player_data.substring(0, 18 - 3) + "..." : player_data;
										
										let index = i + 1 > 9 ? i + 1 : "0" + (i + 1);
										player_datas += j == 0 ? index +  " - " + player_data : player_data;
										
										if (dataKeys[j] == "ping") player_datas += " ms";
									};
									player_datas += "\n";
								};
							};
							player_datas += "```";
							
							let feildName = "\u200B";
							if (l == 0) 
								feildName = dataKeys[j].charAt(0).toUpperCase() + dataKeys[j].slice(1) + ' :'
							embed.addField(feildName, player_datas, true);
						};
						
						if (l != number_of_slices - 1) 
							embed.addField('\u200B', '\u200B', false);
					};
                };

                // add graph data
                instance.graphData.add(updatedTime, state.players.length);

                // set graph image
                if (instance.graph)
                    embed.setImage(
                        Bot.config["graphsLink"] + "/" + 'graph_' + instance.id + '.png' + "?id=" + Date.now()
                    );

                return embed;
            }).catch(function(error) {
                // console.log(error);

                // offline status message
                embed.setColor('#ff0000');
                embed.setTitle('❌ ' + Bot.translations[instance.language]["status_offline"] + '.');

                // add graph data
                instance.graphData.add(updatedTime, 0);

                return embed;
            });
        } catch (error) {
            // console.error(error);

            // offline status message
            embed.setColor('#ff0000');
            embed.setTitle('❌ ' + Bot.translations[instance.language]["status_offline"] + '.');

            // add graph data
            instance.graphData.add(updatedTime, 0);

            return embed;
        };
    };

    async startStatusMessageQuery(instance, broadcastId) {
        try {
            while(instance.started && broadcastId == instance.actualBroadCast) {
                // generate status message
                instance.statusMessageData = await instance.generateStatusEmbed();
                
                // wait some time to refetch server
                await Common.sleep(Bot.config["statusQueryTime"] * 1000);
            };
        } catch (error) {
            Log.print("error on startStatusMessageQuery broadcast for instance (" + instance.id + ").", 2, "Status Querry");
            Log.printError(error);

            // stop the instance
            instance.started = false;

            // edit instance started on db
            Bot.db.setInstanceStarted(instance.id, false);

            // throw a big error to the dumb user
            Bot.db.setInstanceError(instance.id, 1);
        };
    };

    // ------------------------------------------------------------------------------------------------------------------------------
    async startGraphBroadcast(instance, broadcastId) {
        try {
            while(instance.started && broadcastId == instance.actualBroadCast) {
                if (instance.graph) {
                    // generate graph message
                    await instance.generateGraph();
                };
                // wait some time to reedit
                await Common.sleep(Bot.config["graphUpdateTime"] * 1000);
            };
        } catch (error) {
            Log.print("error on graph broadcast for instance (" + instance.id + ").", 2, "Status Broadcast");
            Log.printError(error);

            // stop the instance
            instance.started = false;

            // edit instance started on db
            Bot.db.setInstanceStarted(instance.id, false);

            // throw a big error to the dumb user
            Bot.db.setInstanceError(instance.id, 1);
        };
    };

    generateGraph() {
        //get this
        let instance = this;

        // generate graph
        let data = instance.graphData.read();

        let graph_labels = [];
        let graph_datas = [];
        
        // set data
        for (let i = 0; i < data.length; i += 1) {
            graph_labels.push(new Date(data[i]["x"]));
            graph_datas.push(data[i]["y"]);
        };
		
		// set data
		// let precision = 2;
		// for (let i = 0; i < data.length/precision; i += precision) {
			// let data_moy = 0;
			// for (let j = 0; j < precision; j++)
				// data_moy += data[i + j]["y"];
			
			// graph_datas.push(data_moy / precision );
			// graph_labels.push(new Date(data[i]["x"]));
		// };

        let graphConfig =  {
            type: 'line',
            
            data: {
                labels: graph_labels,
                datasets: [{
                    label: 'number of players',
                    data: graph_datas,
                    
                    pointRadius: 0,
                    
                    backgroundColor: Common.hexToRgb(instance.color, 0.2),
                    borderColor: Common.hexToRgb(instance.color, 1.0),
                    borderWidth: 1
                }]
            },
            
            options: {
				downsample: {
					enabled: true,
					threshold: 500 // max number of points to display per dataset
				},
				
                legend: {
                    display: true,
                    labels: {
                        fontColor: 'white'
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: 'rgba(255,255,255,1)',
							precision: 0,
                            beginAtZero: true
                        },
                        gridLines: {
                            zeroLineColor: 'rgba(255,255,255,1)',
                            zeroLineWidth: 0,
                            
                            color: 'rgba(255,255,255,0.2)',
                            lineWidth: 0.5
                        }
                    }],
                    xAxes: [{
                        type: 'time',
                        ticks: {
                            fontColor: 'rgba(255,255,255,1)',
                            autoSkip: true,
                            maxTicksLimit: 10
                        },
                        time: {
                            displayFormats: {
                                quarter: 'h a'
                            }
                        },
                        gridLines: {
                            zeroLineColor: 'rgba(255,255,255,1)',
                            zeroLineWidth: 0,
                            
                            color: 'rgba(255,255,255,0.2)',
                            lineWidth: 0.5
                        }
                    }]
                },
				datasets: {
					normalized: true,
					line: {
						pointRadius: 0
					}
				},
				elements: {
					point: {
						radius: 0
					},
					line: {
						tension: 0
					}
				},
				animation: {
					duration: 0
				},
				responsiveAnimationDuration: 0,
				hover: {
					animationDuration: 0
				}
            }
        };

        let graphFile = 'graph_' + instance.id + '.png';
        
        return instance.canvasRenderService.renderToBuffer(graphConfig).then(data => {
            fs.writeFileSync(Bot.config["graphsFolder"] + "/" + graphFile, data);
        }).catch(function(error) {
            Log.print("graph creation for guild " + instance.id + " failed.", 1, "Generate Graph");
            Log.printError(error);
        });
    };

};

module.exports = Instance;