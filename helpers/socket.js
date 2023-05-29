module.exports = function (server) {
    global.io = require('socket.io')(server);
    io.on('connection', (socket) => {
        //socket join with a room passsed as a query.RoomID
        socket.join(socket.handshake.query.RoomID);
    });
}