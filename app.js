const http = require('http');
const ws = require('websocket').server;
const fs = require('fs');
const PORT = process.env.PORT || 3001

// set up HTTP server and serve index.html
const httpServer = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(fs.readFileSync('index.html'));
}).listen(PORT);

// set up websocket server
const wss = new ws({httpServer: httpServer});

// keep track of all the connections and which rooms they are in
var clients = [];
var rooms = {};

wss.on('request', function(req) {
    const connection = req.accept(null, req.origin);
    var index = clients.push(connection) - 1;
    var userName = false;
    var room = false;

    connection.on('message', function(message) {
        // handle text message
        if (message.type == 'utf8') {
            // if this is the first message, then it contains room and name info
            if (userName === false) {
                msg = JSON.parse(message.utf8Data)
                userName = msg.name;
                room = msg.room;
                console.log(userName + " in room " + room);

                // if this is new rooom, then create it
                if (!(room in rooms)) {
                    rooms[room] = [];
                }
                // add this connection (index) to the room
                rooms[room].push(index);

                // tell all the others in the room that this person has joined
                for (client in rooms[room]) {
                    if (rooms[room][client] != index) {
                        clients[rooms[room][client]].sendUTF(userName + ' has joined the room');
                    }
                }

            } else {
                // broadcast text message to everone in the room (including sender)
                for (client in rooms[room]) {
                    clients[rooms[room][client]].sendUTF(userName + ': ' + message.utf8Data);
                }
            }
            
        // send audio data to everyone else
        } else if (message.type === 'binary') {
            for (client in rooms[room]) {
                if (rooms[room][client] != index) {
                    clients[rooms[room][client]].sendBytes(message.binaryData);
                }
            }
        }
    });
        
    connection.on('close', function(connection) {
        // tell all the others in the room that this person has left
        for (client in rooms[room]) {
            if (rooms[room][client] != index) {
                clients[rooms[room][client]].sendUTF(userName + ' has left the room');
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
        if (rooms[room].length == 0) {
            delete rooms[room];
        }

        // delete the connection (but keep an empty slot so that the indices don't get messed up)
        delete clients[index];
    });
});
