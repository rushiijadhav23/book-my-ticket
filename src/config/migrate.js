import pool from "./db.js";

export async function migrate() {
  // Keep this idempotent: safe to run on every backend start.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(255),
      last_name VARCHAR(255)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS movies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS seats (
      id SERIAL PRIMARY KEY,
      movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      seat_number INT NOT NULL,
      isbooked INT DEFAULT 0,
      booked_by INT REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(movie_id, seat_number)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      seat_id INT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed defaults only if movies table is empty.
  await pool.query(`
    INSERT INTO movies (name)
    SELECT seed.name
    FROM (VALUES ('Interstellar'), ('Inception'), ('The Dark Knight')) AS seed(name)
    WHERE NOT EXISTS (SELECT 1 FROM movies);
  `);

  // Seed 40 seats/movie only if seats table is empty.
  await pool.query(`
    INSERT INTO seats (movie_id, seat_number, isbooked)
    SELECT m.id, gs, 0
    FROM movies m
    CROSS JOIN generate_series(1, 40) AS gs
    WHERE NOT EXISTS (SELECT 1 FROM seats);
  `);
}

