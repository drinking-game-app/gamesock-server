import http from 'http';
import { Server, Socket } from 'socket.io';
import socketIO from 'socket.io';
import { Application } from "express";
import lobbies from './lobbies'



let io:Server;
/**
 *  This Main constructor converts the instance of express into a HTTP server with all the websocket
 *  functions, events and emitters
 *  You can then listen to this server as normal
 *
 *  @param app The instance of express
 *  @returns A http server
 */
const sockServer = (app: Application) => {
  // Create the http server from the express application passed in
  const server = new http.Server(app);
  // Initialize Socket IO server
  io = socketIO(server);
  // Initialize the connection handler
  lobbies.connectionHandler(io);
  return server;
};

/**
 * Close socketIO server
 */
const close =()=>{io.close()}

export default{
  sockServer,
  lobbies,
  close
}
