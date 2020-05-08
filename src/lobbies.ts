import { Server, Socket } from 'socket.io';

export interface Lobby {
    id: string;
    name: string;
    players:string[]
  }


const lobbies :Lobby[] = [];




const connectionHandler = (io: Server) => {
    // When a new client connects
    io.on('connection', (socket)=>{
        socket.join('some room');
    });
};

// One server
export default connectionHandler

export{
    lobbies
}