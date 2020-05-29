import http from 'http';
import https from 'https';
import fs from 'fs';
import { Server, Socket } from 'socket.io';
import socketIO from 'socket.io';
import { Application } from 'express';
import { connectionHandler, onAuth, onLobbyCreate, onLobbyJoin, onUpdateSinglePlayer, onGetPlayers, onStartGame } from './lobbies';
import { Lobby, Player, RoundOptions } from './lobbies';
// @ts-ignore
import timesyncServer from 'timesync/server';
let io: Server;

/**
 *  This Main constructor converts the instance of express into a HTTP server with all the websocket
 *  functions, events and emitters
 *  You can then listen to this server as normal
 *
 *  @param {Application} app The instance of express
 *  @returns {https.Server} A http server
 */
const sockServer = (app: Application, httpsOn: boolean) => {
  app.use('/timesync', timesyncServer.requestHandler);
  let server;
  // Choosing https or not - untested
  if (httpsOn) {
    server = https.createServer({
      key: fs.readFileSync('server-key.pem'),
      cert: fs.readFileSync('server-cert.pem'),
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
const close = () => {
  io.close();
};

/**
 * Start a round
 * @param lobbyName
 * @param roundOptions
 */
const startRound = (lobbyName: string, roundOptions: RoundOptions) => {
  //  roundOptions.time=30
  roundOptions.timerStart = Date.now() + 4 * 1000;
  io.to(lobbyName).emit('startRound', roundOptions);
  // dont send next to hotseatplayers
  let players = Object.keys(io.nsps['/'].adapter.rooms[lobbyName].sockets);
  console.log('AllPlayers',players)
  players = players.filter((playerId) => playerId !== roundOptions.hotseatPlayers[0].id && playerId !== roundOptions.hotseatPlayers[1].id);
  console.log('newPlayers',players)
  const allQuestions:{id:string,question:string}[] = [];

  for (const player of players) {
    const playerSocket=io.of("/").connected[player];
    const timeTillStart=Date.now()-roundOptions.timerStart
    const timeOut=(timeTillStart>0?timeTillStart:0)+(((roundOptions.time || 30)+ 2) * 1000);
    console.log('Timerout',timeOut)
    setTimeout(
      () =>
        playerSocket.emit('collectQuestions', (data:{ok:boolean,questions: string[]}) => {
          console.log('collected for'+player,data.questions)
          // Delete any extra questions that might get passed in
          if(data.questions.length !== roundOptions.numQuestions)console.error('WRONG QUESTION AMOUNT',data.questions)
          // Push the questions into the array
          for (const newQuestion of data.questions) {
            allQuestions.push({ id: 'socket.id', question: newQuestion });
          }
          if (data.questions.length >= roundOptions.numQuestions * players.length) {
            // Run a return question function
            console.log('done',allQuestions)
          }
        }),
      timeOut
    );
  }
};

const throwToRoom = (lobbyName: string, errorMessage: string) => {
  io.to(lobbyName).emit('gamesockError', errorMessage);
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
};

export { sockServer, close, onAuth, onLobbyCreate, onLobbyJoin, onStartGame, startRound, onUpdateSinglePlayer, onGetPlayers, throwToRoom, Lobby, Player, RoundOptions };
