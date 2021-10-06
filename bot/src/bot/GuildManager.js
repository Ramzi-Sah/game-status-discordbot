const Guild = require('./Guild.js');
const Instance = require('./Instance.js');

class GuildManager {
    constructor() {};

    static guilds = [];
    static db;
    

    static nbrGuilds() {
        return GuildManager.guilds.length;
    };

    static addGuild(guildId) {
        GuildManager.guilds.push(new Guild(guildId, this.db));
    };

    static removeGuild(guildId) {
        for (let i = 0; i < this.nbrGuilds(); i++) {
            if (GuildManager.guilds[i].id == guildId) {
                GuildManager.guilds[i].destroy();
                GuildManager.guilds.splice(i, 1);
                break;
            };
        };
    };

    static getGuild(guildId) {
        for (let i = 0; i < this.nbrGuilds(); i++) {
            if (GuildManager.guilds[i].id == guildId) {
                return GuildManager.guilds[i];
            };
        };

        return null;
    };

    static addInstance(guildId, instanceId, instanceName) {
        GuildManager.getGuild(guildId).addInstance(new Instance(instanceId, instanceName));
    };
    static addInstance(guild, instanceId, instanceName) {
        guild.addInstance(new Instance(instanceId, instanceName));
    };

    static removeInstance(guildId, instanceId) {
        GuildManager.getGuild(guildId).removeInstance(instanceId)
    };
    static removeInstance(guild, instanceId) {
        guild.removeInstance(instanceId)
    };

    static updateInstanceStatusMessage(guildId, messageId) {
        GuildManager.getGuild(guildId).updateInstanceMessage(messageId);
    };

    static checkIsUsed(guildId, message) {
        return GuildManager.getGuild(guildId).checkIsUsed(message);
    };

};

module.exports = GuildManager;