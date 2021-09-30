// Colyseus + Express
import { Server,  matchMaker } from "colyseus";
import { createServer } from "http";
import express from "express";
import  { GameRoom } from "./rooms/GameRoom";
import  { ChatRoom } from "./rooms/ChatRoom";
const port = Number(process.env.PORT) || 3001;

const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app)
});

app.use(express.static("public"));

gameServer.define("game_room", GameRoom).filterBy(['password']);
matchMaker.createRoom("game_room", { roomId: "Marketplace", name:"Marketplace", maxClients: 20, description: "This is the Marketplace where everyone can join!"});
matchMaker.createRoom("game_room", { roomId: "Eden", name:"Eden", password: "eden", maxClients: 5, description: "Welcome to my Eden! Use the password 'eden' to join this room."});

gameServer.define("chat_room", ChatRoom);
matchMaker.createRoom("chat_room", { roomId: "Marketplace_Chat", name:"Marketplace Chat", maxClients: 20});
matchMaker.createRoom("chat_room", { roomId: "Eden_Chat", name:"Eden Chat", maxClients: 5});

gameServer.listen(port);

console.log(`Listening on ${ port }`)
