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

// ✅ CORS configuration
app.use(
  cors({
    origin: "https://chat-scape.vercel.app", // Your frontend domain
    credentials: true, // Enable if using cookies/sessions
  })
);

// ✅ Body parser middleware
app.use(express.json({ limit: "4mb" }));

// ✅ Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/ping", (req, res) => res.send("pong")); // public health check
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ✅ Connect to MongoDB
await connectDB();

// ✅ Initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: "https://chat-scape.vercel.app", // frontend domain for WebSocket
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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
