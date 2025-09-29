// src/pages/Signup.jsx
import "./Signup.css";
import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import api, { setAuthToken } from "../api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    country: "",
    bracket: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateEmail = (email) => {
    if (/\s/.test(email)) return "Email should not contain spaces";
    if (!email.includes("@")) return "Email must contain '@'";
    if (!/^[^\s@]+@gmail\.com$/.test(email)) return "Only Gmail addresses allowed";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Required fields
    if (!form.username || !form.email || !form.password || !form.confirm || !form.country) {
      toast.error("Fill all required fields");
      return;
    }

    // Email validation
    const emailError = validateEmail(form.email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    // Password match
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // API call with 'name' field
      const res = await api.post("/users/signup", {
        name: form.username,   // sending 'username' as 'name' to backend
        email: form.email,
        password: form.password,
        country: form.country,
        income: form.bracket,
      });

      // Set token globally if returned
      if (res.data.token) {
        setAuthToken(res.data.token);
      }

      toast.success("Signup Successful!");
      navigate("/home"); // Go directly to home
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page no-scroll">
      <AuthLayout
        heroTitle="Welcome To Taxpal"
        heroChip="Join us Today!!"
        footerNote={
          <div>
            Already Registered? <Link className="link" to="/">Login</Link>
          </div>
        }
      >
        <h2 className="auth-title">Signup</h2>
        <p className="auth-sub">Just some details to get you in.!</p>

        <form onSubmit={submit} className="auth-form">
          <input
            className="input"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={onChange}
          />
          <input
            className="input"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
          />

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

          <div className="password-wrapper">
            <input
              className="input"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={onChange}
            />
            <span
              className="toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <input
            className="input"
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={onChange}
          />
          <input
            className="input"
            name="bracket"
            placeholder="Income Bracket (Optional)"
            value={form.bracket}
            onChange={onChange}
          />

          <button className="btn btn-gradient" type="submit" disabled={loading}>
            {loading ? "Signing up…" : "Signup"}
          </button>
        </form>
      </AuthLayout>
    </div>
  );
}
