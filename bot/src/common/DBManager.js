const Log = require('./log.js');
const mysql = require('mysql');

class DBManager {
    constructor(host, port, dbname, username, userpassword) {
        this.host = host;
        this.port = port;
        this.dbname = dbname;
        this.username = username;
        this.userpassword = userpassword;

        this.pool  = mysql.createPool({
            connectionLimit : 5,
            
            connectTimeout  : 5 * 60 * 60 * 1000,
            aquireTimeout   : 5 * 60 * 60 * 1000,
            timeout         : 5 * 60 * 60 * 1000,

            host            : this.host,
            port            : this.port,
            database        : this.dbname,
            user            : this.username,
            password        : this.userpassword
        });
    };

    // ---------------------------------------------------------------------------------------------
    // handle guilds
    getGuilds(callback) {
        try{
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not insert guild (" + guildId + ").", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return callback(error);
                };

                connection.query("SELECT guild_id FROM guilds", function (error, results) {
                    if (error) {
                        Log.print("could not select guilds grom db.", 2, "DB Manager");
                        Log.printError(error);
                        return callback(error);
                    };

                    // release connection to pool
                    connection.release();
    
                    return callback(null, results);
                });
            });
        } catch (err) {
            Log.print("could not insert guild (" + guildId + ").", 2, "DB Manager");
            Log.printError(err);
            return callback(err);
        };
    };

    insertGuild(guildId) {
        try {
            if (guildId === undefined) return;

            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not insert guild (" + guildId + ").", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("INSERT INTO guilds (guild_id, instances) VALUES ('" + guildId + "', '[]');", function (error) {
                    if (error) {
                        Log.print("could not insert guild (" + guildId + ") to db.", 2, "DB Manager");
                        Log.printError(error);
                        return;
                    };
    
                    // Log.print("guild (" + guildId + ") inserted to db.", 0, "DB Manager");

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not insert guild (" + guildId + ").", 2, "DB Manager");
            Log.printError(err);
        };
    };

    deleteGuild(guildId) {
        try {
            if (guildId === undefined) return;

            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not delete guild (" + guildId + ").", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                // select guild instances
                connection.query("SELECT instances FROM guilds WHERE guild_id = '" + guildId + "';", function (error, results) {
                    if (error) {
                        Log.print("could not select guild (" + guildId + ") instances from db.", 2, "DB Manager");
                        Log.printError(error);
                        return;
                    };

					if (results[0] === undefined) {
							Log.print("tried to delete an inexisting guild (" + guildId + ").", 1, "DB Manager");
                            
							// release connection to pool
                            connection.release();
			
							return;
					}

                    // convert instances ids
                    var instances_ids = '';
                    JSON.parse(results[0].instances).forEach(function(entry, index) {
                        instances_ids += (index == 0) ? entry : "','" + entry;
                    });

                    connection.query("DELETE FROM instances WHERE instance_id IN ('" + instances_ids + "');", function (error) {
                        if (error) {
                            Log.print("could not delete guild instances ('" + instances_ids + "') for guild (" + guildId + ") from db.", 0, "DB Manager");
                            Log.printError(error);
                            return;
                        };
    
                        connection.query("DELETE FROM guilds WHERE guild_id = '" + guildId + "';", function (error) {
                            if (error) {
                                Log.print("could not delete guild (" + guildId + ") from db.", 2, "DB Manager");
                                Log.printError(error);
                                return;
                            };
                            
                            // Log.print("guild (" + guildId + ") deleted from db.", 0, "DB Manager");
                            
                            // release connection to pool
                            connection.release();
                        });
    
                        // Log.print("deleted guild instances ('" + instances_ids + "') for guild (" + guildId + ") from db.", 0, "DB Manager");
                    });
                });
            });

        } catch (err) {
            Log.print("could not delete guild (" + guildId + ").", 2, "DB Manager");
            Log.printError(err);
        };
    };

    // ---------------------------------------------------------------------------------------------
    // handle instances
    getInstances(guildId, callback) {
        try {

            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not get instances for guild (" + guildId + ").", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return callback(error);
                };

                connection.query("SELECT instances FROM guilds WHERE guild_id = '" + guildId + "';", function (error, results) {
                    if (error) {
                        Log.print("could not select instances for guild " + guildId +  " grom db.", 2, "DB Manager");
                        Log.printError(error);
                        return callback(error);
                    };

                    // release connection to pool
                    connection.release();

                    return callback(null, results);
                });
            });
            
        } catch (err) {
            Log.print("could not get instances for guild (" + guildId + ").", 2, "DB Manager");
            Log.printError(err);
            return callback(err);
        };
    };

    getInstanceData(id, callback) {
        try {

            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not get instance (" + id + ") data.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return callback(error);
                };

                connection.query("SELECT * FROM instances WHERE instance_id = '" + id + "';", function (error, results) {
                    if (error) {
                        Log.print("could not select data of instance (" + id +  ") grom db.", 2, "DB Manager");
                        Log.printError(error);
                        return callback(error);
                    };

                    // release connection to pool
                    connection.release();
    
                    return callback(null, results);
                });
            });
        } catch (err) {
            Log.print("could not get instance (" + id + ") data.", 2, "DB Manager");
            Log.printError(err);
            return callback(err);
        };
    };

    // create instance
    createInstance(guildId, instanceId, instanceName) {
        try {

            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not create instance (" + instanceId + ") for guild (" + guildId + ").", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                // get guild instances
                connection.query("SELECT instances FROM guilds WHERE guild_id = '" + guildId + "';", function (error, results) {
                    if (error) {
                        Log.print("could not select instances for guild " + guildId +  " grom db.", 2, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    let instancesId = JSON.parse(results[0].instances);
                    instancesId.push(instanceId);

                    connection.query("UPDATE guilds SET instances = '" +  JSON.stringify(instancesId) + "' WHERE guild_id = '" + guildId + "';", function (error, results) {
                        if (error) {
                            Log.print("could not update instances for guild " + guildId +  " with " + instancesId + ".", 2, "DB Manager");
                            Log.printError(error);
                            return;
                        };

                        connection.query("INSERT INTO instances (`instance_id`, `name`) VALUES ('" +  instanceId + "', '" + instanceName + "');", function (error, results) {
                            if (error) {
                                Log.print("could not insert instance " + instanceName + " (" + instanceId + ") to db.", 2, "DB Manager");
                                Log.printError(error);
                                return;
                            };
    
                            // Log.print("instance " + instanceName + " (" + instanceId + ") for guild (" + guildId + ") inserted to db.", 0, "DB Manager");
                        
                            // release connection to pool
                            connection.release();
                        });
                    });
                });
            });
        } catch (err) {
            Log.print("could not create instance (" + instanceId + ") for guild (" + guildId + ").", 2, "DB Manager");
            Log.printError(err);
        };
    };

    // deleteInstance
    deleteInstance(guildId, instanceId) {
        try {

            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not delete instance (" + instanceId + ") for guild (" + guildId + ").", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("SELECT instances FROM guilds WHERE guild_id = '" + guildId + "';", function (error, results)  {
                    if (error) {
                        Log.print("could not select instances for guild " + guildId +  " grom db.", 2, "DB Manager");
                        Log.printError(error);
                        return;
                    };
    
                    if (results[0] == undefined) return;
    
                    // parse instances
                    let instancesId = JSON.parse(results[0].instances);
    
                    // remove instance
                    for (let i = 0; i < instancesId.length; i++) {
                        if (instancesId[i] == instanceId) {
                            instancesId.splice(i, 1);
                            break;
                        };
                    };

                    connection.query("UPDATE guilds SET instances = '" +  JSON.stringify(instancesId) + "' WHERE guild_id = '" + guildId + "';", function (error, results) {
                        if (error) {
                            Log.print("could not update instances for guild " + guildId +  " with " + instancesId + ".", 2, "DB Manager");
                            Log.printError(error);
                            return;
                        };
    

                        connection.query("DELETE FROM instances WHERE instance_id = '" + instanceId + "';", function (error) {
                            if (error) {
                                Log.print("could not delete instance (" + instanceId + ")  for guild (" + guildId + ") from db.", 2, "DB Manager");
                                Log.printError(error);
                                return;
                            };
                            
                            // Log.print("instance (" + instanceId + ") for guild (" + guildId + ") deleted from db.", 0, "DB Manager");

                            // release connection to pool
                            connection.release();
                        });
                    });
                });
            });
        } catch (err) {
            Log.print("could not delete instance (" + instanceId + ") for guild (" + guildId + ").", 2, "DB Manager");
            Log.printError(err);
        };
    };

    // ---------------------------------------------------------------------------------------------
    // handle bot
    setStatus() {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Bot Status.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                // get current timestamp
                let timestamp = parseInt(Date.now() / 1000);

                // set bot status timestamp
                // we should be ok until 2038 :D
                connection.query("UPDATE bot SET status = " + timestamp, function (error) {
                    if (error) {
                        Log.print("could not set bot heartbeat", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // Log.print("bot status timestamp set to " + timestamp, 0, "DB Manager");

                    // release connection to pool
                    connection.release();
                });
            });

        } catch (err) {
            Log.print("could not set Bot Status.", 2, "DB Manager");
            Log.printError(err);
        };
    };


    // ---------------------------------------------------------------------------------------------
    setInstanceName(instance, name) {
        try {
           this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance Name.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET name = '" + name + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") name to (" + name + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });

        } catch (err) {
            Log.print("could not set Instance Name.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceChannel(instance, channel) {
        try {
           this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET channel = '" + channel + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") channel to (" + channel + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance Channel.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceHost(instance, host) {
        try {
           this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance Host.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET host = '" + host + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") host to (" + host + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance Host.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstancePort(instance, port) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance Port.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET port = '" + port + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") port to (" + port + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance Port.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstancegame(instance, game) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance Game.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET game = '" + game + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") game to (" + game + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance Game.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceStarted(instance, state) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance Started.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };
                
                let started = 0;
                if (state) started = 1;

                connection.query("UPDATE instances SET started = '" + started + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") started to (" + started + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance Started.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceError(instance, errorCode) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance Error.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET error = '" + errorCode + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") error to (" + errorCode + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance Error.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceGraph(instance, graph) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance Graph.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET graph = '" + graph + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") graph to (" + graph + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance Graph.", 2, "DB Manager");
            Log.printError(err);
        };
    };
	
    setInstanceHideIP(instance, hide_ip) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance hide_ip.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET hide_ip = '" + hide_ip + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") hide_ip to (" + hide_ip + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance hide_ip.", 2, "DB Manager");
            Log.printError(err);
        };
    };
	
    setInstanceHidePort(instance, hide_Port) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance hide_Port.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET hide_Port = '" + hide_Port + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") hide_Port to (" + hide_Port + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance hide_Port.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstancePlayerlist(instance, playerlist) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance PlayerList.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET playerlist = '" + playerlist + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") playerlist to (" + playerlist + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance PlayerList.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceFullPlayerlist(instance, full_playerlist) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance full_playerlist.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET full_playerlist = '" + full_playerlist + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") full_playerlist to (" + full_playerlist + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance full_playerlist.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceLogo(instance, logo) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance logo.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET logo = '" + logo + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") logo to (" + logo + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance logo.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceLanguage(instance, language) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance language.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET language = '" + language + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") language to (" + language + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance language.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceTimezone(instance, timezone) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance TimeZone.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET timezone = '" + timezone + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") timezone to (" + timezone + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance TimeZone.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceTimeformat(instance, timeformat) {
        try {
           this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance Timeformat.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET timeformat = '" + timeformat + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") timeformat to (" + timeformat + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance Timeformat.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceMinimal(instance, minimal) {
        try {
           this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance Minimal.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET minimal = '" + minimal + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") minimal to (" + minimal + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance " + instance + " to Minimal.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    setInstanceColor(instance, color) {
        try {
           this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set Instance " + instance + "color.", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return;
                };

                connection.query("UPDATE instances SET color = '" + color + "' WHERE instance_id = '" + instance + "'", function (error) {
                    if (error) {
                        Log.print("could not set instance (" + instance + ") color to (" + color + ")", 0, "DB Manager");
                        Log.printError(error);
                        return;
                    };

                    // release connection to pool
                    connection.release();
                });
            });
        } catch (err) {
            Log.print("could not set Instance " + instance + "color.", 2, "DB Manager");
            Log.printError(err);
        };
    };

    // ---------------------------------------------------------------------------------------------
    addPoints(userId, nbrPoints, callback) {
        try {
            this.pool.getConnection(function(error, connection) {
                if (error) {
                    Log.print("could not set user " + userId + " points " + nbrPoints + ".", 2, "DB Manager");
                    Log.print("db error on the pool.", 2, "DB Manager");
                    Log.printError(error);
                    return callback(error);
                };
 
                connection.query("SELECT points FROM users WHERE user_id = '" + userId + "';", function (error, results) {
                    if (error) {
                        Log.print("could not get user (" + userId + ") from db", 0, "DB Manager");
                        Log.printError(error);
                        return callback(error);
                    };

                    // check if user exists
                    if (results[0] == undefined) {
                        // user does not exist yet create it
                        connection.query("INSERT INTO users (user_id, points) VALUES ('" + userId + "', '" + nbrPoints + "');", function (error) {
                            if (error) {
                                Log.print("could not insert user (" + userId + ") to db.", 2, "DB Manager");
                                Log.printError(error);
                                return callback(error);
                            };

                            // Log.print("new user (" + userId + ") , his points: " + nbrPoints, 0, "DB Manager");

                            // release connection to pool
                            connection.release();

                            return callback(null, nbrPoints);
                        });
                    } else {
                        //user exist add points
                        let userPoints = results[0].points + nbrPoints;
                        connection.query("UPDATE users SET points = '" + userPoints + "' WHERE user_id = '" + userId + "';", function (error) {
                            if (error) {
                                Log.print("could not update user (" + userId + ") with points " + userPoints + ".", 2, "DB Manager");
                                Log.printError(error);
                                return callback(error);
                            };
                            
                            // Log.print("added " + nbrPoints + " to user (" + userId + ") , total points: " + userPoints, 0, "DB Manager");

                            // release connection to pool
                            connection.release();
                            
                            return callback(null, userPoints);
                        });
                    };
                });
            });
         } catch (err) {
            Log.print("could not set Instance Minimal.", 2, "DB Manager");
            Log.printError(err);
            return callback(err);
        };
    };
};

module.exports = DBManager;