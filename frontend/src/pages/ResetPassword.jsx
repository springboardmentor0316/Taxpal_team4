// src/pages/ResetPassword.jsx
import "./ResetPassword.css";
import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import api, { setAuthToken } from "../api";

export default function ResetPassword() {
  const [form, setForm] = useState({ p1: "", p2: "" });
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (!form.p1 || !form.p2) {
      setError("⚠️ Please fill all fields");
      toast.error("⚠️ Please fill all fields");
      return;
    }

    if (form.p1 !== form.p2) {
      setError("⚠️ Passwords do not match");
      toast.error("⚠️ Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const email = localStorage.getItem("resetEmail");
      const otp = localStorage.getItem("resetOtp");

      const res = await api.post("/users/reset-password", {
        email,
        otp,
        newPassword: form.p1,
      });

      // If backend returns a token after reset → save and set it
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        setAuthToken(res.data.token);
      }

      toast.success(" Password Reset Successful!");

      // Clear reset-related storage
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOtp");

      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || " Reset failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Welcome To Taxpal"
      heroChip="Update your Password!!"
      footerNote={
        <div>
          Don’t have an account?{" "}
          <Link className="link" to="/signup">
            Signup
          </Link>
        </div>
      }
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
          <span
            className="toggle-password"
            onClick={() => setShowP1(!showP1)}
          >
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
          <span
            className="toggle-password"
            onClick={() => setShowP2(!showP2)}
          >
            {showP2 ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        <button
          className="btn btn-gradient"
          type="submit"
          disabled={loading}
        >
          {loading ? "Updating..." : "Submit"}
        </button>
      </form>
    </AuthLayout>
  );
}
