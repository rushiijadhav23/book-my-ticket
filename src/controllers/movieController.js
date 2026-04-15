import pool from "../config/db.js";

export const getMovies = async (req, res) => {
  const result = await pool.query("SELECT * FROM public.movies");
  res.send(result.rows);
};

export const getSeatsByMovie = async (req, res) => {
  const movieId = req.params.movieId;

  const result = await pool.query(
    "SELECT * FROM public.seats WHERE movie_id = $1",
    [movieId]
  );

  res.send(result.rows);
};