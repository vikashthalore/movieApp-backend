import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import movieRouter from "./routes/movie.routes.js";
import adminRouter from "./routes/admin.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Simple and stable CORS setup for Vercel
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://movieapp.vercel.app",
      "https://movie-admin-frontend.vercel.app",
      "https://movie-admin-frontend-mbehgah76-vikashs-projects-b626ec94.vercel.app",
      
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle OPTIONS preflight requests globally
app.options(/.*/, cors());


app.use(express.json());
app.use("/api/movies", movieRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.status(200).send("🎬 Movie Backend API Running Successfully!");
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`✅ Server running on port ${PORT}`);
});
