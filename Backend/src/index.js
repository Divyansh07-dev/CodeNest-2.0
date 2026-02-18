const express = require("express");
const app = express();
require("dotenv").config();

const cors = require("cors");
const cookieParser = require("cookie-parser");

// DB & Redis
const main = require("./config/db");
const redisClient = require("./config/redis");

// Routes
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");

// ----------------------
// ✅ CORS CONFIG (IMPORTANT)
// ----------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local frontend
      "https://codenest-2-0-frontend.onrender.com" // deployed frontend
    ],
    credentials: true
  })
);

// ----------------------
// MIDDLEWARES
// ----------------------
app.use(express.json());
app.use(cookieParser());

// ----------------------
// ROUTES
// ----------------------
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

// ----------------------
// SERVER + DB START
// ----------------------
const PORT = process.env.PORT || 5000;

// ... existing imports ...

const InitalizeConnection = async () => {
  try {
    // 1. Connect to MongoDB first (Critical)
    await main(); 
    console.log("✅ MongoDB Atlas Connected");

    // 2. Connect to Redis (Non-Critical - don't let it crash the server)
    redisClient.connect()
      .then(() => console.log("✅ Redis Cloud Connected"))
      .catch((err) => console.error("⚠️ Redis Connection Failed:", err));

    // 3. START SERVER IMMEDIATELY
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is live on port: ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Critical Startup Error (MongoDB):", err);
    process.exit(1); 
  }
};

InitalizeConnection();