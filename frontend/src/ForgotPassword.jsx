// src/ForgotPassword.jsx
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email", { position: "top-right" });
      return;
    }

    try {
      // NOTE: server is mounted at /api/auth
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });

      // If backend returned OTP (dev mode), show it so you can test easily
      if (res.data && res.data.otp) {
        toast.success(`OTP (dev): ${res.data.otp}`, { position: "top-right", autoClose: 4000 });
      } else {
        toast.success(res.data.message || "OTP sent to your email", { position: "top-right" });
      }

      // Save email in localStorage for OTP/reset pages
      localStorage.setItem("resetEmail", email);

      // Navigate to OTP entry page
      setTimeout(() => navigate("/otp"), 1200);
    } catch (err) {
      // Show the server's message when available — more useful than "something went wrong"
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      toast.error(msg, { position: "top-right" });
      console.error("ForgotPassword frontend error:", err.response?.data || err.message || err);
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 right-52 w-60 h-60 rounded-full bg-gradient-to-br from-purple-900 to-purple-600 blur-3xl opacity-80"></div>
      <div className="absolute bottom-20 left-40 w-56 h-56 rounded-full bg-gradient-to-br from-purple-900 to-purple-600 blur-3xl opacity-80"></div>

      <div className="flex-1 text-white pl-20 z-10">
        <h1 className="text-5xl font-bold">Welcome To Taxpal</h1>
        <p className="mt-6 inline-block border border-white px-4 py-2 text-lg italic font-semibold rounded">
          Don’t worry. We’ve got you..!
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center z-10">
        <div className="bg-black/50 shadow-lg rounded-xl p-8 w-96 border border-gray-700 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-white">Forgot Password ?</h2>
          <p className="text-gray-400 text-sm mb-6">Please enter your email</p>

          <input
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-6 px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={handleForgotPassword}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
          >
            Submit
          </button>

          <p className="text-gray-400 text-sm mt-4 text-center">
            Don’t have an account?{" "}
            <button onClick={() => navigate("/signup")} className="text-purple-400 hover:underline">Signup</button>
          </p>
        </div>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
}
