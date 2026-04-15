# Book My Ticket

BookMyTickets is a full-stack movie seat booking app that solves the problem of managing seat reservations without double-booking conflicts.

It lets users register/login, browse movies, view seat layouts, book available seats, and see their booking history. The backend is built with Node.js + Express and PostgreSQL; booking uses a DB transaction with row-level locking (FOR UPDATE) so two users can’t book the same seat at once. The frontend is a lightweight vanilla JS UI served from the same app, and the system includes startup migrations plus health endpoints for reliable deployment (e.g., on Render).

A simple **movie seat booking** app:

- **Backend**: Node.js + Express (REST API)
- **DB**: PostgreSQL
- **Auth**: Email + password (bcrypt) + JWT
- **Frontend**: Static `public/` (Vanilla JS + Tailwind CDN)

## Video demo

https://youtu.be/toI6O_yxVBs

## Live demo

https://book-my-ticket.onrender.com/

## Tech stack

- **Runtime**: Node.js
- **Backend**: Express
- **Database**: PostgreSQL (`pg`)
- **Auth/Security**: bcrypt, JWT (`jsonwebtoken`)
- **Frontend**: HTML + Vanilla JS (ES modules) + TailwindCSS (CDN)
- **Dev tooling**: nodemon
- **Containerization**: Docker + Docker Compose

## Features

- **Register** with **first name**, **last name**, email, password
- **Login** with email + password
- Browse movies
- View seats per movie
- Book a seat (transaction + row lock to prevent double booking)
- View **My bookings**
- Logout

## Project structure

- `index.js`: Express app entrypoint (serves `public/` and mounts routes)
- `src/controllers/`: API logic (auth, movies, bookings)
- `src/routes/`: Express routers
- `src/middleware/`: JWT auth middleware
- `src/config/db.js`: Postgres pool
- `src/config/migrate.js`: Small idempotent migrations run on startup
- `db/init/001_init.sql`: Postgres init schema + seed (runs only on fresh DB volume)
- `public/`: Frontend HTML + JS
  - `public/js/main.js`: frontend entrypoint (wires modules)
  - `public/js/app/`: modularized UI logic (auth/movies/seats/bookings/toast/state)

## Requirements

- Docker + Docker Compose

## Environment variables

Create a `.env` file (see `.env.example`):

```bash
# App
PORT=8080
NODE_ENV=development

# Option A (Render / hosted Postgres)
DATABASE_URL=
DB_SSL=false

# Option B (local Docker Postgres)
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# JWT
JWT_SECRET=
```

For Render, prefer `DATABASE_URL` and set `DB_SSL=true`.

## Run with Docker

```bash
docker compose up --build -d
```

Open:

- **App**: `http://localhost:8080/`
- **API**: `http://localhost:8080/movies` (example)

### Database initialization behavior

- On the **first** startup (fresh Docker volume), Postgres runs `db/init/001_init.sql`.
- On **every backend start**, the server runs idempotent startup migrations (`src/config/migrate.js`) that:
  - ensure required tables exist (`users`, `movies`, `seats`, `bookings`)
  - keep schema compatibility (like `users.first_name/last_name`)
  - seed default movies + seats if tables are empty

### Render deployment notes

- Set these env vars in your Render Web Service:
  - `DATABASE_URL=<Render Postgres Internal Database URL>`
  - `DB_SSL=true`
  - `NODE_ENV=production`
  - `JWT_SECRET=<your-secret>`
- Do **not** use local URLs like `localhost` or Docker service hosts like `postgres` in Render.

If you want a completely fresh DB:

```bash
docker compose down -v
docker compose up --build -d
```

## Common tasks

### Add a new movie (existing DB)

```bash
docker compose exec postgres psql -U "$DB_USER" -d "$DB_NAME" -c "INSERT INTO movies (name) VALUES ('Avengers: Endgame');"
```

### Add seats for a movie you inserted

When you add a movie manually, it won’t have seats automatically (seeding runs only on first DB init).

If you know the `movie_id` (example `4`):

```bash
docker compose exec postgres psql -U "$DB_USER" -d "$DB_NAME" -c "INSERT INTO seats (movie_id, seat_number, isbooked) SELECT 4, gs, 0 FROM generate_series(1, 40) gs ON CONFLICT (movie_id, seat_number) DO NOTHING;"
```

Or for the most recently inserted movie:

```bash
docker compose exec postgres psql -U "$DB_USER" -d "$DB_NAME" -c "INSERT INTO seats (movie_id, seat_number, isbooked) SELECT (SELECT id FROM movies ORDER BY id DESC LIMIT 1), gs, 0 FROM generate_series(1, 40) gs ON CONFLICT (movie_id, seat_number) DO NOTHING;"
```

## API routes

### Auth

- `POST /register`
  - body: `{ "firstName": "...", "lastName": "...", "email": "...", "password": "..." }`
- `POST /login`
  - body: `{ "email": "...", "password": "..." }`
  - returns: `{ token, user: { id, email, firstName, lastName } }`

### Movies / Seats

- `GET /movies`
- `GET /seats/:movieId`

### Booking (JWT required)

Send header: `Authorization: Bearer <token>`

- `PUT /movies/:movieId/seats/:seatId/book`
- `GET /my-bookings`

## Notes / Troubleshooting

- If the UI keeps logging you out, your token may be invalid (the frontend clears session on `401` responses).
- If you add a new movie and seats don’t appear, seed seats for that movie (see above).

