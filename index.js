// सबसे ऊपर – .env लोड करें
import 'dotenv/config';

import express from "express";
import cors from "cors";
import dbConnect from "./config/dbConnect.js";
import movieRouter from "./routes/movie.routes.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "https://movie-admin-frontend.vercel.app",
      "https://movie-six-azure.vercel.app",
      "https://movie-d5l3.vercel.app",
      "http://localhost:5173",
      "https://www.moviesfear.xyz",
      "https://moviesfear.xyz",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// DB Connect
app.use(async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (error) {
    console.error("DB Connection Failed:", error);
    return res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// Routes
app.use("/api/movies", movieRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Movie Backend API Running Successfully!" });
});

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;