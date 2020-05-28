import { Server, Socket } from 'socket.io';
import { gameFunctions } from './game';

/**
 * The lobby object
 */
export interface Lobby {
  readonly name: string;
  // If round is 0 game has not started
  round: 0;
  // Host will always be players[0]
  players: Player[];
}

export interface Player {
  // socketIO id
  readonly id: string;
  name: string;
  score: number;
}

export type RoundOptions = {
  // Current round number
  roundNum:number;
  // Players picked to be in the hotseat
  hotseatPlayers: [Player,Player];
  // Number of questions to answer
  numQuestions:number;
  // // Time to fill in questions in seconds
  time?:number
  // // Time to start first timer: Date.now foramt
  timerStart?:number
};

export type GameSettings = { rounds: number };

export type AuthFn = (authToken: string) => boolean;
export type LobbyCreateFn = (lobby: Lobby) => boolean;
export type LobbyJoinFn = (lobbyName: string, player: Player) => Player[];
export type CallbackFunction = (data: any, error?: string) => void;
export type UpdateSinglePlayerFn = (lobbyName: string, player: Player) => Player | null;
export type GetPlayersFn = (lobbyName: string) => Player[] | null;
export type StartGameFn = (lobbyName: string, socketId: string) => { ok: boolean; gameSettings: GameSettings };
// export type StartRoundFn = () => { roundOptions: RoundOptions };

/*
----- The over-writable functions
*/
// Set Authorize function defaults to true
let authorizeFn: AuthFn = (authToken) => true;
let onLobbyCreateFn: LobbyCreateFn = (lobby) => true;
let onLobbyJoinFn: LobbyJoinFn = (lobbyName, player) => [];
let onUpdateSinglePlayerFn: UpdateSinglePlayerFn = (lobbyName, player) => null;
let onGetPlayersFn: GetPlayersFn = (lobbyName) => null;
let onStartGameFn: StartGameFn = (lobbyName, socketId) => {
  return { ok: true, gameSettings: { rounds: 10 } };
};
// let onStartRoundFn: StartRoundFn = () => {
//   return {
//     roundOptions: {
//       roundNum: 1,
//       hotseatPlayers: [1,1],
//       numQuestions: 5,
//     }
//   }
// };

/**
 * Takes in a function to verify the authToken passed to the server. This function will run before a lobby is created
 * @param {AuthFn} authenticateFn The function which will verify the token that is passed to the server
 */
export const onAuth = (authCheckFunction: AuthFn) => {
  authorizeFn = authCheckFunction;
};

/**
 * Takes in a function to run when a lobby is created
 * @param {LobbyCreateFn} createFunction The lobby can be accessed from this function, returns a boolean to allow lobby creation or not
 */
export const onLobbyCreate = (createFunction: LobbyCreateFn) => {
  onLobbyCreateFn = createFunction;
};

/**
 * Takes in a function to run when a lobby is joined by a player
 * @param {LobbyJoinFn} joinFunction The lobby name and joined player can be accessed from this function, it returns the list of players
 */
export const onLobbyJoin = (joinFunction: LobbyJoinFn) => {
  onLobbyJoinFn = joinFunction;
};

/**
 * Takes in a function to run when a single player is updated
 * This function takes in the lobby name and player, it returns the updated player
 * @param {UpdateSinglePlayerFn} updateSinglePlayerFunction
 */
export const onUpdateSinglePlayer = (updateSinglePlayerFunction: UpdateSinglePlayerFn) => {
  onUpdateSinglePlayerFn = updateSinglePlayerFunction;
};

/**
 * Takes in a function to run when a list of players in a lobby needs to be returned
 * This function takes in the lobby name, it returns the list of players in that lobby
 * @param {GetPlayersFn} getPlayersFunction
 */
export const onGetPlayers = (getPlayersFunction: GetPlayersFn) => {
  onGetPlayersFn = getPlayersFunction;
};

/**
 * Takes in a function to run when the host starts a game
 * This function takes in the lobby name and socket ID, it returns a boolean to allow game creation or not
 * @param {StartGameFn} startGameFunction
 */
export const onStartGame = (startGameFunction: StartGameFn) => {
  onStartGameFn = startGameFunction;
};

// /**
//  * Takes in a function to run when a round is to start
//  * This function takes in no parameters, it returns the round options
//  * @param {StartRoundFn} startRoundFunction
//  */
// export const onStartRound = (startRoundFunction: StartRoundFn) => {
//   onStartRoundFn = startRoundFunction;
// };

/**
 * @private
 * This function sets up the functionality for new connections
 *
 * @param {Server} io The SocketIo server which is being connected to
 */
export const connectionHandler = (io: Server) => {
  // When a new client connects
  io.on('connection', (socket: Socket) => {
    socket.on('joinLobby', (lobbyName: string, callback: CallbackFunction) => {
      joinLobby(lobbyName, socket, io, callback);
    });

    socket.on('createLobby', (lobbyName: string, authToken: string, callback: CallbackFunction) => {
      // The authorization function is overwritten by the users of the library
      // @HOOK
      if (authorizeFn(authToken)) {
        const lobby: Lobby = {
          name: lobbyName,
          round: 0,
          players: [],
        };
        // Run on lobby create function - Code for this is written on server
        // @HOOK
        if (onLobbyCreateFn(lobby)) {
          // Join the created Lobby
          joinLobby(lobbyName, socket, io, callback);
        } else {
          returnError(`Could not create lobby`, socket);
        }
      } else {
        console.log('Unauthorized');
        // Return an error to the player when not authorized
        returnError(`${socket.id} is not authorized to create rooms`, socket);
      }
    });

    socket.on('updateSelf', (lobbyName: string, player: Player) => {
      const playerObj = onUpdateSinglePlayerFn(lobbyName, player);
      if (playerObj == null) {
        console.error('Error: 🤯 Please implement the onUpdateSinglePlayer');
      } else if (socket.id !== player.id) {
        console.error(`Error: HACKER ALERT; ${socket.id} Tried  to edit ${player.id}`);
      } else {
        // io.to(lobbyName).emit('getPlayers', players);
        io.to(lobbyName).emit('playerUpdated', playerObj);
      }
    });

    socket.on('getPlayers', (lobbyName: string) => {
      const players = onGetPlayersFn(lobbyName);
      if (players == null) {
        console.error('Error: 🤯 Please implement the onGetPlayers');
      } else {
        console.log('Sending player list');
        io.to(lobbyName).emit('getPlayers', players);
      }
    });

    socket.on('startGame', (lobbyName: string) => {
      const options = onStartGameFn(lobbyName, socket.id);

      if (options.ok) {
        io.to(lobbyName).emit('startGame', options.gameSettings);
      } else {
        returnError('Could not start game', socket);
      }
    });
  });
};






/**
 * @private
 * Function to join a specific lobby
 *
 * @param {string} lobbyName The string that contains the lobby name to join
 * @param {Socket} socket The socket which is joining
 * @param {Server} io The IO server
 */
const joinLobby = (lobbyName: string, socket: Socket, io: Server, callback: CallbackFunction) => {
  // Default player passed through to server
  const player: Player = {
    id: socket.id,
    name: 'Guest',
    score: 0,
  };
  // Run server code for joining a lobby
  // @HOOK
  const players = onLobbyJoinFn(lobbyName, player);
  if (players.length !== 0) {
    // Join the Lobby
    socket.join(lobbyName);
    // Announce player has joined
    io.to(lobbyName).emit('message', {
      ok: true,
      msg: `${socket.id} has just joined ${lobbyName}`,
    });
    callback(players);
    io.to(lobbyName).emit('getPlayers', players);
  } else {
    returnError(`${lobbyName} does not exist 😕, check the lobby and try again!`, socket);
  }
};

const returnError = (message: string, socket: Socket) => {
  socket.emit('message', {
    ok: false,
    msg: message,
  });
};

export default { connectionHandler, onAuth, onLobbyCreate, onLobbyJoin, onUpdateSinglePlayer, onGetPlayers, onStartGame };
