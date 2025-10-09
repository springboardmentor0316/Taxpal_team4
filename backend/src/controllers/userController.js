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
    from: `"Taxpal Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Taxpal — Password Reset OTP",
    text: `Your OTP is: ${otp} (valid for 10 minutes).`,
    html: `<p>Your OTP is: <b>${otp}</b><br/>It is valid for 10 minutes.</p>`,
  });
}

// ---------------- Signup ----------------
export const signup = async (req, res) => {
  try {
    const { name, email, password, country, income } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, password are required" });
    }

    const existing = await User.findOne({ $or: [{ email }, { name }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with same email or name already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      country,
      income,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("signup error:", err);
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
    console.error("login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ---------------- Get Current User ----------------
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email country income");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      country: user.country,
      income: user.income,
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- Forgot Password (Modified) ----------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    console.log(`📩 OTP for ${email}: ${otp}`); // For dev/testing

    // Send email if credentials exist
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendOtpEmail(email, otp);
        return res.json({ message: "OTP sent to your email" });
      } catch (mailErr) {
        console.error("Mail send error:", mailErr);
        return res.status(500).json({ message: "Failed to send OTP email" });
      }
    } else {
      // Dev mode: return OTP in response
      return res.json({ message: "OTP generated (dev mode)", otp });
    }
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: "Failed to generate OTP", error: err.message });
  }
};

// ---------------- Verify OTP ----------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "email and otp required" });

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP requested" });
    }

    if (user.otp !== otp || new Date(user.otpExpires).getTime() < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified" });
  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ message: "OTP verify failed", error: err.message });
  }
};

// ---------------- Reset Password ----------------
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "email, otp, newPassword are required" });
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
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Reset failed", error: err.message });
  }
};
