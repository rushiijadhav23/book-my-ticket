import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO public.users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4)",
      [email, hashedPassword, firstName ?? null, lastName ?? null]
    );

    res.send({ message: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error registering user");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM public.users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.send({ error: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET
    );

    res.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name ?? null,
        lastName: user.last_name ?? null,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error logging in");
  }
};