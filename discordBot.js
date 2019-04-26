const Discord = require('discord.js');
const request = require('request');

const secrets = require('./secrets.json');
const client = new Discord.Client();

let serverIP = secrets.serverIP;
let checkServerTimerMinutes = 5; // enter in minutes
let checkServerStatusTimer = 5*60*1000; // convert to milliseconds

console.log('Checking server status every ' + checkServerTimerMinutes + ' minutes');

client.on('ready', () => {
    console.log('Logged in as ' + client.user.tag);
    setInterval(getServerStatus, checkServerStatusTimer); // set up timer to check status every x minutes
    getServerStatus(); // initial status check
});

// client.on('message', message => { // TODO: uncomment to respond to messages in server
//     if (message.content === 'ping') {
//         message.reply('pong'); // responds to same channel
//     }
// });


client.login(secrets.token); // set token



function setActivity(activity) { // function to set activity of bot
    client.user.setActivity(activity.toString(), {type: 'PLAYING'});
}

function getServerStatus() {
    console.log('Checking status');
    request({
        url: 'http://mcapi.us/server/status?ip=' + serverIP
    }, function (err, res, body) {
        if (err) {console.log(err); return;}

        let status = JSON.parse(body);
        // console.log(status);

        if (status.players.max === 0) {
            client.user.setStatus('dnd');
            setActivity('Server offline!');
        } else {
            client.user.setStatus('online');
            setActivity(status.players.now + " players on kfpmc.org");
        }
    });
}