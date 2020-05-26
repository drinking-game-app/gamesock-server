import http from 'http';
import https from 'https';
import fs from 'fs';
import { Server, Socket } from 'socket.io';
import socketIO from 'socket.io';
import { Application } from "express";
import { connectionHandler, onAuth, onLobbyCreate, onLobbyJoin, onPlayerReady, onUpdateSinglePlayer, onGetPlayers, onStartGame } from './lobbies'
import {Lobby, Player} from './lobbies'
let io:Server;

/**
 *  This Main constructor converts the instance of express into a HTTP server with all the websocket
 *  functions, events and emitters
 *  You can then listen to this server as normal
 *
 *  @param {Application} app The instance of express
 *  @returns {https.Server} A http server
 */
const sockServer = (app: Application, httpsOn:boolean) => {
  let server;
  // Choosing https or not - untested
  if (httpsOn) {
    server = https.createServer({
      key: fs.readFileSync('server-key.pem'),
      cert: fs.readFileSync('server-cert.pem')
    });
  } else {
    server = new http.Server(app);
  }

  // Initialize Socket IO server
  io = socketIO(server);
  // Initialize the connection handler
  connectionHandler(io);
  return server;
};

/**
 *  Close socketIO server - Http server will stay on - probably only useful for testing
 *
 */
const close =()=>{io.close()}

/**
 * Tells the players to start  the game
 * @param {string} lobbyName The lobby to start
 */
// const startGame=(lobbyName:string)=>{
//   const gameSettings={
//     rounds:10,
//   }
//   io.to(lobbyName).emit('startGame');
// }

const startRound=(lobbyName:string,roundNum:number)=>{
  io.to(lobbyName).emit('startRound', roundNum);
}

const throwToRoom=(lobbyName:string,errorMessage:string)=>{
  io.to(lobbyName).emit('gamesockError', errorMessage)
}

export default{
  sockServer,
  close,
  onAuth,
  onLobbyCreate,
  onLobbyJoin,
  onPlayerReady,
  onStartGame,
  startRound,
  onUpdateSinglePlayer,
  onGetPlayers,
  throwToRoom
}

export {
  sockServer,
  close,
  onAuth,
  onLobbyCreate,
  onLobbyJoin,
  onPlayerReady,
  onStartGame,
  startRound,
  onUpdateSinglePlayer,
  onGetPlayers,
  throwToRoom,
  Lobby,
  Player,
}