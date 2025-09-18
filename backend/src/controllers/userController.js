// src/controllers/userController.js
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";

// ---------------- Helper: Send OTP Email ----------------
async function sendOtpEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Taxpal Support" <₹{process.env.EMAIL_USER}>`,
    to,
    subject: "Taxpal — Password Reset OTP",
    text: `Your OTP is: ₹{otp} (valid for 10 minutes).`,
    html: `<p>Your OTP is: <b>₹{otp}</b><br/>It is valid for 10 minutes.</p>`,
  });
}

// ---------------- Signup ----------------
export const signup = async (req, res) => {
  try {
    const { name, email, password, country, income } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, country, income });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name, email },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// ---------------- Login ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ---------------- Get Current User ----------------
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// ---------------- Forgot Password ----------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    console.log(`📩 OTP for ₹{email}: ₹{otp}`); // 👈 always log OTP for dev testing

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendOtpEmail(email, otp);
      return res.json({ message: "OTP sent to your email" });
    } else {
      return res.json({ message: "OTP generated (dev mode)", otp });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

// ---------------- Verify OTP ----------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "email and otp required" });

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP requested" });
    }

    if (user.otp !== otp || new Date(user.otpExpires).getTime() < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ message: "OTP verify failed", error: err.message });
  }
};

// ---------------- Reset Password ----------------
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "email, otp, newPassword are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP requested" });
    }

    if (user.otp !== otp || new Date(user.otpExpires).getTime() < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Reset failed", error: err.message });
  }
};
