import pool from "../config/db.js"

export const bookSeat = async (req, res) => {
  const conn = await pool.connect();

  try {
    const { movieId, seatId } = req.params;
    const user = req.user;

    await conn.query("BEGIN");

    // Validate seat belongs to movie
    const result = await conn.query(
      `SELECT * FROM seats 
       WHERE id = $1 AND movie_id = $2 AND isbooked = 0 
       FOR UPDATE`,
      [seatId, movieId]
    );

    if (result.rowCount === 0) {
      await conn.query("ROLLBACK");
      conn.release();
      return res.send({ error: "Seat not available for this movie" });
    }

    const seat = result.rows[0];

    await conn.query(
      "UPDATE seats SET isbooked = 1, booked_by = $2 WHERE id = $1",
      [seatId, user.id]
    );

    await conn.query(
      "INSERT INTO bookings (user_id, movie_id, seat_id) VALUES ($1, $2, $3)",
      [user.id, movieId, seatId]
    );

    await conn.query("COMMIT");
    conn.release();

    res.send({ message: "Seat booked successfully" });

  } catch (err) {
    await conn.query("ROLLBACK");
    conn.release();
    console.log(err);
    res.status(500).send("Booking failed");
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        b.id,
        m.name AS movie_name,
        s.seat_number,
        b.created_at
      FROM bookings b
      JOIN movies m ON b.movie_id = m.id
      JOIN seats s ON b.seat_id = s.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC`,
      [userId]
    );

    res.send(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching bookings");
  }
};

// import pool from "../config/db.js";

// export const bookSeat = async (req, res) => {
//   const conn = await pool.connect(); // pick a connection from the pool
//     //begin transaction
//     // KEEP THE TRANSACTION AS SMALL AS POSSIBLE

//   try {
//     const id = req.params.id;
//     const user = req.user; // comes from JWT
//     // payment integration should be here
//     // verify payment

//     await conn.query("BEGIN");
//     //getting the row to make sure it is not booked
//     /// $1 is a variable which we are passing in the array as the second parameter of query function,
//     // Why do we use $1? -> this is to avoid SQL INJECTION
//     // (If you do ${id} directly in the query string,
//     // then it can be manipulated by the user to execute malicious SQL code)

//     const result = await conn.query(
//       "SELECT * FROM seats WHERE id = $1 AND isbooked = 0 FOR UPDATE",
//       [id]
//     );

//     //if no rows found then the operation should fail can't book
//     // This shows we Do not have the current seat available for booking
//     if (result.rowCount === 0) {
//       await conn.query("ROLLBACK");
//       conn.release();
//       return res.send({ error: "Seat already booked" });
//     }

//     //if we get the row, we are safe to update
//     await conn.query(
//       "UPDATE seats SET isbooked = 1, name = $2 WHERE id = $1",
//       [id, user.email]
//     ); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

//     //end transaction by committing
//     await conn.query("COMMIT");
//     conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)

//     res.send({ message: "Seat booked successfully" });
//   } catch (err) {
//     await conn.query("ROLLBACK");
//     conn.release();
//     console.log(err);
//     res.status(500).send("Booking failed");
//   }
// };