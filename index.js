// index.js (Vercel Serverless Ready)
import express from "express";
import cors from "cors";
import dbConnect from "./config/dbConnect.js"; // ← आपका नया dbConnect
import movieRouter from "./routes/movie.routes.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();

// CORS - Allow all your frontends
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://movie-d5l3.vercel.app",
      "https://movie-admin-frontend.vercel.app",
      "https://movie-six-azure.vercel.app",
      "https://movie-admin-frontend-mbehgah76-vikashs-projects-b626ec94.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight OPTIONS globally
app.options("*", cors());

// Body parser with 10MB limit (for images)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// DB Connect on every request (Vercel Serverless)
app.use(async (req, res, next) => {
  try {
    await dbConnect(); // ← हर रिक्वेस्ट पर connect
    next();
  } catch (error) {
    console.error("DB Connection Failed:", error);
    return res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// Routes
app.use("/api/movies", movieRouter);
app.use("/api/admin", adminRouter);

// Home route
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Movie Backend API Running Successfully!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Export for Vercel (NO app.listen!)
export default app;


// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/connectDB.js";
// import movieRouter from "./routes/movie.routes.js";
// import adminRouter from "./routes/admin.routes.js";

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ Simple and stable CORS setup for Vercel
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "https://movie-d5l3.vercel.app",
//       "https://movie-admin-frontend.vercel.app",
//       "https://movie-admin-frontend-mbehgah76-vikashs-projects-b626ec94.vercel.app",
      
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );

// // ✅ Handle OPTIONS preflight requests globally
// app.options(/.*/, cors());


// app.use(express.json());
// app.use("/api/movies", movieRouter);
// app.use("/api/admin", adminRouter);

// app.get("/", (req, res) => {
//   res.status(200).send("🎬 Movie Backend API Running Successfully!");
// });

// app.use((req, res) => {
//   res.status(404).json({ success: false, message: "Route not found" });
// });

// app.listen(PORT, async () => {
//   await connectDB();
//   console.log(`✅ Server running on port ${PORT}`);
// });


