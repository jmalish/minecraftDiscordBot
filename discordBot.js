const Discord = require('discord.js');
const request = require('request');

const settings = require('./settings.json');
let Server = require('./Server');

const client = new Discord.Client();

let servers = [];
let checkServerStatusTimer = 30000; // convert to milliseconds
let botStatus = 'dnd';
let errorReported = false;
let lastServerChecked = -1;

let lastList = null; // used for deletion of old player lists so as not to spam channel

// <editor-fold description="Script">
getServers();
console.log('Checking server status every ' + (checkServerStatusTimer/1000/60) + ' minutes');

client.on('ready', () => {
    console.log('Logged in as ' + client.user.tag);
    setInterval(getServerStatus, checkServerStatusTimer); // set up timer to check status every x minutes
    getServerStatus(); // initial status check
});

client.on('message', message => {
    let _message = message; // just scope things

    if (message.author.bot) return; // ignore other bots
    if (message.content.indexOf('!') !== 0) return; // make sure message starts with our command indicator

    if (message.content.indexOf('!list') > -1) {
        let requestedServer = servers[0].name;

        if (message.content.split(' ')[1]) {
            requestedServer = message.content.split(' ')[1].trim();
        }

        getPlayerList(playerList => {
            if (!playerList) {
                _message.channel.send('Either the server is offline, or no one is online.')
                    .then(sentMessage => {
                        lastList = sentMessage; // store the last command so we can delete it later to avoid spamming the channel
                    });

                return;
            }

            let message = playerList.length + ' users online on ' + requestedServer + ':\n```\n';
            if (!playerList) {
                _message.channel.send("Either the server is offline or something else went wrong...");
            } else {
                playerList.forEach(player => {
                    message = message.concat(player, '\n');
                });
                message = message.concat('```');
                if (servers.length > 1) {
                    message = message.concat('\nTo see a list of players on another server, enter one of the following after !list: ');
                    servers.forEach(server => {
                        if (server !== servers[0]) {
                            message = message.concat('`' + server.name + '` ');
                        }
                    });
                }

                if (lastList) {
                    lastList.delete();
                }

                _message.channel.send(message)
                    .then(sentMessage => {
                        lastList = sentMessage; // store the last command so we can delete it later to avoid spamming the channel
                    });
            }
        }, requestedServer)
    }

    else if (message.author.id === settings.adminID && message.content === "!k" && errorReported) {
        errorReported = false;
        console.log("Error Reporting reset!");
    }
});

client.on('error', err => {
    // This is called whenever the client runs into an error, I assume this is discord related, but I can't find anything in discordjs documentation
    // I don't think it's neccessary to report this to the admin, having this code keeps the bot from crashing, that's the important part
    // reportError(err, 'Client Error');
});

client.login(settings.token); // set token and login
// </editor-fold description="Script">

// <editor-fold description="Functions">
function getServers() {
    servers = [];

    settings.servers.forEach(server => {
        let _server = new Server(server.ip, server.name);

        _server.status = 'offline';

        servers.push(_server);
    });
}

function setActivity(activity) { // function to set activity of bot
    client.user.setActivity(activity.toString(), {type: 'PLAYING'});
    client.user.setStatus(botStatus);
}

function getServerStatus() {
    try {
        let checkingServer;

        if (lastServerChecked === servers.length - 1) {
            checkingServer = servers[0];
            lastServerChecked = 0;
        } else {
            lastServerChecked++;
            checkingServer = servers[lastServerChecked];
        }

        let date = new Date();
        console.log(date.getHours() + ":" + date.getMinutes() + ' > Checking status of ' + checkingServer.name); // print out current time
        request({
            url: 'https://api.mcsrvstat.us/2/' + checkingServer.ip
        }, function (err, res, body) {
            if (err) {console.log(err); return;}

            let status = JSON.parse(body);

            if (!status.players) {
                botStatus = 'dnd';
                setActivity(checkingServer.name + ' offline!');
            } else {
                botStatus = 'online';
                setActivity("with " + status.players.online + " others on " + checkingServer.name);
            }
        });
    } catch (err) {
        reportError(err, "getServerStatus()");
    }
}

function getPlayerList(callback, requestedServer = null) {
    try {
        if (!requestedServer) {
            requestedServer = servers[0].ip;
        } else {
            let findServer = servers.find(server => {
                return server.name === requestedServer;
            });

            requestedServer = findServer.ip;
        }


        request({
            url: 'https://api.mcsrvstat.us/2/' + requestedServer
        }, function (err, res, body) {
            if (err) {console.log(err); return;}

            let status = JSON.parse(body);

            if (!status.players) {
                callback(false);
            } else {
                callback(status.players.list);
            }
        });
    } catch (err) {
        reportError(err, "getPlayerList()");
    }
}

function reportError(err, functionName) {
    console.log("Problem in " + functionName + ", see below.");
    console.error(err);
    //
    // if (!errorReported) {
    //     client.users.get(settings.adminID).send('Problem in ' + functionName +
    //     "\nReply with !k to receive new error reports.");
    //     errorReported = true;
    // }
}
// </editor-fold description="Functions">
