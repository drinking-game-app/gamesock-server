import { Server, Socket } from 'socket.io';

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
  ready: boolean;
}

export type AuthFn = (authToken: string) => boolean;
export type LobbyCreateFn = (lobby: Lobby) => boolean;
export type LobbyJoinFn = (lobbyName: string, player: Player) => boolean;

/*
----- The over-writable functions
*/
// Set Authorize function defaults to true
let authorizeFn: AuthFn = (authToken) => true;
let onLobbyCreateFn: LobbyCreateFn = (lobby) => true;
let onLobbyJoinFn: LobbyJoinFn = (lobbyName, player) => true;

/**
 * Takes in a function to verify the authToken passed to the server. This function will run before a lobby is created
 * @param authenticateFn The function which will verify the token that is passed to the server
 */
export const onAuth = (authCheckFunction:AuthFn) => {
  authorizeFn = authCheckFunction;
};

/**
 * Takes in a function to run when a lobby is created
 * @param createFunction This function will run when a lobby is created. The lobby can be accessed from this function
 */
export const onLobbyCreate = (createFunction: LobbyCreateFn) => {
  onLobbyCreateFn = createFunction;
};

/**
 * Takes in a function to run when a lobby is joined by a player
 * @param joinFunction This function will run when a lobby is joined. The lobby name and joined player can be accessed from this function
 */
export const onLobbyJoin = (joinFunction: LobbyJoinFn) => {
  onLobbyJoinFn = joinFunction;
};

/**
 * @private
 * This function sets up the functionality for new connections
 *
 * @param io The SocketIo server which is being connected to
 */
export const connectionHandler = (io: Server) => {
  // When a new client connects
  io.on('connection', (socket: Socket) => {
    socket.on('joinLobby', (lobbyName: string) => {
      joinLobby(lobbyName, socket, io);
    });

    socket.on('createLobby', (lobbyName: string, authToken: string) => {
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
        onLobbyCreateFn(lobby);
        // Join the created Lobby
        joinLobby(lobbyName, socket, io);
      } else {
        console.log("Unauthorized")
        // Return an error to the player when not authorized
        returnError(`${socket.id} is not authorized to create rooms`, socket);
      }
    });
  });
};

/**
 * @private
 * Function to join a specific lobby
 *
 * @param lobbyName The string that contains the lobby name to join
 * @param socket The socket which is joining
 * @param io The IO server
 */
const joinLobby = (lobbyName: string, socket: Socket, io: Server) => {
  // Default player passed through to server
  const player: Player = {
    id: socket.id,
    name: 'Guest',
    ready: false,
  };
  // Run server code for joining a lobby
  // @HOOK
  onLobbyJoinFn(lobbyName, player);

  // Join the Lobby
  socket.join(lobbyName);
  // Announce player has joined
  io.to(lobbyName).emit('message', {
    ok: true,
    msg: `${socket.id} has just joined ${lobbyName}`,
  });
};

const returnError = (message: string, socket: Socket) => {
  socket.emit('message', {
    ok: false,
    msg: message,
  });
};

export default { connectionHandler, onAuth, onLobbyCreate, onLobbyJoin };