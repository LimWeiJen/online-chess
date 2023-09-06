import { Server } from 'Socket.IO'

var games = Array(100);
for (let i = 0; i < 100; i++) {
    games[i] = {players: 0 , pid: [0 , 0]};
}

var ps = new Map();
 
const SocketHandler = (req: any, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      socket.emit('connection')
      var playerId = Math.floor((Math.random() * 100) + 1)
      console.log(playerId + 'connected');

      socket.on('join', (i) => {
        if (games[i].players < 2 && !ps.has(playerId)) {
          ps.set(playerId, true);
          games[i].players++;
          games[i].pid[games[i].players - 1] = playerId;
        } else {
          socket.emit("full", i);
        }
        var players = games[i].players;
        var color = "white";
        if (players % 2 == 0) color = "black"

        console.log(games[i]);

        socket.emit("player", {
          playerId, players, color, roomId: i
        })
      })

      socket.on('move', (msg) => socket.broadcast.emit('move', msg));

      socket.on("play", (msg) => socket.broadcast.emit('play', msg));

      // if a user disconnects just print their playerID
      socket.on('disconnect', function () {
        for (let i = 0; i < 100; i++) {
          if (games[i].pid[0] == playerId || games[i].pid[1] == playerId)
            games[i].players--;
        } 
        console.log(playerId + ' disconnected');
      });
    })
  }
  res.end()
}

export default SocketHandler
