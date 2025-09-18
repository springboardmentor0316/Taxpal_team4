// src/pages/Login.jsx
import "./Login.css";
import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api";
//import { api, setAuthToken } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Gmail validation (fixed regex)
  const validateEmail = (email) => {
    if (/\s/.test(email)) return "Email should not contain spaces";
    if (!email.includes("@")) return "Email must contain '@'";
    if (!/^[^\s@]+@gmail\.com$/.test(email)) return "Only Gmail addresses allowed";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();

    // ✅ Empty field check
    if (!form.email || !form.password) {
      toast.error("Enter all fields");
      return;
    }

    // ✅ Email validation
    const emailError = validateEmail(form.email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    try {
      // ✅ API login call
      const res = await api.post("/users/login", form);

      // ✅ Save token + set auth header
      localStorage.setItem("token", res.data.token);
      //setAuthToken(res.data.token);

      toast.success("Logged in Successfully!");

      // ✅ Navigate in same tab
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout
      heroTitle="Welcome To Taxpal"
      heroChip="Good to see you again!!"
      footerNote={
        <div>
          Don’t have an account?{" "}
          <Link className="link" to="/signup">
            Signup
          </Link>
        </div>
      }
    >
      <h2 className="auth-title">Login</h2>
      <p className="auth-sub">Glad you're back.!</p>

      <form onSubmit={submit} className="auth-form">
        {/* Email */}
        <input
          className="input"
          name="email"
          type="text"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
        />

        {/* Password with toggle */}
        <div className="password-wrapper">
          <input
            className="input"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={onChange}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        {/* Forgot password */}
        <div className="row-between">
          <span />
          <Link className="link" to="/forgot">
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <button className="btn btn-gradient" type="submit">
          Login
        </button>
      </form>
    </AuthLayout>
  );
}
