import express, { Application, Request, Response } from 'express';
import {sockServer,close,onAuth,onLobbyCreate,onLobbyJoin} from '../server';
// JavaScript socket.io code
import ioClient from 'socket.io-client';
import http from 'http';
import lobbies, { Lobby, onPlayerReady } from '../lobbies';
let clientSocket: SocketIOClient.Socket;

let server:http.Server;
let myLobbies:Lobby[]=[];

/**
 * Setup WS & HTTP servers
 */
beforeAll((done) => {
  const app: Application = express();
  // Start gamesock server
  server = sockServer(app,false);
  server.listen(8000, () => {
    console.info('Server started on port %s.', 8000)
  })
  .on("error", (err: any) => {
    console.error("Server Error: ", err)
  })
  myLobbies=[]
  done();
});

afterAll((done) => {
  server.close();
  close();
  done();
});

beforeEach((done) => {
  // Setup
  clientSocket = ioClient.connect(`http://localhost:8000`, {
    transports: ['polling', 'websocket'],
  });
  clientSocket.on('connect', () => {
    done();
  });
});

/**
 * Run after each test
 */
afterEach((done) => {
  // Cleanup
    clientSocket.close();
  done();
});

export interface Message {
  ok: boolean;
  msg: string;
}

describe('onAuth', () => {
  test('Default Function', (done) => {
    clientSocket.emit('createLobby', 'test');
    clientSocket.once('message', (msgData: Message) => {
      expect(msgData.ok).toBe(true);
      done();
    });
  });

  test('Function returns false', (done) => {
    // override auth function
    onAuth((token: string) => {
      return false;
    });
    clientSocket.emit('createLobby', 'test');
    clientSocket.once('message', (msgData: Message) => {
      expect(msgData.ok).toBe(false);
      done();
    });
  });
});

describe('onLobbyCreate', () => {
  test('OnCreate', (done) => {
    onAuth((token: string) => {
      return true;
    });
    // Push lobby into local array
    onLobbyCreate((newLobby)=>{
      myLobbies.push(newLobby);
      return true
    })
  // Push player into their lobby
  onLobbyJoin((lobbyName, player)=>{
    const plIndex = myLobbies.findIndex(lobby=>lobby.name===lobbyName);
    myLobbies[plIndex].players.push(player);
    return true
  })
    clientSocket.emit('createLobby', 'test');
    clientSocket.once('message', (msgData: Message) => {
      expect(myLobbies[0]).toStrictEqual({
          name: "test",
          round: 0,
          players: [{
            id: clientSocket.id,
            name: 'Guest',
            ready: false,
          }],
        });
      done();
    });
  });
});

describe('onLobbyJoin', () => {
  test('OnJoin', (done) => {
    clientSocket.emit('joinLobby', 'test');
    clientSocket.once('message', (msgData: Message) => {
      expect(myLobbies[0].players[1]).toStrictEqual({
          id: clientSocket.id,
          name: 'Guest',
          ready: false,
        });
      done();
    });
  });
})

describe('playerReadyEmit', () => {
  test('playerReadyEmit', (done) => {
    const readyLobby='test';
    clientSocket.emit('joinLobby',readyLobby)
    clientSocket.emit('playerReady', readyLobby);
    clientSocket.once('message',(msg1:Message)=>{
      clientSocket.once('message', (msgData: Message) => {
        expect(msgData.msg).toBe(`${clientSocket.id} in ${readyLobby} is now ready`);
        done();
      })
    ;})
  });
})

describe('startGame', () => {
  test('startGameEmit', (done) => {
    onPlayerReady((lobbyName:string, playerId:string)=>{
      return 0
    })
    const readyLobby='test';
    clientSocket.emit('joinLobby',readyLobby)
    clientSocket.emit('playerReady', readyLobby);
    // clientSocket.once('message',(msg1:Message)=>{
    //   clientSocket.once('message', (msgData: Message) => {
    //     expect(msgData.msg).toBe(`${clientSocket.id} in ${readyLobby} is now ready`);
    //     done();
    //   })
    // ;})
    clientSocket.once('playerReady',(playerNum:number)=>{
      expect(playerNum).toBe(0);
      done();
    })
  });
})
