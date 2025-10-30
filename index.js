import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import movieRouter from "./routes/movie.routes.js";
import adminRouter from "./routes/admin.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://movie-admin.netlify.app",
  "https://movieapp.vercel.app",
  "https://rococo-lily-eabaa3.netlify.app",
];

// ✅ Global CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const netlifyPattern = /^https:\/\/([a-z0-9-]+)\.netlify\.app$/i;

      if (allowedOrigins.includes(origin) || netlifyPattern.test(origin)) {
        console.log("✅ Allowed CORS for:", origin);
        callback(null, true);
      } else {
        console.warn("❌ Blocked CORS for:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ❌ Remove this → app.options("*", cors()); ❌
// ✅ Or replace with:
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
