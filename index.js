import express from "express";
import cors from "cors";

import authRoutes from "./src/routes/authRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import movieRoutes from "./src/routes/movieRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/", authRoutes);
app.use("/", bookingRoutes);
app.use("/", movieRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});