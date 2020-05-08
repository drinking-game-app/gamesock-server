import http from 'http';
import socketIO from 'socket.io';
import { Application } from "express";
import connectionHandler from './lobbies';





/**
 *  This Main constructor converts the instance of express into a HTTP server with all the websocket
 *  functions, events and emitters
 *  You can then listen to this server as normal
 *
 *  @param app The instance of express
 *  @returns A http server
 */
export default (app: Application) => {
  // Create the http server from the express application passed in
  const sockServer = new http.Server(app);
  // Initialize Socket IO server
  const io = socketIO(sockServer);
  // Initialize the connection handler
  connectionHandler(io);
  return sockServer;
};
