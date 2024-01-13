import { Server } from "socket.io";
let activeRooms = [];
function initializeSocket(server) {
  const io = new Server(server, {
    cors: "*",
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

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
      if (index !== -1 && activeRooms[index].players > 0) {
        players = activeRooms[index].players;
        activeRooms[index].players--;
      }
      io.to(room).emit("players", players - 1);
      io.emit("New room", activeRooms);
    });

    socket.on("Option", (room, option) => {
      console.log(option, socket.id);
      socket.broadcast.to(room).emit("Turn Opponent", option);
    });
    socket.on("Play Again", (room) => {
      socket.broadcast.to(room).emit("Set Again");
    });
  });
  setInterval(() => {
    activeRooms = activeRooms.filter((element) => element.players !== 0);
    io.emit("New room", activeRooms);
  }, 120000);
  return { io };
}

export { activeRooms, initializeSocket };
