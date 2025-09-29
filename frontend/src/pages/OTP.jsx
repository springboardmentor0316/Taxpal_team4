// src/pages/OTP.jsx
import "./OTP.css";
import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import api, { setAuthToken } from "../api";

export default function OTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verify = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("resetEmail"); // from ForgotPassword.jsx

    if (!otp) {
      setError("⚠️ Please enter the OTP");
      toast.error("⚠️ Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/users/verify-otp", { email, otp });

      // If backend returns a token → save and set in axios
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        setAuthToken(res.data.token);
      }

      // Save OTP separately for ResetPassword.jsx
      localStorage.setItem("resetOtp", otp);

      toast.success(" OTP verified!");
      navigate("/reset"); // redirect to ResetPassword.jsx
    } catch (err) {
      const msg = err.response?.data?.message || " Invalid OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Welcome To Taxpal"
      heroChip="Verify to Continue.."
      footerNote={
        <div>
          <Link className="link" to="/forgot">
            Back
          </Link>
        </div>
      }
    >
      <h2 className="auth-title">Enter OTP</h2>
      <p className="auth-sub">Please enter your OTP from email</p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={verify} className="auth-form">
        <input
          className="input"
          placeholder="example: 1234"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button className="btn btn-gradient" type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
