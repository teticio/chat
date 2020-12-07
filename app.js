const express = require('express');
const { Server } = require('ws');
const PORT = process.env.PORT || 3001

const server = express()
  .use((req, res) => res.sendFile('/index.html', { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// set up websocket server
const wss = new Server({ server });

// keep track of all the connections and which rooms they are in
var clients = [];
var rooms = {};

wss.on('connection', (ws) => {
    var index = clients.push(ws) - 1;
    var userName = false;
    var room = false;

    ws.on('message', (message) => {
        // handle text message
        if (typeof(message) == 'string') {
            // if this is the first message, then it contains room and name info
            if (userName === false) {
                msg = JSON.parse(message)
                userName = msg.name;
                room = msg.room;

                // if this is new rooom, then create it
                if (!(room in rooms)) {
                    rooms[room] = [];
                }
                // add this connection (index) to the room
                rooms[room].push(index);

                // tell all the others in the room that this person has joined
                for (client in rooms[room]) {
                    if (rooms[room][client] != index) {
                        clients[rooms[room][client]].send(userName + ' has joined the room');
                    }
                }

            } else {
                // broadcast text message to everone in the room (including sender)
                for (client in rooms[room]) {
                    clients[rooms[room][client]].send(userName + ': ' + message);
                }
            }

        // send audio data to everyone else
        } else if ('buffer' in message) {
            for (client in rooms[room]) {
                if (rooms[room][client] != index) {
                    clients[rooms[room][client]].send(message);
                }
            }
        }
    });

    ws.on('close', () => {
        // tell all the others in the room that this person has left
        for (client in rooms[room]) {
            if (rooms[room][client] != index) {
                clients[rooms[room][client]].send(userName + ' has left the room');
            }
        }

        // remove this connection (index) from the room
        for (client in rooms[room]) {
            if (rooms[room][client] == index) {
                rooms[room].splice(client, 1);
                break
            }
        }

        // if the room is empty then delete it
        if (rooms[room] && rooms[room].length == 0) {
            delete rooms[room];
        }

        // delete the connection (but keep an empty slot so that the indices don't get messed up)
        delete clients[index];
    });
});
