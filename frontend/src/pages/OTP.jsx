import "./OTP.css";
import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

export default function OTP() {
  const nav = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const verify = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("resetEmail"); // already saved in ForgotPassword.jsx

    if (!otp) {
      setError("⚠️ Please enter the OTP");
      return;
    }

    try {
      await api.post("/verify-otp", { email, otp });

      // ✅ Save OTP for reset step
      localStorage.setItem("resetOtp", otp);

      toast.success(" OTP verified!");
      nav("/reset"); // go to ResetPassword.jsx
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <AuthLayout
      heroTitle="Welcome To Taxpal"
      heroChip="Verify to Continue.."
      footerNote={<div><Link className="link" to="/forgot">Back</Link></div>}
    >
      <h2 className="auth-title">Enter OTP</h2>
      <p className="auth-sub">Please enter your OTP from email</p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={verify} className="auth-form">
        <input
          className="input"
          placeholder="example:1234"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button className="btn btn-gradient" type="submit">
          Reset Password
        </button>
      </form>
    </AuthLayout>
  );
}
