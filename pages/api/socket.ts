import { Server } from 'Socket.IO'
import { v4 as uuidv4 } from 'uuid';

var games = new Map();
var i = 0;

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
      var playerId = uuidv4();
      console.log(playerId + 'connected');

      socket.on('join', () => {
        if (ps.has(playerId)) return;
        ps.set(playerId, true);

        if (games.has(i) && games.get(i).players < 2) {
          var g = games.get(i);
          g.players++;
          g.pid[1] = playerId;
          games.set(i, g);
        } else {
          i++;
          games.set(i, {
            players: 1,
            pid: [playerId, -1]
          })
        }

        var players = games.get(i).players;
        var color = "white";
        if (players % 2 == 0) color = "black"

        console.log(games.get(i));

        socket.emit("player", {
          playerId, players, color, roomId: i
        })
      })

      socket.on('move', (msg) => socket.broadcast.emit('move', msg));

      socket.on("play", (msg) => socket.broadcast.emit('play', msg));

      socket.on('gameOver', (roomId) => {
        games.delete(roomId);
        socket.broadcast.emit('gameOver', roomId);
      })

      // if a user disconnects just print their playerID
      socket.on('disconnect', function () {
        //TODO: come up with a disconnect protocol
        console.log(playerId + ' disconnected');
      });
    })
  }
  res.end()
}

export default SocketHandler
