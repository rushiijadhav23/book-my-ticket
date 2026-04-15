import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./src/routes/authRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import movieRoutes from "./src/routes/movieRoutes.js";
import { migrate } from "./src/config/migrate.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// routes
app.use("/", authRoutes);
app.use("/", bookingRoutes);
app.use("/", movieRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

const healthResponse = {
  status: "ok",
  service: "book-my-ticket",
  timestamp: new Date().toISOString(),
};

app.get("/health", (req, res) => {
  res.status(200).json(healthResponse);
});

const port = Number(process.env.PORT) || 8080;

try {
  await migrate();
  console.log("Database migrations applied");
} catch (err) {
  console.error("Failed to run migrations", err);
  process.exit(1);
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port http://localhost:${port}`);
});