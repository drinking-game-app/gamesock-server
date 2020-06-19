import { Server, Socket } from 'socket.io';
// import { gameFunctions } from './game';

/**
 * The lobby object
 */
export interface Lobby {
  readonly name: string;
  // If round is 0 game has not started
  round: number;
  // Host will always be players[0]
  players: Player[];
  questions?: Question[]
  hotseatPairs?:[Player,Player][]
  unclaimedIps:string[]
}

export interface Player {
  // socketIO id
  readonly id: string;
  name: string;
  score: number;
}

export type RoundOptions = {
  // Current round number
  roundNum: number;
  // Players picked to be in the hotseat
  hotseatPlayers: [Player, Player];
  // Number of questions to answer
  numQuestions: number;
  // // Time to fill in questions in seconds
  time?: number;
  // // Time to start first timer: Date.now foramt
  timerStart?: number;
  // Time to answer
  tta:number
  // Delay between questions
  delayBetweenQs:number
};

export interface Question {
  playerId: string;
  question: string;
  // Time to Start
  tts?: number;
  answers?: number[];
}

export interface HotseatOptions{
  // The time to answer each question
  tta:number;
  delayBetweenQs:number;
}

export type GameSettings = { rounds: number };
export type AuthFn = (authToken: string) => boolean;
export type LobbyCreateFn = (lobby: Lobby) => boolean;
export type LobbyJoinFn = (lobbyName: string, player: Player) => Player[];
export type CallbackFunction = (data: any, error?: string) => void;
export type UpdateSinglePlayerFn = (lobbyName: string, player: Player) => Player | null;
export type GetPlayersFn = (lobbyName: string) => Player[] | null;
export type StartGameFn = (lobbyName: string, socketId: string) => { ok: boolean; gameSettings: GameSettings };
export type DisconnectFn = (lobbyName: string, socketId: string,ipAddress:string) => void;
export type ReturnQuestionsFn = (lobbyName: string, questions: Question[], roundOptions: RoundOptions) => Question[];
export type AnswerQuestionFn = (lobbyName: string, socketId: string, questionNumber: number, answer: number,roundNum:number) => void;
export type RequestAnswerFn = (lobbyName: string, questionIndex: number,roundNum:number) => number[];
export type RoundEndFn = (lobbyName: string,roundNum:number) =>void;
export type ContinueGameFn = (lobbyName:string,socketID:string) => void;
export type NoAnswerFn = ()=>string;
export type ClaimSocketFn =(lobbyName:string,socketId:string,ipAdress:string)=>boolean;
/*
----- The over-writable functions
*/
// Set Authorize function defaults to true
let authorizeFn: AuthFn = (authToken) => true;
let onLobbyCreateFn: LobbyCreateFn = (lobby) => true;
let onLobbyJoinFn: LobbyJoinFn = (lobbyName, player) => [];
let onUpdateSinglePlayerFn: UpdateSinglePlayerFn = (lobbyName, player) => null;
let onGetPlayersFn: GetPlayersFn = (lobbyName) => null;
let onStartGameFn: StartGameFn = (lobbyName, socketId) => {
  return { ok: true, gameSettings: { rounds: 3 } };
};
let onDisconnectFn: DisconnectFn = (lobbyName, socketId, ipAddress) => {
  //
};
let onNoAnswerFn:NoAnswerFn=()=>'Who\'s more likely not to answer a question'
let onReturnQuestionsFn: ReturnQuestionsFn;
let onAnswerQuestionFn: AnswerQuestionFn;
let onRequestAnswerFn: RequestAnswerFn;
let onRoundEndFn: RoundEndFn;
let onContinueGameFn:ContinueGameFn;
let onClaimSocketFn:ClaimSocketFn= (lobbyName,socketId,ipAddress)=>false;

let debugMode=false;
export const startDebugMode = () => {debugMode=true}

/**
 * Takes in a function to verify the authToken passed to the server. This function will run before a lobby is created
 * @param {AuthFn} authenticateFn The function which will verify the token that is passed to the server
 */
export const onAuth = (authCheckFunction: AuthFn) => {
  authorizeFn = authCheckFunction;
};

/**
 * Takes in a function to run when a lobby is created
 * @param {LobbyCreateFn} createFunction The lobby can be accessed from this function, returns a boolean to allow lobby creation or not
 */
export const onLobbyCreate = (createFunction: LobbyCreateFn) => {
  onLobbyCreateFn = createFunction;
};

/**
 * Takes in a function to run when a lobby is joined by a player
 * @param {LobbyJoinFn} joinFunction The lobby name and joined player can be accessed from this function, it returns the list of players
 */
export const onLobbyJoin = (joinFunction: LobbyJoinFn) => {
  onLobbyJoinFn = joinFunction;
};

/**
 * Takes in a function to run when a single player is updated
 * This function takes in the lobby name and player, it returns the updated player
 * @param {UpdateSinglePlayerFn} updateSinglePlayerFunction
 */
export const onUpdateSinglePlayer = (updateSinglePlayerFunction: UpdateSinglePlayerFn) => {
  onUpdateSinglePlayerFn = updateSinglePlayerFunction;
};

/**
 * Takes in a function to run when a list of players in a lobby needs to be returned
 * This function takes in the lobby name, it returns the list of players in that lobby
 * @param {GetPlayersFn} getPlayersFunction
 */
export const onGetPlayers = (getPlayersFunction: GetPlayersFn) => {
  onGetPlayersFn = getPlayersFunction;
};

export const onContinueGame = (newContinueGameFn: ContinueGameFn) => {
  onContinueGameFn = newContinueGameFn;
};

/**
 * Takes in a function to run when the host starts a game
 * This function takes in the lobby name and socket ID, it returns a boolean to allow game creation or not
 * @param {StartGameFn} startGameFunction
 */
export const onStartGame = (startGameFunction: StartGameFn) => {
  onStartGameFn = startGameFunction;
};
export const onDisconnect = (newDisconnectFn: DisconnectFn) => {
  onDisconnectFn = newDisconnectFn;
};
export const onReturnQuestions = (newOnReturnQuestionsFn: ReturnQuestionsFn) => {
  onReturnQuestionsFn = newOnReturnQuestionsFn;
};
export const onAnswerQuestions = (newAnswerQuestionFn: AnswerQuestionFn) => {
  onAnswerQuestionFn = newAnswerQuestionFn;
};
export const onRequestAnswer = (newRequestAnswerFn: RequestAnswerFn) => {
  onRequestAnswerFn = newRequestAnswerFn;
};
export const onRoundEnd = (newRoundEndFn: RoundEndFn) => {
  onRoundEndFn = newRoundEndFn;
};
export const onNoAnswer = (newNoAnswerFn: NoAnswerFn) => {
  onNoAnswerFn= newNoAnswerFn;
};
export const onClaimSocket = (newClaimSocketFn: ClaimSocketFn) => {
  onClaimSocketFn= newClaimSocketFn;
};

let io: Server;
/**
 * @private
 * This function sets up the functionality for new connections
 *
 * @param {Server} io The SocketIo server which is being connected to
 */
export const connectionHandler = (thisIO: Server) => {
  io = thisIO;
  // When a new client connects
  io.on('connection', (socket: Socket) => {
    socket.on('joinLobby', (lobbyName: string,username:string, callback: CallbackFunction) => {
      joinLobby(lobbyName,username, socket, io, callback);
    });

    socket.on('pinger',(callback)=>{
      callback('ponger')
    })

    socket.on('createLobby', (lobbyName: string, username:string,authToken: string, callback: CallbackFunction) => {
      // if(typeof lobbyName === 'string')


      // The authorization function is overwritten by the users of the library
      // @HOOK
      if (authorizeFn(authToken)) {
        const lobby: Lobby = {
          name: lobbyName,
          round: 0,
          players: [],
          unclaimedIps:[]
        };
        // Run on lobby create function - Code for this is written on server
        // @HOOK
        if (onLobbyCreateFn(lobby)) {
          // Join the created Lobby
          joinLobby(lobbyName,username, socket, io, callback);
        } else {
          returnError(`Could not create lobby`, socket);
        }
      } else {
        console.log('Unauthorized');
        // Return an error to the player when not authorized
        returnError(`${socket.id} is not authorized to create rooms`, socket);
      }
    });

    socket.on('updateSelf', (lobbyName: string, player: Player) => {
      const playerObj = onUpdateSinglePlayerFn(lobbyName, player);
      if (playerObj == null) {
        console.error('Error: 🤯 Please implement the onUpdateSinglePlayer');
      } else if (socket.id !== player.id) {
        console.error(`Error: HACKER ALERT; ${socket.id} Tried  to edit ${player.id}`);
      } else {
        // io.to(lobbyName).emit('getPlayers', players);
        io.to(lobbyName).emit('playerUpdated', playerObj);
      }
    });

    socket.on('getPlayers', (lobbyName: string) => {
      const players = onGetPlayersFn(lobbyName);
      if (players == null) {
        console.error('Error: 🤯 Please implement the onGetPlayers');
      } else {
        // console.log('Sending player list');
        io.to(lobbyName).emit('getPlayers', players);
      }
    });

    socket.on('startGame', (lobbyName: string) => {
      const options = onStartGameFn(lobbyName, socket.id);

      if (options.ok) {
        io.to(lobbyName).emit('startGame', options.gameSettings);
      } else {
        returnError('Could not start game', socket);
      }
    });

    socket.on('hotseatAnswer', (lobbyName: string, questionNumber: number, answer: number, round:number) => {
      onAnswerQuestionFn(lobbyName, socket.id, questionNumber, answer,round);
    });

    socket.on('continue',(lobbyName:string)=>{
      onContinueGameFn(lobbyName,socket.id)
    })

    socket.on('claimSocket',(lobbyName: string, socketId: string)=>{
      const players = Object.keys(io.nsps['/'].adapter.rooms[lobbyName]?.sockets);
      const ipAddress=socket.request.connection._peername.address
      if(!players.includes(socketId)){
        if(!onClaimSocketFn(lobbyName,socketId,ipAddress)){
          socket.emit('gamesockError', 'Could rejoin lobby')
        }
      }
    })

    socket.on('disconnecting', (reason) => {
      const lobbyName = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0];
      const ipAddress=socket.request.connection._peername.address
      console.log('DC IP = '+ipAddress)
      // console.log('nameoaxd', lobbyName);
      io.to(lobbyName).emit('message', {
        ok: true,
        msg: `${socket.id} has just left ${lobbyName} because of ${reason}`,
      });
      onDisconnectFn(lobbyName, socket.id, ipAddress);
    });

  });
};

/**
 * Start a round
 * @param lobbyName
 * @param roundOptions
 */
export const startRound = (lobbyName: string, roundOptions: RoundOptions) => {
  //  roundOptions.time=30
  roundOptions.timerStart = Date.now() + (4 * 1000);
  io.to(lobbyName).emit('startRound', roundOptions);
  // dont send next to hotseatplayers
  // let players = Object.keys(io.nsps['/'].adapter.rooms[lobbyName].sockets);
  let players: Player[] = onGetPlayersFn(lobbyName) as Player[];
  // console.log('AllPlayers', players);
  players = players.filter((player: Player) => player.id !== roundOptions.hotseatPlayers[0].id && player.id !== roundOptions.hotseatPlayers[1].id);
  // console.log('newPlayers', players);
  let allQuestions: Question[] = [];

  for (const player of players) {
    const playerSocket = io.of('/').connected[player.id];
    const timeTillStart = roundOptions.timerStart - Date.now();
    const timeOut = (timeTillStart > 0 ? timeTillStart : 0) + ((roundOptions.time || 30) + 1) * 1000;
    // console.log('Timerout', timeOut);
    setTimeout(
      () =>
        playerSocket.emit('collectQuestions', (data: { ok: boolean; questions: string[] }) => {
          // console.log('collected for' + player.id, data.questions);
          // Delete any extra questions that might get passed in
          if (data.questions.length !== roundOptions.numQuestions) {
            console.error('WRONG QUESTION AMOUNT', data.questions);
            if(data.questions.length<roundOptions.numQuestions){
              for(let i =roundOptions.numQuestions-data.questions.length;i--;){
                allQuestions.push({ playerId: "", question: onNoAnswerFn(), answers:[] })
              }
            }else{
              data.questions.length=roundOptions.numQuestions
            }
          }
          // Push the questions into the array
          for (const newQuestion of data.questions) {
            allQuestions.push({ playerId: player.id, question: newQuestion, answers:[] });
          }
          if (allQuestions.length >= roundOptions.numQuestions * players.length) {
            // Run a return question function
            console.log('done', allQuestions);
            allQuestions = onReturnQuestionsFn(lobbyName, allQuestions, roundOptions);
            // console.log('shuffled= ', allQuestions);
            // startHotseat(lobbyName, shuffledQuestions,roundOptions,);
            const hotseatOptions:HotseatOptions = {
              // Time to answer
              tta: roundOptions.tta,
              delayBetweenQs:roundOptions.delayBetweenQs
            };
            // const timeTillNextQuestion = 3;
            const delayTillStart = 5000;
            // let prevTimeToStart=0;
            for (const [questionIndex, question] of allQuestions.entries()) {
              // Get the start time for each question
              question.tts = Date.now() + ((roundOptions.tta + roundOptions.delayBetweenQs) * (questionIndex) * 1000) + delayTillStart;
              // start the timer
              setTimeout(() => {
                // console.log('starting'+questionIndex)
                // Send answer to question
                const answers = onRequestAnswerFn(lobbyName, questionIndex,roundOptions.roundNum); // This should return the answers for the question-format:[0,0] or [1,null] for example
                // Emit answers to all players
                io.to(lobbyName).emit('hotseatResult', questionIndex, answers);
                // io.to(lobbyName).emit('playerUpdated', playerObj);
                // Emit round end signal when done
                if (questionIndex === allQuestions.length - 1) {
                  // Tell server round has ended
                  setTimeout(() => {
                    onRoundEndFn(lobbyName,roundOptions.roundNum)
                    io.to(lobbyName).emit('roundEnd');
                  }, roundOptions.delayBetweenQs)
                }
              }, question.tts!-Date.now() + (hotseatOptions.tta*1000));
              if(debugMode&& questionIndex===0)console.info('Seconds till first timer: ',
                Math.floor(question.tts!-Date.now() + (hotseatOptions.tta*1000))
              )
            }
            // Emit the start hotseat to sync players
            io.to(lobbyName).emit('startHotseat', allQuestions, hotseatOptions);
           const updatedPlayers: Player[] = onGetPlayersFn(lobbyName) as Player[];
            io.to(lobbyName).emit('getPlayers',updatedPlayers)
          }
        }),
      timeOut
    );
  }
};

/**
 * @private
 * Function to join a specific lobby
 *
 * @param {string} lobbyName The string that contains the lobby name to join
 * @param {Socket} socket The socket which is joining
 * @param {Server} io The IO server
 */
const joinLobby = (lobbyName: string,username:string, socket: Socket, serverio: Server, callback: CallbackFunction) => {
  // Default player passed through to server
  const player: Player = {
    id: socket.id,
    name: username || 'Guest'+(+new Date()).toString(36).slice(-5),
    score: 0,
  };
  // Run server code for joining a lobby
  // @HOOK
  const players = onLobbyJoinFn(lobbyName, player);
  if (players.length !== 0) {
    // Join the Lobby
    socket.join(lobbyName);
    // Announce player has joined
    serverio.to(lobbyName).emit('message', {
      ok: true,
      msg: `${socket.id} has just joined ${lobbyName}`,
    });
    callback(players);
    serverio.to(lobbyName).emit('getPlayers', players);
  } else {
    returnError(`${lobbyName} does not exist 😕, check the lobby and try again!`, socket);
  }
};

const returnError = (message: string, socket: Socket) => {
  socket.emit('message', {
    ok: false,
    msg: message,
  });
};

export default { connectionHandler, onAuth, onLobbyCreate, onLobbyJoin, onUpdateSinglePlayer, onGetPlayers, onStartGame, onDisconnect, startRound, onReturnQuestions,onRoundEnd,onContinueGame,onNoAnswer,onClaimSocket};



