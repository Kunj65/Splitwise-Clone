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

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
      console.log(`Backend listening on PORT:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });