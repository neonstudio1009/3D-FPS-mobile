const io = require('socket.io')(3000, { cors: { origin: "*" } });
const players = {};

io.on('connection', (socket) => {
    // 新玩家連入
    players[socket.id] = { x: 0, y: 1.7, z: 0, rotationY: 0 };
    
    // 廣播給其他玩家有新對手加入
    socket.broadcast.emit('newPlayer', { id: socket.id });

    // 接收玩家位移並轉發
    socket.on('playerMove', (data) => {
        if (players[socket.id]) {
            players[socket.id] = data;
            socket.broadcast.emit('playerMoved', { id: socket.id, data: data });
        }
    });
    // 監聽玩家加入指定房間
    socket.on('join1v1', (roomId) => {
        socket.join(roomId);
        
        // 取得目前房間內的連線人數
        const room = io.sockets.adapter.rooms.get(roomId);
        const numClients = room ? room.size : 0;
    
        // 當房間達到 2 人時，通知雙方遊戲開始，且不生成 Bot
        if (numClients === 2) {
            io.to(roomId).emit('matchReady', { room: roomId });
        }
    });

    // 斷線處理
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerLeft', socket.id);
    });
});
