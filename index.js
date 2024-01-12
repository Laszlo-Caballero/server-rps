import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import initializeSocket from "./socketHandler.js";

const app = express();
const server = createServer(app);
const { io, activeRooms } = initializeSocket(server);

app.use(cors());

app.get("/rooms", (req, res) => {
  res.send(activeRooms);
});

app.get("/players/:room", (req, res) => {
  const { room } = req.params;
  const index = activeRooms.findIndex((element) => element.room === room);
  res.send(
    index !== -1 ? { players: activeRooms[index].players } : { players: 1 }
  );
});

server.listen(4000, () => {
  console.log("Server on Port 4000");
});

setInterval(() => {
  console.log(activeRooms);
}, 3000);

setInterval(() => {
  activeRooms = activeRooms.filter((element) => element.players !== 0);
  io.emit("New room", activeRooms);
}, 120000);
