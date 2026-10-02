// server.js
const express = require("express");
const cors = require("cors");
const { createCorsOptions } = require('./configs/cors');
const app = express();
require("dotenv").config();

// Middleware body parser
// A 5 MiB recording expands to about 6.7 MiB as base64; leave modest JSON overhead.
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// ALLOWED_ORIGINS is a comma-separated deployment allowlist. Local defaults
// apply only when it is unset, so a production value replaces them entirely.
app.use(cors(createCorsOptions()));

// Logging middleware để debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Import route modules
const scoreRoutes = require("./routes/scoreRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const lessonRoutes = require("./routes/lessonRoute.js");
const lessonResultRoutes = require("./routes/lessonResultRoute.js");
const questionRoutes = require("./routes/questionRoute.js");
const questionResultRoutes = require("./routes/questionResultRoute.js");
const userRoutes = require("./routes/userRoute.js");
const jwtauth = require("./middleware/jwtauth.js");
const incorrectphonemesRoutes = require("./routes/incorrectphonemesRoutes.js");
const readingRoutes = require("./routes/readingRoutes.js");
const writingRoutes = require("./routes/writingRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const learningRoutes = require("./routes/learningRoutes.js");

// Ping endpoint - giữ server Render không bị sleep
app.get("/ping", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Health check - kiểm tra DB connectivity
const db = require('./db');
app.get("/api/health", async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: "ok", db: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// -------------------
// Public routes (không cần JWT)
app.use("/api/users", userRoutes); // chứa /register, /login
app.use("/api", authRoutes);
app.use("/api/reading", readingRoutes); // Public - cho phép xem bài đọc không cần login
app.use("/api/writing", writingRoutes); // Public - cho phép xem đề writing không cần login
app.use("/api", chatRoutes);

// -------------------
// JWT middleware chỉ áp dụng cho private routes
app.use(jwtauth);

// Private routes
app.use("/api", scoreRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/lessons/results", lessonResultRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/questions/results", questionResultRoutes);
app.use("/api/incorrectphonemes", incorrectphonemesRoutes);
app.use("/api/learning", learningRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Request failed:", err.type || err.code || 'internal');
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large' });
  if (err instanceof SyntaxError && err.status === 400) return res.status(400).json({ error: 'Invalid JSON' });
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS Not Allowed" });
  }
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
