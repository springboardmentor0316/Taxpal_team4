// src/app.js
import express from "express";
import cors from "cors";

// Milestone 1 routes
import userRoutes from "./routes/userRoutes.js";

// ✅ Milestone 2 routes
import budgetRoutes from "./routes/budgetRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: false, // set true only if you use cookies
  })
);

// Body parser
app.use(express.json());

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ===== ROUTES =====
// Milestone 1
app.use("/api/users", userRoutes);
//app.use("/api/users", require("./routes/userRoutes"));

// ✅ Milestone 2
app.use("/api/budgets", budgetRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Root (optional)
app.get("/", (_req, res) => res.send("Taxpal backend is running 🚀"));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

export default app;
