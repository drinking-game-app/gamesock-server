import http from 'http';
import https from 'https';
import fs from 'fs';
import { Server, Socket } from 'socket.io';
import socketIO from 'socket.io';
import { Application } from 'express';
import { connectionHandler, onAuth, onLobbyCreate, onLobbyJoin, onUpdateSinglePlayer, onGetPlayers, onStartGame, startRound, onDisconnect, onReturnQuestions, onRequestAnswer, onRoundEnd, onAnswerQuestions,onContinueGame, onNoAnswer,startDebugMode,onClaimSocket } from './lobbies';
import { Lobby, Player, RoundOptions, Question } from './lobbies';
// @ts-ignore
import timesyncServer from 'timesync/server';
let io: Server;
import {readFile} from 'fs';


export const startSyncServer = (app:Application) =>{
  app.use('/timesync', timesyncServer.requestHandler);
  return app
}

/**
 *  This Main constructor converts the instance of express into a HTTP server with all the websocket
 *  functions, events and emitters
 *  You can then listen to this server as normal
 *
 *  @param {Application} app The instance of express
 *  @returns {https.Server} A http server
 */
const sockServer = (server: http.Server|https.Server) => {
  readFile('./node_modules/@rossmacd/gamesock-server/package.json', "utf8", (err,data)=>{
        if(err){
          console.log("Gamesock-Client: Could not get version number")
        }else{
          const npmPack = JSON.parse(data)
          console.log(`Gamesock Server: Version ${npmPack.version} initialized`)
        }
  })

  // Initialize Socket IO server
  io = socketIO(server, {
    handlePreflightRequest: (req, res) => {
      const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Origin': req.headers.origin,
        'Access-Control-Allow-Credentials': true,
      };
      res.writeHead(200, headers);
      res.end();
    },
  });
  // Initialize the connection handler
  connectionHandler(io);
  return server;
};

/**
 *  Close socketIO server - Http server will stay on - probably only useful for testing
 *
 */
const close = () => {
  io.close();
};

const throwToRoom = (lobbyName: string, errorMessage: string) => {
  io.to(lobbyName).emit('gamesockError', errorMessage);
};

const kickAll = (lobbyName: string) => {
  const players = Object.keys(io.nsps['/'].adapter.rooms[lobbyName].sockets);
  for (const player of players) {
    io.of('/').connected[player].disconnect();
  }
};
const updatePlayers = (lobbyName: string, players: Player[]) => {
  io.to(lobbyName).emit('getPlayers', players);
};
export default {
  sockServer,
  close,
  onAuth,
  onLobbyCreate,
  onLobbyJoin,
  onStartGame,
  startRound,
  onUpdateSinglePlayer,
  onGetPlayers,
  throwToRoom,
  onReturnQuestions,
  onDisconnect,
  onRequestAnswer,
  onRoundEnd,
  onAnswerQuestions,
  kickAll,
  onContinueGame,
  onNoAnswer,
  startDebugMode,
  onClaimSocket,
  startSyncServer
};

export { sockServer, close, onAuth, onLobbyCreate, onLobbyJoin, onStartGame, startRound, onUpdateSinglePlayer, onGetPlayers, throwToRoom, Lobby, Player, Question, RoundOptions, onReturnQuestions, onDisconnect, onRequestAnswer, onRoundEnd, onAnswerQuestions, kickAll,onContinueGame,updatePlayers,onNoAnswer,
  startDebugMode,onClaimSocket };
