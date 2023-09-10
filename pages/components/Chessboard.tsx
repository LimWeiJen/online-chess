import { Chess } from 'chess.js'
import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { Chessboard } from 'react-chessboard'
let socket: any

const game = new Chess();

let color = "";
let players;
let playing = false;
let roomId = -1;

const ChessBoard = () => {
  const [fen, setfen] = useState("start"); // current position of the chessboard
  const [orientation, setorientation] = useState<"white" | "black">("white"); // orientation of the chess board
  const [waiting, setwaiting] = useState(false); // flag indicating if the game is waiting for players
  const [hidetimer, sethidetimer] = useState(false); // flag indicating whether to hide the timer

  // function to join the game
  const joinGame = () => {
    if (roomId === -1) {
      // if the user hasn't joined any games, join a new game
      socket.emit("join");
    } else {
      // else reload the page
      window.location.reload();
    }
  }
  
  useEffect(() => {
    // fetch the socket endpoint
    fetch('/api/socket').then(() => {
      socket = io(); // initialize the socket connection

      // event listener for 'connection' event
      socket.on('connection', () => {
        console.log('connected');
      })

      // event listener for 'player' event
      socket.on('player', (msg: any) => {
        color = msg.color;
        players = msg.players;
        roomId = msg.roomId;
        setorientation(msg.color);

        // if there are two players in the game, start the game
        if (players == 2) {
          setwaiting(false);
          socket.emit('play', msg.roomId);
        } else {
          // if only one player, set waiting to be true, indicating that we're waiting for another player to join the same game
          setwaiting(true);
        }
      })

      socket.on('move', (msg: any) => {
        if (msg.room == roomId) {
          try {
            game.move(msg.move); // make the move on the chessboard
            setfen(game.fen()); // update the fen state
          } catch (e) {}
        }
      })

      // start the game
      socket.on('play', (msg: any) => {
        if (msg == roomId) {
          console.log('start')
          playing = true;
          setwaiting(false);
          sethidetimer(true);
        }
      })

      // stop the game
      socket.on('gameOver', (msg: any) => {
        if (msg == roomId) {
          console.log("game over");
          playing = false;
          sethidetimer(false);
        }
      })
    })
  }, [])

  // function to make a move
  function makeAMove(move: any) {
    if (!playing || game.isGameOver() || game.turn() == 'w' && color == 'black' || game.turn() == 'b' && color == 'white') return;
    try {
      game.move(move);
      setfen(game.fen());
      socket.emit('move', {
        move: move,
        board: game.fen(),
        room: roomId
      })
      if (game.isGameOver()) {
        socket.emit('gameOver', roomId);
      }
    } catch (e) {
      return null;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;
    return true;
  }

  return (
  <div className='chssboard'>
    <div className='board'>
    <Chessboard position={fen} onPieceDrop={onDrop} boardOrientation={orientation} boardWidth={500} />
    </div>
    <div className='menu'>
    {hidetimer ? null :
    <button className='btn' onClick={joinGame}>{waiting ? 'Loading...' : 'Play'}</button> }
    </div>
  </div>
  )
}

export default ChessBoard
