import { Server } from 'Socket.IO'
import { v4 as uuidv4 } from 'uuid';

// map to store the data of various ongoing games
var games = new Map();

// keep track of the current game id (will increment after each game is created)
var i = 0;

// map to track connected players
var ps = new Map();
 
const SocketHandler = (_: any, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      socket.emit('connection')

      // when the socket is connected by a player, generate a unique ID for the player
      var playerId = uuidv4();
      console.log(playerId + 'connected');

      // triggers when the player clicks the "play" button on the client
      socket.on('join', () => {
        // check if the player has clicked the "play" button before
        if (ps.has(playerId)) return;
        ps.set(playerId, true);

        // check if there is an available game slot with less than 2 players
        if (games.has(i) && games.get(i).players < 2) {
          var g = games.get(i);
          g.players++;
          g.pid[1] = playerId;
          games.set(i, g);
        } else {
          // if no available slot, create a new game
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

        // emit 'player' event to the current socket with player information
        socket.emit("player", {
          playerId, players, color, roomId: i
        })
      })

      // Broadcast 'move' event to other connected sockets
      socket.on('move', (msg) => socket.broadcast.emit('move', msg));

      // Broadcast 'play' event to other connected sockets
      socket.on("play", (msg) => socket.broadcast.emit('play', msg));

      // Handle 'gameOver' event
      socket.on('gameOver', (roomId) => {
        // Remove the game from the map
        games.delete(roomId);
        // Broadcast 'gameOver' event to other connected sockets
        socket.broadcast.emit('gameOver', roomId);
      })

      // Handle 'disconnect' event
      socket.on('disconnect', function () {
        console.log(playerId + ' disconnected');
      });
    })
  }
  res.end()
}

export default SocketHandler
