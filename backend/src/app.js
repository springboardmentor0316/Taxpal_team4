// src/app.js
import express from "express";
import cors from "cors";
import path from "path";
// routes
import userRoutes from "./routes/userRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import taxRoutes from "./routes/taxRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: false,
  })
);

// Body parser
app.use(express.json());

// Serve reports directory (static files)
app.use("/reports", express.static(path.join(process.cwd(), "public", "reports")));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/reports", reportRoutes);

// Root
app.get("/", (_req, res) => res.send("Taxpal backend is running 🚀"));

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

export default app;
