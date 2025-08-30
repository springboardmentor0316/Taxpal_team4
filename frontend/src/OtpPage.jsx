// src/OtpPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OtpPage() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Start with Forgot Password.", { position: "top-right" });
      setTimeout(() => navigate("/forgot-password"), 1000);
    }
  }, [email, navigate]);

  const handleVerify = async () => {
    if (!otp) {
      toast.error("Please enter OTP", { position: "top-right" });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
      toast.success(res.data.message || "OTP verified", { position: "top-right" });

      // store OTP temporarily for reset step (dev-only, clear after)
      localStorage.setItem("resetOTP", otp);
      localStorage.setItem("otpVerified", "true");

      setTimeout(() => navigate("/reset-password"), 800);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP";
      toast.error(msg, { position: "top-right" });
      console.error("Verify OTP error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      <div className="bg-black/50 shadow-lg rounded-xl p-8 w-96 border border-gray-700 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white mb-2">Enter OTP</h2>
        <p className="text-gray-400 text-sm mb-4">OTP sent to {email}</p>

        <input
          type="text"
          placeholder="example: 123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none"
        />

        <div className="flex gap-2">
          <button onClick={() => navigate("/forgot-password")} className="flex-1 py-2 rounded-lg bg-gray-700 text-white">Back</button>
          <button onClick={handleVerify} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">Verify OTP</button>
        </div>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
}
