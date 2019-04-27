const Discord = require('discord.js');
const request = require('request');

const secrets = require('./secrets.json');
const client = new Discord.Client();

let serverIP = secrets.serverIP;
let checkServerStatusTimer = 60000; // convert to milliseconds

console.log('Checking server status every ' + (checkServerStatusTimer/1000/60) + ' minutes');

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
    let date = new Date();
    console.log(date.getHours() + ":" + date.getMinutes() + ' > Checking status'); // print out current time
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