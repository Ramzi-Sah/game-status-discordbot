// ---------------------------------------------------------------------------------------------
// read bot configs
const fs = require('fs');
const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

// launch shards
const ShardManager = require('./ShardManager.js');
ShardManager.start();

// init bot api
const API = require('./API.js');
API.initWebAPI(config["APIPort"]);

// init bot status
const BotStatus = require('./BotStatus.js');
BotStatus.heartBeat(config);