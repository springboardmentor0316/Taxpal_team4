// src/routes/userRoutes.js
import express from "express";
import {
  signup,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------- Auth routes ----------------
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);

// ---------------- Password reset routes ----------------
router.post("/forgot-password", forgotPassword); // works with updated controller
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// ---------------- Dashboard route ----------------
router.get("/dashboard", protect, async (req, res) => {
  try {
    const expenses = [
      { name: "Investment", value: 400 },
      { name: "Food", value: 300 },
      { name: "Shopping", value: 200 },
      { name: "Others", value: 100 },
    ];

    const flow = [
      { m: "01", v1: 1200, v2: 900 },
      { m: "02", v1: 900, v2: 700 },
      { m: "03", v1: 1400, v2: 1000 },
      { m: "04", v1: 1100, v2: 1300 },
      { m: "05", v1: 1650, v2: 1200 },
      { m: "06", v1: 1500, v2: 1700 },
    ];

    res.json({ expenses, flow });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error while fetching dashboard data" });
  }
});

export default router;
