import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [income, setIncome] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showValidation, setShowValidation] = useState(false); // <-- control visibility

  const navigate = useNavigate();

  // Password rules
  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special;

  const handleSignup = async () => {
    if (!isPasswordValid) {
      toast.error("Password does not meet requirements", { position: "top-right" });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { position: "top-right" });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/signup", {
        username,
        email,
        password,
        country,
        income,
      });
      toast.success(res.data.message, { position: "top-right" });
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed", { position: "top-right" });
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-10 right-40 w-60 h-60 rounded-full bg-gradient-to-br from-purple-900 to-purple-600 blur-3xl opacity-80"></div>
      <div className="absolute bottom-10 right-20 w-56 h-56 rounded-full bg-gradient-to-br from-purple-900 to-purple-600 blur-3xl opacity-80"></div>

      {/* Left section */}
      <div className="flex-1 text-white pl-20 z-10">
        <h1 className="text-5xl font-bold">Welcome To Taxpal</h1>
        <p className="mt-6 inline-block border border-white px-4 py-2 text-lg italic font-semibold rounded">
          Join us Today!!
        </p>
      </div>

      {/* Signup Card */}
      <div className="flex-1 flex items-center justify-center z-10">
        <div className="bg-black/50 shadow-lg rounded-xl p-8 w-96 border border-gray-700 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-white">Signup</h2>
          <p className="text-gray-400 text-sm mb-6">
            Just some details to get you in..!
          </p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Password with live validation */}
          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onFocus={() => setShowValidation(true)} // show on focus
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Validation rules (only visible after focus/typing) */}
          {showValidation && (
            <ul className="text-xs mb-4 space-y-1">
              <li className={passwordRules.length ? "text-green-400" : "text-red-400"}>
                {passwordRules.length ? "✔" : "✖"} At least 8 characters
              </li>
              <li className={passwordRules.uppercase ? "text-green-400" : "text-red-400"}>
                {passwordRules.uppercase ? "✔" : "✖"} At least 1 uppercase letter
              </li>
              <li className={passwordRules.number ? "text-green-400" : "text-red-400"}>
                {passwordRules.number ? "✔" : "✖"} At least 1 number
              </li>
              <li className={passwordRules.special ? "text-green-400" : "text-red-400"}>
                {passwordRules.special ? "✔" : "✖"} At least 1 special character
              </li>
            </ul>
          )}

          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="text"
            placeholder="Income (Optional)"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full mb-6 px-4 py-2 rounded border border-gray-600 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={handleSignup}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              isPasswordValid
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
            disabled={!isPasswordValid}
          >
            Signup
          </button>

          <p className="text-gray-400 text-sm mt-4 text-center">
            Already Registered?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-purple-400 hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
}
