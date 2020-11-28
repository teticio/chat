/*
TODO
- on leaving room, remove client from room NOT WORKING
- if room empty, delete room NOT WORKING
- run node on apache
- add audio messages
*/

const http = require('http');
const ws = require('websocket').server;
const fs = require('fs');

const httpServer = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(fs.readFileSync('index.html'));
}).listen(3001);

const wss = new ws({httpServer: httpServer});

var clients = [];
var rooms = {};

wss.on('request', function(req) {
    const connection = req.accept(null, req.origin);
    var index = clients.push(connection) - 1;
    var userName = false;
    var room = false;

    connection.on('message', function(message) {
        if (message.type == 'utf8') {
            if (userName === false) {
                msg = JSON.parse(message.utf8Data)
                userName = msg.name;
                room = msg.room;
                if (!(room in rooms)) {
                    rooms[room] = [];
                }
                rooms[room].push(index);

                for (client in rooms[room]) {
                    if (rooms[room][client] != index) {
                        clients[rooms[room][client]].sendUTF(userName + ' has joined the room');
                    }
                }

            } else {
                for (client in rooms[room]) {
                    clients[rooms[room][client]].sendUTF(userName + ': ' + message.utf8Data);
                }
            }
        }
    });
        
    connection.on('close', function(connection) {
        for (client in rooms[room]) {
            if (rooms[room][client] != index) {
                clients[rooms[room][client]].sendUTF(userName + ' has left the room');
            }
        }

        for (client in rooms[room]) {
            if (rooms[room][client] == index) {
                rooms[room].splice(client, 1);
                break
            }
        }

        if (rooms[room].length == 0) {
            delete rooms[room];
        }

        delete clients[index];
    });
});