import { Chess } from 'chess.js'
import React, { useState, useEffect } from 'react'
import io from 'Socket.IO-client'
import { Chessboard } from 'react-chessboard'
let socket: any

const game = new Chess();

let color = "";
let players;
let play = true;
let roomId = -1;

const ChessBoard = () => {
  const [fen, setfen] = useState("start");
  
  useEffect(() => {
    fetch('/api/socket').then(() => {
      socket = io();

      socket.on('connection', () => {
        socket.emit("join", 0);
      })

      socket.on('player', (msg: any) => {
        color = msg.color;
        players = msg.players;
        roomId = msg.roomId;

        if (players == 2) {
          socket.emit('play', msg.roomId);
        }
      })

      socket.on('move', (msg: any) => {
        if (msg.room == roomId) {
          try {
            game.move(msg.move);
            setfen(game.fen());
          } catch (e) {}
        }
      })

      socket.on('play', (msg: any) => {
        if (msg == roomId) {
          console.log('start')
          play = false;
        }
      })
    })
  }, [])

  function makeAMove(move: any) {
    if (play || game.turn() == 'w' && color == 'black' || game.turn() == 'b' && color == 'white') return;
    try {
      game.move(move);
      setfen(game.fen());
      socket.emit('move', {
        move: move,
        board: game.fen(),
        room: roomId
      })
    } catch (e) {
      return null;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    // TODO: Singal an illegal move
    if (move === null) return false;
    return true;
  }

  return (
  <div>
    <Chessboard position={fen} onPieceDrop={onDrop} />
  </div>
  )
}

export default ChessBoard
