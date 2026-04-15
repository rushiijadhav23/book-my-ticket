-- Initializes schema + seed data for local Docker Postgres.
-- Runs automatically on first container startup (empty data volume).

-- To connect to the database from the terminal
-- docker exec -it bookmyticket-db psql -U postgres -d bookmyticket

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS seats (
  id SERIAL PRIMARY KEY,
  movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  seat_number INT NOT NULL,
  isbooked INT DEFAULT 0,
  booked_by INT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(movie_id, seat_number)
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  seat_id INT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed a few movies (idempotent).
INSERT INTO movies (name) VALUES
  ('Interstellar'),
  ('Inception'),
  ('The Dark Knight'),
  ('Dhurandhar')
ON CONFLICT DO NOTHING;

-- Insert a new movie in the database
-- INSERT INTO movies (name) VALUES ('Dhurandhar');
-- Add seats for the new movie
-- INSERT INTO seats (movie_id, seat_number, isbooked)
-- SELECT m.id, gs, 0
-- FROM movies m
-- CROSS JOIN generate_series(1, 40) AS gs
-- ON CONFLICT (movie_id, seat_number) DO NOTHING;

-- Seed 40 seats per movie (1..40), idempotent.
INSERT INTO seats (movie_id, seat_number, isbooked)
SELECT m.id, gs, 0
FROM movies m
CROSS JOIN generate_series(1, 40) AS gs
ON CONFLICT (movie_id, seat_number) DO NOTHING;

