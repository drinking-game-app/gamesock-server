![Node CI](https://github.com/drinking-game-app/gamesock-server/workflows/Node%20CI/badge.svg?branch=master)
![coverage-badge](/coverage/badge.svg)
# Gamesock-Server
A Server-side Networking library to handle the websocket portion of drinking games built with node

## To install latest published:
`npm install @rossmacd/gamesock-server`

## To install - (For Development):
Clone the package using

`git clone https://github.com/drinking-game-app/gamesock-server.git`

Install Peer dependencies

`npm install`

Build the package

`npm run build`

## To use the built dependency
This is a two step process to create a link between your local version of the package and the project you want to use it in.
In the folder for this dependency run:

`npm link`

In the folder of the project you would like to use it in

`npm link @rossmacd/gamesock-server`
