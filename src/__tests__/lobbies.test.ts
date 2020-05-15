import express, { Application, Request, Response } from 'express';
import gamesock from '../server';
// JavaScript socket.io code
import ioClient from 'socket.io-client';
import http from 'http';
let clientSocket: SocketIOClient.Socket;

let server:http.Server;

/**
 * Setup WS & HTTP servers
 */
beforeAll((done) => {
  const app: Application = express();
  // Start gamesock server
  server = gamesock.sockServer(app,false);
  server.listen(8000, () => {
    console.info('Server started on port %s.', 8000)
  })
  .on("error", (err: any) => {
    console.error("Server Error: ", err)
  })
  done();
});

afterAll((done) => {
  server.close();
  gamesock.close();
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
  if (clientSocket.connected) {
    clientSocket.disconnect();
  }
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
    gamesock.onAuth((token: string) => {
      return false;
    });
    clientSocket.emit('createLobby', 'test');
    clientSocket.once('message', (msgData: Message) => {
      expect(msgData.ok).toBe(false);
      done();
    });
  });
});

