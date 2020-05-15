import http from 'http';
import https from 'https';
import fs from 'fs';
import { Server, Socket } from 'socket.io';
import socketIO from 'socket.io';
import { Application } from "express";
import {connectionHandler, onAuth} from './lobbies'



let io:Server;

/**
 *  This Main constructor converts the instance of express into a HTTP server with all the websocket
 *  functions, events and emitters
 *  You can then listen to this server as normal
 *
 *  @param app The instance of express
 *  @returns A http server
 */
const sockServer = (app: Application, httpsOn:boolean) => {
  let server;
  // Choosing https or not - untested
  if (httpsOn) {
    server = https.createServer({
      key: fs.readFileSync('server-key.pem'),
      cert: fs.readFileSync('server-cert.pem')
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
 *  Close socketIO server - Http server will stay on
 *
 */
const close =()=>{io.close()}

export default{
  sockServer,
  onAuth,
  close
}
