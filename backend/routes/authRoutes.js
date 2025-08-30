// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// helper: generate 6-digit OTP as string
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------------- SIGNUP ----------------------
router.post("/signup", async (req, res) => {
  const { username, email, password, country, income } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      country,
      income,
    });

    await user.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------- LOGIN ----------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login successful",
      token,
      user: { username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------- FORGOT PASSWORD (Generate OTP and send email) ----------------------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    // If email not configured or dev override, return OTP in response for local testing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.DISABLE_EMAIL === "true") {
      console.warn(`[DEV] OTP for ${email}: ${otp} (expires in 10 minutes)`);
      return res.json({ message: "OTP generated (development)", otp }); // dev: returns otp so frontend can show it
    }

    // Configure transporter (Gmail SMTP)
    const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // 👈 add this
  },
});


    // verify transporter to get a clearer error early
    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.error("Nodemailer verify failed:", verifyErr);
      return res.status(500).json({ message: "Email configuration invalid", error: verifyErr.message });
    }

    const mailOptions = {
      from: `"Taxpal Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Taxpal — Password Reset OTP",
      text: `Hello ${user.username},\n\nYour OTP for resetting password is: ${otp}\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore.`,
      html: `<p>Hello <strong>${user.username}</strong>,</p>
             <p>Your OTP for resetting password is: <strong>${otp}</strong></p>
             <p>This OTP will expire in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error while generating/sending OTP", error: error.message });
  }
});

// ---------------------- VERIFY OTP (without changing password) ----------------------
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "email and otp required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ message: "No OTP requested for this user" });
    }

    if (user.resetOTP !== otp || user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Optionally: clear OTP after successful verify (we won't clear so reset-password can still re-check)
    return res.json({ message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------------------- RESET PASSWORD (Verify OTP + Change Password) ----------------------
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ message: "email, otp and newPassword are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ message: "No OTP requested for this user" });
    }

    if (user.resetOTP !== otp || user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
