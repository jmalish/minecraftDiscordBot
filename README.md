# Minecraft Discord Bot

A bot to get the status of a minecraft server and display it on discord. Will probably do more later.


### Instructions

- Create settings.json file with the following format
    ```
    {
      "token": "<discord bot token>",
      "serverIP": "<minecraft server ip>",
      "adminID": "<your discord user id>",
      "servers": [
        {
          "ip": "<ip of server 1>",
          "name": "<name of server 1>"
        },
        {
          "ip": "<ip of server 2>",
          "name": "<name of server 2>"
        }
      ]
    }
    ```
    - if you only have one server, delete the second block in servers
    - if you have more, just add more blocks
    - ip is the ip of the server, of course
    - name is what what you want the bot to display the server as
    - The first server is used as the default server for commands such as !list
- run `npm i` to install node packages
- Start bot with `npm start`


## Discord Commands
`!list`: Displays a list of users on the server

## Error reporting
If the script runs into an error, it will send a message to the user set as the `adminID` in the secrets file.
It will only send one message, but can reset by replying to the PM with a simple "k
