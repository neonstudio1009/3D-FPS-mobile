const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// 初始化 Socket.IO 並允許跨域 (CORS)
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const players = {};

io.on('connection', (socket) => {
    console.log('玩家已連線:', socket.id);

    // 新增玩家資料
    players[socket.id] = { x: 0, y: 1.7, z: 0, rotationY: 0 };

    // 發送當前所有玩家資訊給新連線的人
    socket.emit('currentPlayers', players);

    // 廣播給其他人有新玩家加入
    socket.broadcast.emit('newPlayer', { id: socket.id });

    // 處理玩家位移
    socket.on('playerMove', (data) => {
        if (players[socket.id]) {
            players[socket.id] = data;
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                x: data.x,
                y: data.y,
                z: data.z,
                rotationY: data.rotationY
            });
        }
    });

    // 斷線處理
    socket.on('disconnect', () => {
        console.log('玩家已離線:', socket.id);
        delete players[socket.id];
        io.emit('playerLeft', socket.id);
    });
});

// 使用 Render 提供動態 Port 或預設 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`伺服器成功執行於 Port ${PORT}`);
});
