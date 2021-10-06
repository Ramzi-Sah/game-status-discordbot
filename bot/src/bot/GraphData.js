const Log = require('../common/log.js');
const Bot = require('./Bot.js');

const fs = require('fs');

class GraphData {
    constructor(id) {
        this.instanceId = id;
    };

    add(time, nbrPlayers) {
        // save data to json file
        let data;
        try {
            data = fs.readFileSync('data/' + this.instanceId + '.json', {encoding:'utf8', flag:'r'});
        } catch (error) {
            // create default graph data file
            try {
                fs.writeFileSync('data/' + this.instanceId + '.json', '[]');
            } catch (error) {
                Log.print("could not create graph data for instance (" + this.instanceId + ").", 2, "Status Broadcast");
                Log.printError(error);
            };

            return;
        };
        
        // read old data and concat new data
        let json;
        try {
            json = JSON.parse(data);
        } catch (error) {
            Log.print("could not read old graph data for instance (" + this.instanceId + ").", 2, "Status Broadcast");
            Log.printError(error);

            json = JSON.parse("[]");
        };

        // 1 day history
        let nbrMuchData = json.length - 24 * 60 * 60 / Bot.config["statusQueryTime"];
        if (nbrMuchData > 0) {
            json.splice(0, nbrMuchData);
        };

        // concat new data
        json.push({"x": time, "y": nbrPlayers});

        // rewrite data file 
        try {
            fs.writeFileSync('data/' + this.instanceId + '.json', JSON.stringify(json));
        } catch(error) {
            Log.print("could not modify graph data for instance (" + this.instanceId + ").", 2, "Status Broadcast");
            Log.printError(error);
        };
    };

    read() {
        let data = [];

        try {
            data = JSON.parse(fs.readFileSync('data/' + this.instanceId + '.json', {encoding:'utf8', flag:'r'}));
        } catch (error) {
            data = [];
        }

        return data;
    };

    clear() {
        try {
            fs.unlinkSync('data/' + this.instanceId + '.json');
        } catch(err) {}
    };

};

module.exports = GraphData;