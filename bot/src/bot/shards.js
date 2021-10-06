// FIXME pls
// get config
const fs = require('fs');
config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8'));
const DBManager = require('../common/DBManager.js');
var db = new DBManager(
    config["db_hostname"],
    config["db_port"],
    config["db_name"],
    config["db_Username"],
    config["db_Password"]
);

// init shard
const Bot = require('./Bot.js');
const GuildManager = require('./GuildManager.js');
GuildManager.db = db;

Bot.init(GuildManager);
