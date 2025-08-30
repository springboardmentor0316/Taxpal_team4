import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", { email, password });
      toast.success(res.data.message, { position: "top-right" });
      // Save JWT in localStorage (optional)
      localStorage.setItem("token", res.data.token);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", { position: "top-right" });
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-10 right-40 w-60 h-60 rounded-full bg-gradient-to-br from-purple-900 to-purple-600 blur-3xl opacity-80"></div>
      <div className="absolute bottom-10 right-20 w-56 h-56 rounded-full bg-gradient-to-br from-purple-900 to-purple-600 blur-3xl opacity-80"></div>

      <div className="flex-1 text-white pl-20 z-10">
        <h1 className="text-5xl font-bold">Welcome To Taxpal</h1>
        <p className="mt-6 inline-block border border-white px-4 py-2 text-lg italic font-semibold rounded">Good to see you again!!</p>
      </div>

      <div className="flex-1 flex items-center justify-center z-10">
        <div className="bg-black/50 shadow-lg rounded-xl p-8 w-96 border border-gray-700 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-white">Login</h2>
          <p className="text-gray-400 text-sm mb-6">Glad you’re back..!</p>

          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-4 px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />

          <div className="relative mb-4">
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 cursor-pointer text-gray-400">{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
          </div>

          <div className="text-right mb-4">
            <button onClick={() => navigate("/forgot-password")} className="text-sm text-purple-400 hover:underline">Forgot password?</button>
          </div>

          <button onClick={handleLogin} className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition">Login</button>

          <p className="text-gray-400 text-sm mt-4 text-center">
            Don’t have an account? <button onClick={() => navigate("/signup")} className="text-purple-400 hover:underline">Signup</button>
          </p>
        </div>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
}
