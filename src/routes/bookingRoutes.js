import express from "express";
import { bookSeat, getMyBookings } from "../controllers/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/movies/:movieId/seats/:seatId/book", authMiddleware, bookSeat);
router.get("/my-bookings", authMiddleware, getMyBookings);

export default router;