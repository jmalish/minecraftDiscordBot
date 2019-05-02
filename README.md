# Minecraft Discord Bot

A bot to get the status of a minecraft server and display it on discord. Will probably do more later.


### Instructions

- Create secrets.json file with the following format
    ```
    {
      "token": "<discord bot token>",
      "serverIP": "<minecraft server ip>",
      "adminID": "<your discord user id>"
    }
    ```
- run `npm i` to install node packages
- Start bot with `npm start`


## Error reporting
If the script runs into an error, it will send a message to the user set as the `adminID` in the secrets file.
It will only send one message, but can reset by replying to the PM with a simple "!k"
