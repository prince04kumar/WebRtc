const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000 ;
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push(socket.id);

        if (rooms[roomId].length === 2) {
            io.to(rooms[roomId][0]).emit('createOffer');
        }
    });

    socket.on('signal', (data) => {
        if (data.roomId) {
            socket.to(data.roomId).emit('signal', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
            if (rooms[roomId].length === 0) delete rooms[roomId];
        }
    });
});
server.listen(PORT, () => {
  console.log('Server running on http://localhost:3000');
});
