const Discord = require('discord.js');
const request = require('request');

const secrets = require('./secrets.json');
const client = new Discord.Client();

let serverIP = secrets.serverIP;
let checkServerStatusTimer = 60000; // convert to milliseconds
let botStatus = 'dnd';
let errorReported = false;

// timers
let playerListTimer = 0;

// <editor-fold description="Script">
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

    if (message.content === '!list') {
        getPlayerList(playerList => {
            if (!playerList) {
                _message.channel.send("Either the server is offline or something else went wrong...")
            }
            let message = 'Users online:\n```\n';
            playerList.forEach(player => {
                message = message.concat(player, '\n');
            });
            message = message.concat('```');

            _message.channel.send(message);
        })
    }

    else if (message.author.id === secrets.adminID && message.content === "!k" && errorReported) {
        errorReported = false;
        console.log("Error Reporting reset!");
    }
});

client.login(secrets.token); // set token and login
// </editor-fold description="Script">

// <editor-fold description="Functions">
function setActivity(activity) { // function to set activity of bot
    client.user.setActivity(activity.toString(), {type: 'PLAYING'});
    client.user.setStatus(botStatus);
}

function getServerStatus() {
    try {
        let date = new Date();
        console.log(date.getHours() + ":" + date.getMinutes() + ' > Checking status'); // print out current time
        request({
            url: 'https://api.mcsrvstat.us/2/' + serverIP
        }, function (err, res, body) {
            if (err) {
                console.log(err);
                return;
            }

            let status = JSON.parse(body);
            // console.log(status);

            if (!status.players) {
                botStatus = 'dnd';
                setActivity('Server offline!');
            } else {
                botStatus = 'online';
                setActivity(status.players.online + " players on kfpmc.org");
            }
        });

        if (playerListTimer > 0) {
            playerListTimer--;
        }
    } catch (err) {
        reportError(err, "getServerStatus()");
    }
}

function getPlayerList(callback) {
    try {
        if (playerListTimer === 0) {
            if (botStatus === 'online') {
                request({
                    url: 'https://api.mcsrvstat.us/2/' + serverIP
                }, function (err, res, body) {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    let status = JSON.parse(body);
                    // console.log(status);

                    if (status.players.max === 0) {
                        callback(false);
                    } else {
                        callback(status.players.list);
                    }
                });
            } else {
                callback(false);
            }
            playerListTimer = 1;
        }
    } catch (err) {
        reportError(err, "getPlayerList()");
    }
}

function reportError(err, functionName) {
    console.log("Problem in " + functionName + ", see below.");
    console.error(err);

    if (!errorReported) {
        client.users.get(secrets.adminID).send('Problem in ' + functionName +
        "\nReply with !k to receive new error reports.");
        errorReported = true;
    }
}
// </editor-fold description="Functions">
