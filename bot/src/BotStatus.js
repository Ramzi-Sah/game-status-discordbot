const Log = require('./common/log.js');
const DBManager = require('./common/DBManager.js');
const Common = require('./common/common.js');
const ShardManager = require('./ShardManager.js');

class BotStatus {
    constructor() {};

    static async heartBeat(config) {
        // init data-base handler
        this.db = new DBManager(
            config["db_hostname"],
            config["db_port"],
            config["db_name"],
            config["db_Username"],
            config["db_Password"]
        );

        while (true) {
            await Common.sleep(1000);

            if (ShardManager.isReady)
                this.db.setStatus();
        };
    };
};

module.exports = BotStatus;