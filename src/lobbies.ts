import { Server, Socket } from 'socket.io';

export interface Lobby {
  id: number;
  name: string;
  players: Player[];
}

export interface Player {
  // socketIO id
  id: string;
  uId: string;
  name: string;
}

const lobbies: Lobby[] = [];

// Set Authorize function defaults to true
let authorize: (authToken: string) => boolean = (authToken) => true;
// Setter for the authenticate function
const onAuth = (authenticateFn: (authToken: string) => boolean) => {
  console.log('switching auth fn');
  authorize = authenticateFn;
};

const joinLobby = (socket: Socket, room: string, io: Server) => {
  socket.join(room);
  io.to(room).emit('message', `${socket.id} has just joined ${room}`);
};

const connectionHandler = (io: Server) => {
  // When a new client connects
  io.on('connection', (socket: Socket) => {
    console.log('Connected');
    socket.on('joinLobby', (roomName: string) => {
      joinLobby(socket, roomName, io);
    });

    socket.on('createLobby', (roomName: string, authToken: string) => {
      console.log('Created');
      // The authorization function is overwritten by the users of the library
      if (authorize(authToken)) {
        const lobby = {
          id: 123123,
          name: roomName,
          players: [],
        };
        lobbies[lobby.id] = lobby;
        joinLobby(socket, roomName, io);
      } else {
        socket.emit('message', `${socket.id} is not authroized to create rooms`);
      }
      //   callback();
    });
  });
};

// One server
// export default connectionHandler;

export default { connectionHandler, lobbies, onAuth, authorize };
