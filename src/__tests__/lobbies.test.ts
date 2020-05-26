import express, { Application, Request, Response } from 'express';
import {sockServer,close,onAuth,onLobbyCreate,onLobbyJoin} from '../server';
// JavaScript socket.io code
import ioClient from 'socket.io-client';
import http from 'http';
import { Lobby, Player } from '../lobbies';
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
// test
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
    onAuth((token: string) => {
      return true;
    });
    onLobbyCreate((newLobby)=>{
      return true
    })
    onLobbyJoin((lobbyName, player)=>{
      return[{
        id: clientSocket.id,
        name: 'Guest',
        score: 0,
      },]
    })

    clientSocket.emit('createLobby', 'lobbyName', 'authToken', (players:Player[])=>{
      expect(players[0]).toStrictEqual({
          id: clientSocket.id,
          name: 'Guest',
          score: 0,
        });
      done();
  });
  });

  test('Function returns false', (done) => {
    // override auth function
    onAuth((token: string) => {
      return false;
    });
    clientSocket.emit('createLobby', 'lobbyName', 'authToken', (players:Player[])=>{
      //
      });
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
    return myLobbies[plIndex].players
  })
    clientSocket.emit('createLobby', 'lobbyName', 'authToken', (players:Player[])=>{
        expect(players[0]).toStrictEqual({
            id: clientSocket.id,
            name: 'Guest',
            score:0,
          });
      done();
    });
    });
});

describe('onLobbyJoin', () => {
  test('OnJoin', (done) => {
    onAuth((token: string) => {
      return true;
    });
    onLobbyCreate((newLobby)=>{
      return true
    })
    onLobbyJoin((lobbyName, player)=>{
      return[{
        id: "whocares",
        name: 'whocares',
        score:10,
      },{
        id: clientSocket.id,
        name: 'Guest',
        score:0,
      }]
    })
    clientSocket.emit('joinLobby', 'test', (players:Player[])=>{
      expect(players[1]).toStrictEqual({
        id: clientSocket.id,
        name: 'Guest',
        score:0,
      });
    done();
      });
  });
})

// describe('playerReadyEmit', () => {
//   test('playerReadyEmit', (done) => {
//     const readyLobby='test';
//     clientSocket.emit('joinLobby', 'test', (players:Player[])=>{
//       //
//       });
//     clientSocket.emit('playerReady', readyLobby);
//     clientSocket.once('message',(msg1:Message)=>{
//       clientSocket.once('message', (msgData: Message) => {
//         expect(msgData.msg).toBe(`${clientSocket.id} in ${readyLobby} is now ready`);
//         done();
//       })
//     ;})
//   });
// })

describe('startGame', () => {
  test('startGameEmit', (done) => {
    const readyLobby='test';
    clientSocket.emit('joinLobby', readyLobby, (player:Player)=>{
      //
      });
    clientSocket.emit('startGame', readyLobby);
    // clientSocket.once('message',(msg1:Message)=>{
    //   clientSocket.once('message', (msgData: Message) => {
    //     expect(msgData.msg).toBe(`${clientSocket.id} in ${readyLobby} is now ready`);
    //     done();
    //   })
    // ;})
    clientSocket.once('startGame',(gameOptions:any)=>{
      expect(gameOptions.rounds).toBe(10);
      done();
    })
  });
})
