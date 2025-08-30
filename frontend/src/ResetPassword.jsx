// src/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");
  const otp = localStorage.getItem("resetOTP");
  const otpVerified = localStorage.getItem("otpVerified") === "true";

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Start with Forgot Password.", { position: "top-right" });
      setTimeout(() => navigate("/forgot-password"), 1000);
    }
    if (!otpVerified) {
      toast.error("OTP not verified. Please verify OTP first.", { position: "top-right" });
      setTimeout(() => navigate("/otp"), 1000);
    }
  }, [email, otpVerified, navigate]);

  const handleReset = async () => {
    if (newPassword !== confirm) {
      toast.error("Passwords do not match", { position: "top-right" });
      return;
    }
    if (!newPassword) {
      toast.error("Enter a new password", { position: "top-right" });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      toast.success(res.data.message || "Password reset successful", { position: "top-right" });

      // clean temporary data
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOTP");
      localStorage.removeItem("otpVerified");

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const msg = err.response?.data?.message || "Reset failed";
      toast.error(msg, { position: "top-right" });
      console.error("Reset password error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      <div className="bg-black/50 shadow-lg rounded-xl p-8 w-96 border border-gray-700 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
        <p className="text-gray-400 text-sm mb-4">Enter new password for {email}</p>

        <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mb-3 px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none" />
        <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full mb-4 px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none" />

        <button onClick={handleReset} className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">Reset Password</button>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
}
