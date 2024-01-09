const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET"],
  },
});
const port = process.env.ServerPort || 2000;
app.use(cors());
let activeRooms = [];

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("Create room", (roomName) => {
    socket.join(roomName);
    const index = activeRooms.findIndex(
      (element) => element.roomName === roomName
    );
    if (index !== -1) {
      activeRooms[index].players++;
    } else {
      activeRooms.push({ roomName, players: 1 });
    }
    io.emit("New room", activeRooms);
  });
  socket.on("Emit option", (roomName, option) => {
    socket.to(roomName).emit("Option Game", option);
  });
  socket.on("Play again", (roomName, number) => {
    socket.to(roomName).emit("Response Play", number);
  });
  socket.on("leave room", (room) => {
    socket.leave(room);
    const index = activeRooms.findIndex((element) => element.roomName === room);
    if (index != -1 && activeRooms[index].players > 0)
      activeRooms[index].players--;
    io.emit("New room", activeRooms);
  });
});

app.get("/rooms", (req, res) => {
  res.send(activeRooms);
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

setInterval(() => {
  activeRooms = activeRooms.filter((element) => element.players != 0);
  io.emit("New room", activeRooms);
}, 120000);
