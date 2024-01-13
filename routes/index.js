import { Router } from "express";
import { activeRooms } from "../socket/socketHandler.js";
const router = Router();
router.get("/rooms", (req, res) => {
  res.send(activeRooms);
});

router.get("/players/:room", (req, res) => {
  const { room } = req.params;
  const index = activeRooms.findIndex((element) => element.room === room);
  res.send(
    index !== -1 ? { players: activeRooms[index].players } : { players: 1 }
  );
});

export default router;
