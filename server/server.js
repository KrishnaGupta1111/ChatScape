import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// ✅ CORS configuration (FIXED)
app.use(
  cors({
    origin: [
      "https://chatscape11.vercel.app", // production frontend
      "http://localhost:5173", // local Vite dev server
      "http://localhost:3000",
      "http://localhost:5177" // common React dev server
    ],
    credentials: true,
  })
);

// ✅ Body parser middleware
app.use(express.json({ limit: "4mb" }));

// ✅ Routes setup
app.get("/", (req, res) => res.send("Welcome to ChatScape Backend!")); // optional
app.get("/api/ping", (req, res) => res.send("pong")); // health check
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ✅ Connect to MongoDB
await connectDB();

// ✅ Initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: [
      "https://chatscape11.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5177",
    ],
    credentials: true,
  },
});

// ✅ Online users map
export const userSocketMap = {}; // { userId: socketId }

// ✅ Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
