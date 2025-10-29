import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/connectDB.js';
import movieRouter from './routes/movie.routes.js';
import adminRouter from './routes/admin.routes.js';
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow both localhost & production URLs
const allowedOrigins = [
  "http://localhost:5173", // admin frontend
  "http://localhost:5174", // public frontend
  "https://movie-admin.netlify.app", // (update when deployed)
  "https://movieapp.vercel.app",     // (update when deployed)
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked CORS for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Routes
app.use("/api/movies", movieRouter);
app.use("/api/admin", adminRouter);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("🎬 Movie Backend API Running Successfully!");
});

// ✅ Start Server
app.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server running on port ${PORT}`);
});
