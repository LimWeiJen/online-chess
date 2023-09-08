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
  const [orientation, setorientation] = useState<"white" | "black">("white");
  const [waiting, setwaiting] = useState(false);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    return (
      String(hours).padStart(2, '0') +
      ':' +
      String(minutes).padStart(2, '0') +
      ':' +
      String(seconds).padStart(2, '0')
    );
  };

  useEffect(() => {

    fetch('/api/socket').then(() => {
      socket = io();

      socket.on('connection', () => {
        console.log('connected');
      })

      socket.on('player', (msg: any) => {
        color = msg.color;
        players = msg.players;
        roomId = msg.roomId;
        setorientation(msg.color);

        if (players == 2) {
          setwaiting(false);
          socket.emit('play', msg.roomId);
        } else {
          setwaiting(true);
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

      socket.on('gameOver', (msg: any) => {
            if (msg == roomId) {
              console.log("game over");
              play = true;
            }
          })
    })
  }, [])

  function makeAMove(move: any) {
    if (play || game.isGameOver() || game.turn() == 'w' && color == 'black' || game.turn() == 'b' && color == 'white') return;
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
    <button className='btn' onClick={() => socket.emit("join", 0)}>{waiting ? 'Loading...' : 'Play'}</button>
    </div>
  </div>
  )
}

export default ChessBoard
