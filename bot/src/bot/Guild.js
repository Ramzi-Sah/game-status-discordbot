const Instance = require('./Instance.js');
const Log = require('../common/log.js');
const DBManager = require('../common/DBManager.js');
const fs = require('fs');

class Guild {
    constructor(id, db) {
        this.id = id;
        this.instances = [];

        // read config
        this.config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8'));

        // init data-base handler
        this.db = db;

        let guild = this;
        this.db.getInstances(this.id, function(error, results) {
            if (error) return;
            if (results[0] == undefined) return; // may be not created yet on db

            let instancesId = JSON.parse(results[0].instances);

            // add all instances
            for (let i = 0; i < instancesId.length; i++) {
                db.getInstanceData(instancesId[i], function(error, results) {
                    if (error) return;
                    if (results[0] == undefined) return; // may be not created yet on db

                    guild.addInstance(new Instance(
                        results[0]["instance_id"],
                        results[0]["name"],
                        results[0]["channel"],
                        results[0]["host"],
                        results[0]["port"],
                        results[0]["game"],

                        results[0]["graph"],
                        results[0]["hide_ip"],
                        results[0]["hide_port"],
                        results[0]["logo"],
                        results[0]["language"],
                        results[0]["playerlist"],
                        results[0]["full_playerlist"],
                        results[0]["timezone"],
                        results[0]["timeformat"],
                        results[0]["minimal"],
                        results[0]["color"]
                    ));

                    if (results[0]["started"])
                        guild.getInstance(instancesId[i]).start();
                });
            };
        });
    };

    destroy() {
        for (let i = 0; i < this.instances.length; i++) {
            this.instances[i].stop();
        };
    };

    addInstance(instance) {
        this.instances.push(instance);

        // Log.print("instance " + instance.name + " (" + instance.id + ") adedd for guild (" + this.id + ").");
    };

    removeInstance(instanceID) {
        for (let i = 0; i < this.instances.length; i++) {
            if (this.instances[i].id == instanceID) {
                // Log.print("instance " + this.instances[i].name + " (" + this.instances[i].id + ") removed from guild (" + this.id + ").");

                this.instances[i].stop();
                this.instances.splice(i, 1);
                break;
            };
        };
    };

    getInstance(instanceID) {
        for (let i = 0; i < this.instances.length; i++) {
            if (this.instances[i].id == instanceID) {
                return this.instances[i];
            };
        };
    };

    updateInstanceMessage(messageId) {
        for (let i = 0; i < this.instances.length; i++) {
            if (this.instances[i].statusMessage != undefined)
                if (this.instances[i].statusMessage.id == messageId) {
                    this.instances[i].updateStatusMessage(this.instances[i], this.instances[i].actualBroadCast);

                    // clear emojis 
                    this.instances[i].statusMessage.reactions.removeAll().catch(error => {
                        this.db.setInstanceError(this.instances[i], 4);
                    });
                    this.instances[i].statusMessage.react('🔄').catch(() => {});

                    break;
                };
        };
    };

    checkIsUsed(message) {
        for (let i = 0; i < this.instances.length; i++) {
            if (this.instances[i].statusMessage != undefined)
                if (this.instances[i].statusMessage.id == message.id) {
                    return true;
                };
        };

        return false;
    };
};

module.exports = Guild;