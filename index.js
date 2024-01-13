import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { initializeSocket, activeRooms } from "./socket/socketHandler.js";
import router from "./routes/index.js";
const app = express();
const server = createServer(app);
const { io } = initializeSocket(server);

app.use(
  cors({
    origin: "*",
  })
);
app.use("/", router);

server.listen(4000);
