import "./ResetPassword.css";
import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api";

export default function ResetPassword() {
  const [form, setForm] = useState({ p1: "", p2: "" });
  const [error, setError] = useState("");
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const nav = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.p1 || !form.p2) {
      setError("⚠️ Please fill all fields");
      return;
    }
    if (form.p1 !== form.p2) {
      setError("⚠️ Passwords do not match");
      return;
    }

    try {
      const email = localStorage.getItem("resetEmail");
      const otp = localStorage.getItem("resetOtp"); // ✅ Now we send OTP too

      await api.post("/reset-password", {
        email,
        otp,
        newPassword: form.p1,
      });

      toast.success(" Password Reset Successful!");
      // clear localStorage
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOtp");

      nav("/");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <AuthLayout
      heroTitle="Welcome To Taxpal"
      heroChip="Update your Password!!"
      footerNote={<div>Don’t have an account ? <Link className="link" to="/signup">Signup</Link></div>}
    >
      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-sub">Set your New Password!!</p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={submit} className="auth-form">
        <div className="password-wrapper">
          <input
            className="input"
            name="p1"
            type={showP1 ? "text" : "password"}
            placeholder="New Password"
            value={form.p1}
            onChange={onChange}
          />
          <span className="toggle-password" onClick={() => setShowP1(!showP1)}>
            {showP1 ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        <div className="password-wrapper">
          <input
            className="input"
            name="p2"
            type={showP2 ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.p2}
            onChange={onChange}
          />
          <span className="toggle-password" onClick={() => setShowP2(!showP2)}>
            {showP2 ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        <button className="btn btn-gradient" type="submit">Submit</button>
      </form>
    </AuthLayout>
  );
}
