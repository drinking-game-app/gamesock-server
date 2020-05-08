import http from 'http';
import socketIO from 'socket.io';
import { Application } from "express";

/**
 *  This Main constructor converts the instance of express into a HTTP server with all the websocket
 *  functions, events and listeners
 *  @param app The instance of express
 */
export default (app: Application) => {
  // Create the http server from the express application passed in
  const server = new http.Server(app);
  // Initialize Socket IO server
  const io = socketIO(server);
  return server;
};
