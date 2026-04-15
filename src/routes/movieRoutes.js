import express from "express";
import { getMovies, getSeatsByMovie } from "../controllers/movieController.js";

const router = express.Router();

router.get("/movies", getMovies);
router.get("/seats/:movieId", getSeatsByMovie);

export default router;