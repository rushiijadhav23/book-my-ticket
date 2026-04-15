import express from "express";
import { bookSeat } from "../controllers/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/book/:id", authMiddleware, bookSeat);

export default router;