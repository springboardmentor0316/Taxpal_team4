// server.js (project root)
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Connect to MongoDB via db.js
    await connectDB();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    // Make io available in routes/controllers via req.app.get("io")
    app.set("io", io);

    io.on("connection", (socket) => {
      console.log("⚡ Socket connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
})();
