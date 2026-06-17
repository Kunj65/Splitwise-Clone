import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/groups.js";
import activityRoutes from "./routes/activities.js";
import userRoutes from "./routes/users.js";
import settlementRoutes from "./routes/settlements.js";
import messageRoutes from "./routes/messages.js";
import { startCronJobs } from "./corn.js";
import commentRoutes from "./routes/comments.js";
import recurringRoutes from "./routes/recurring.js";
import rateLimit from "express-rate-limit";
import friendRoutes from "./routes/friends.js";


dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin.endsWith(".vercel.app") || origin === "http://localhost:5173") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
  socket.on("join:group", (groupId) => {
    socket.join(groupId);
  });

  socket.on("leave:group", (groupId) => {
    socket.leave(groupId);
  });

});

app.use(helmet());

// Single CORS — allows localhost and all Vercel URLs
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.endsWith(".vercel.app") || origin === "http://localhost:5173") {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many requests, please try again later." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again in 15 minutes." }
});

app.use("/api", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/send-otp", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

app.use("/api/settlements", settlementRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/comments", commentRoutes);

app.use("/api/recurring", recurringRoutes);

app.use("/api/friends", friendRoutes);  

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
  console.log("Connected to MongoDB");
  startCronJobs(); // ← add this line
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`Backend listening on PORT:${PORT}`);
  });
})
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }); 