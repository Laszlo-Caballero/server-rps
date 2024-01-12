import { Server } from "socket.io";
import express from "express";
import { createServer } from "node:http";
import cors from "cors";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: "*",
});

app.use(cors());
let activeRooms = [];
io.on("connection", (socket) => {
  console.log("a user conected");
  socket.on("Create room", (room) => {
    socket.join(room);
    const index = activeRooms.findIndex((element) => element.room === room);
    if (index !== -1) {
      activeRooms[index].players++;
      io.to(room).emit("players", activeRooms[index].players);
      console.log(activeRooms[index].players);
    } else {
      activeRooms.push({
        room,
        players: 1,
      });
    }
    io.emit("New room", activeRooms);
  });

  socket.on("leave room", (room) => {
    socket.leave(room);
    console.log("leave");
    const index = activeRooms.findIndex((element) => element.room === room);
    let players;
    if (index != -1 && activeRooms[index].players > 0) {
      players = activeRooms[index].players;
      activeRooms[index].players--;
    }
    io.to(room).emit("players", players);
    io.emit("New room", activeRooms);
  });

  socket.on("Option", (room, option) => {
    console.log(option, socket.id);
    socket.broadcast.to(room).emit("Turn Opponent", option);
  });
});

app.get("/rooms", (req, res) => {
  res.send(activeRooms);
});

app.get("/players/:room", (req, res) => {
  const { room } = req.params;
  const index = activeRooms.findIndex((element) => element.room === room);
  res.send(
    index != -1 ? { players: activeRooms[index].players } : { players: 1 }
  );
});

server.listen(4000, () => {
  console.log("Server on Port 4000");
});

setInterval(() => {
  console.log(activeRooms);
}, 3000);

setInterval(() => {
  activeRooms = activeRooms.filter((element) => element.players != 0);
  io.emit("New room", activeRooms);
}, 120000);
