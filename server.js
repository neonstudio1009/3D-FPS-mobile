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

    // 斷線處理
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerLeft', socket.id);
    });
});
