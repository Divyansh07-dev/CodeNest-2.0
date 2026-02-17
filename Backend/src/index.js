// const express = require('express')
// const app = express();
// require('dotenv').config();
// const main =  require('./config/db')
// const cookieParser =  require('cookie-parser');
// const authRouter = require("./routes/userAuth");
// const redisClient = require('./config/redis');
// const problemRouter = require("./routes/problemCreator");
// const submitRouter = require("./routes/submit")
// const aiRouter = require("./routes/aiChatting")
// const videoRouter = require("./routes/videoCreator");
// const cors = require('cors')

// // console.log("Hello")

// // ------------------------------------------------------------------
// // **CORRECTION HERE: Allowing both localhost (for development) 
// // and the Vercel URL (for production)**
// // ------------------------------------------------------------------
// app.use(cors({
//   origin: [
//     "http://localhost:5173",                // Local development
//     "https://codenest-2-0-frontend.onrender.com" // Frontend deployed on Vercel
//   ],
//   credentials: true
// }));


// app.use(express.json());
// app.use(cookieParser());

// app.use('/user',authRouter);
// app.use('/problem',problemRouter);
// app.use('/submission',submitRouter);
// app.use('/ai',aiRouter);
// app.use("/video",videoRouter);


// const InitalizeConnection = async ()=>{
//     try{

//         await Promise.all([main(),redisClient.connect()]);
//         console.log("DB Connected");
//         
//         app.listen(process.env.PORT, ()=>{
//             console.log("Server listening at port number: "+ process.env.PORT);
//         })

//     }
//     catch(err){
//         console.log("Error: "+err);
//     }
// }


// InitalizeConnection();


const express = require("express");
const app = express();
require("dotenv").config();

const main = require("./config/db");
const redisClient = require("./config/redis");

const cookieParser = require("cookie-parser");
const cors = require("cors");

// Routes
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");

// ----------------------
// CORS CONFIG (IMPORTANT)
// ----------------------
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://codenest-2-0-frontend.onrender.com"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman etc

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 🔥 THIS LINE FIXES PREFLIGHT
app.options("*", (req, res) => {
  res.sendStatus(200);
});


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
// SERVER START
// ----------------------
const PORT = process.env.PORT || 5000;

const InitalizeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("DB & Redis Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup Error:", err);
  }
};

InitalizeConnection();
