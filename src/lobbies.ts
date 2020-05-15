import { Server, Socket } from 'socket.io';
let tempId = 0;
export interface Lobby {
  id: number;
  name: string;
  players: Player[];
}


export interface Player {
  // socketIO id
  id: string;
  uId:string;
  name: string;
}

const lobbies: Lobby[] = [];

// Set Authorize function defaults to true
let authorize: (authToken: string) => boolean = (authToken) => true;
// Setter for the authenticate function
export const onAuth = (authenticateFn: (authToken: string) => boolean) => {
  authorize = authenticateFn;
};

export const joinLobby = (socket: Socket, room: string, io: Server) => {
  socket.join(room);
  io.to(room).emit('message', {
    ok: true,
    msg: `${socket.id} has just joined ${room}`,
  });
};

export const connectionHandler = (io: Server) => {
  // When a new client connects
  io.on('connection', (socket: Socket) => {
    socket.on('joinLobby', (lobbyName: string) => {
      joinLobby(socket, lobbyName, io);
    });

    socket.on('createLobby', (lobbyName: string, authToken: string) => {
      // The authorization function is overwritten by the users of the library
      if (authorize(authToken)) {
        // Create lobby with player inside
        const lobby = {
          id: tempId,
          name: lobbyName,
          players: [
            {
              id: socket.id,
              uId:"",
              name: 'test',
            },
          ],
        };
        lobbies[lobby.id] = lobby;
        tempId++;
        joinLobby(socket, lobbyName, io);
      } else {
        socket.emit('message', {
          ok: false,
          msg: `${socket.id} is not authorized to create rooms`,
        });
      }
    });
  });
};

// One server
// export default connectionHandler;

export default { connectionHandler, onAuth};
