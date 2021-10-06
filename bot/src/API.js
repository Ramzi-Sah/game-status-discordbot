const Log = require('./common/log.js');
const ShardManager = require('./ShardManager.js');
const http = require('http');

class API {
    constructor() {};

    static initWebAPI(port) {
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

                    // --------------------------------------------------------------------------------------------
                    // handle shards ready message
                    if (request.url === '/shard/ready') {
                        ShardManager.nbrLaunchedShards++;
                        if (ShardManager.nbrLaunchedShards == ShardManager.config["nbrShards"]) {
                            ShardManager.setUp(); 
                        };

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end('is ok.');
                    };

                    // do not respond if bot not ready
                    if (!ShardManager.isReady)  {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end('not ready yet to handle the request.');
                    };
                    
                    // --------------------------------------------------------------------------------------------
                    // handle requests
                    if (request.url === '/instance/create') {
                        if (!/^[0-9]+$/.test(data.instance_server)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        if (!/^[A-Za-z0-9-_",\s]+$/.test(data.instance_name)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        data.instance_name = data.instance_name.trim();

                        // send create instance message
                        ShardManager.createNewInstance(data.instance_server, data.instance_name);

                        // Log.print("Create instance request received for guild (" + data.instance_server + ") with instance name \"" + data.instance_name+ "\".", 0, "API");
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end('is ok.');
                    
                    } else if (request.url === '/instance/delete') {
                        if (!/^[0-9]+$/.test(data.instance_server)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        if (!/^[A-Za-z0-9",\s]+$/.test(data.instance_id)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        // send delete instance message
                        ShardManager.deleteInstance(data.instance_server, data.instance_id);

                        // Log.print("Delete instance request received for guild (" + data.instance_server + ") with instance id (" + data.instance_id+ ").", 0, "API");
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end('is ok.');

                    } else if (request.url === '/instance/edit') {
                        if (!/^[0-9]+$/.test(data.guild)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        
                        if (!/^[A-Za-z0-9]+$/.test(data.instance)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        if (!/^[0-9]+$/.test(data.channel)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        if (!/^[A-Za-z0-9._-\s]+$/.test(data.host)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        if (!/^[0-9]+$/.test(data.port) || parseInt(data.port) < 10 || parseInt(data.port) > 65500) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        if (!/^[A-Za-z0-9.-\s]+$/.test(data.game)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        
                        if (!/^[0-9]+$/.test(data.graph) || parseInt(data.graph) < 0 || parseInt(data.graph) > 1) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        if (!/^[0-9]+$/.test(data.hide_ip) || parseInt(data.hide_ip) < 0 || parseInt(data.hide_ip) > 1) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        if (!/^[0-9]+$/.test(data.hide_port) || parseInt(data.hide_port) < 0 || parseInt(data.hide_port) > 1) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        if (data.logo != "" && !/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(data.logo)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        if (!/^[A-Z]+$/.test(data.language)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        if (!/^[0-9]+$/.test(data.playerlist) || parseInt(data.playerlist) < 0 || parseInt(data.playerlist) > 1) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        if (!/^[0-9]+$/.test(data.full_playerlist) || parseInt(data.full_playerlist) < 0 || parseInt(data.full_playerlist) > 1) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        if (!/^[0-9]+$/.test(data.timezone) || parseInt(data.timezone) < 0 || parseInt(data.timezone) > 37) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        if (!/^[0-9]+$/.test(data.timeformat) || parseInt(data.timeformat) < 0 || parseInt(data.timeformat) > 1) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        if (!/^[0-9]+$/.test(data.minimal) || parseInt(data.minimal) < 0 || parseInt(data.minimal) > 1) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };
                        if (!/^#[0-9A-F]{6}$/i.test(data.color)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        // Log.print("Edit Instance of guild (" + data.guild + ") request received.", 0, "API");

                        ShardManager.editInstance(
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

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end("is ok.");
                    } else if (request.url === '/guild/getChannels') {
                        if (!/^[0-9]+$/.test(data.guildId)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        // Log.print("Get channels of guild (" + data.guildId + ") received.", 0, "API");

                        ShardManager.getChannels(data.guildId).then(json => {
                            for (let i = 0; i < json.length; i++) {
                                if (json[i]["error"] == "") {
                                    response.statusCode = 200;
                                    response.setHeader('Content-Type', 'text/plain');
                                    return response.end(JSON.stringify(json[i]));
                                };
                            };

                            Log.print("tryed to fetch a non suported guild (" + data.guildId + ") received.", 2, "API");
                            
                            // send guild's channels response
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('{ \"error\": \"guild not existing on any shard.\", \"channels\": []}');
                        });
                    } else if (request.url === '/instance/start') {
                        if (!/^[0-9]+$/.test(data.guild)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        if (!/^[A-Za-z0-9]+$/.test(data.instance)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('guild is not ok.');
                        };

                        // Log.print("start instance (" + data.instance + ") on guild (" + data.guild + ") received.", 0, "API");
                        ShardManager.startInstance(data.guild, data.instance);
                        
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end("is ok."); 
                    } else if (request.url === '/instance/stop') {
                        if (!/^[0-9]+$/.test(data.guild)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        if (!/^[A-Za-z0-9]+$/.test(data.instance)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('guild is not ok.');
                        };

                        // Log.print("stop instance (" + data.instance + ") on guild (" + data.guild + ") received.", 0, "API");
                        ShardManager.stopInstance(data.guild, data.instance);

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end("is ok."); 
                    } else if (request.url === '/instance/restart') {
                        if (!/^[0-9]+$/.test(data.guild)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        if (!/^[A-Za-z0-9]+$/.test(data.instance)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('guild is not ok.');
                        };

                        // Log.print("restart instance (" + data.instance + ") on guild (" + data.guild + ") received.", 0, "API");
                        ShardManager.restartInstance(data.guild, data.instance);

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end("is ok."); 
                    } else if (request.url === '/instance/clearGraph') {
                        if (!/^[0-9]+$/.test(data.guild)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('not ok.');
                        };

                        if (!/^[A-Za-z0-9]+$/.test(data.instance)) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'text/plain');
                            return response.end('guild is not ok.');
                        };

                        // Log.print("clear graph instance (" + data.instance + ") on guild (" + data.guild + ") received.", 0, "API");
                        ShardManager.clearGraphInstance(data.guild, data.instance);

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end("is ok."); 
                    };

                    if (request.url === '/webhook/vote') {
                        // Log.print("upvote received.", 0, "API");
                        ShardManager.HandleUpVote(
                            data.bot,
                            data.user,
                            data.type,
                            data.query,
                            data.isWeekend
                        );

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end("is ok."); 
                    } else if (request.url === '/webhook/donation') {
                        // Log.print("donation received.", 0, "API");
                        ShardManager.HandleDonation(
                            data.user,
                            data.points_amount,
                            data.user_points,
                            data.payment_amount
                        );
                        
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/plain');
                        return response.end("is ok."); 
                    };

                    // response.statusCode = 200;
                    // response.setHeader('Content-Type', 'text/plain');
                    // return response.end('hello world.');
                });
            };

        });

        // start web server
        server.listen(port, function () {
            Log.print('started web server listning on port ' + port, 0, "API");
        }).on('error', function (error) {
            Log.print("web api port (" + port + ") alredy in use.", 2);
            Log.printError(error);
 
            process.exit(1);
        });
    };

};

module.exports = API;