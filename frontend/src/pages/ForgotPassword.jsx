import "./ForgotPassword.css";
import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const nav = useNavigate();

  const validateEmail = (email) => {
    if (/\s/.test(email)) return " Email should not contain spaces";
    if (!email.includes("@")) return " Email must contain '@'";
    if (!/^[^\s@]+@gmail\.com₹/.test(email)) return " Only Gmail addresses allowed";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(" Enter your email");
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    try {
      await api.post("/forgot-password", { email });
      localStorage.setItem("resetEmail", email);
      toast.success(" OTP sent!");
      nav("/otp");
    } catch (err) {
      toast.error(err.response?.data?.message || " Failed to send OTP");
    }
  };

  return (
    <AuthLayout
      heroTitle="Welcome To Taxpal"
      heroChip="Don’t worry. We‘ve got you..!"
      layoutClass="forgot"
      footerNote={<div>Don’t have an account ? <Link className="link" to="/signup">Signup</Link></div>}
    >
      <h2 className="auth-title">Forgot Password ?</h2>
      <p className="auth-sub">Please enter your email</p>

      <form onSubmit={submit} className="auth-form">
        <input
          className="input"
          type="text"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-gradient" type="submit">Next</button>
      </form>
    </AuthLayout>
  );
}
