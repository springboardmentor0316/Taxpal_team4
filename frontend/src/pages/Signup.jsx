import "./Signup.css";
import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api";

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm: "", country: "", bracket: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validateEmail = (email) => {
    if (/\s/.test(email)) return " Email should not contain spaces";
    if (!email.includes("@")) return " Email must contain '@'";
    if (!/^[^\s@]+@gmail\.com₹/.test(email)) return " Only Gmail addresses allowed";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.confirm || !form.country) {
      toast.error(" Fill all required fields");
      return;
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    if (form.password !== form.confirm) {
      toast.error(" Passwords do not match");
      return;
    }

    try {
      await api.post("/signup", {
        name: form.username,
        email: form.email,
        password: form.password,
        country: form.country,
        income: form.bracket,
      });
      toast.success(" Signup Successfull!");
      nav("/");
    } catch (err) {
      toast.error(err.response?.data?.message || " Signup failed");
    }
  };

  return (
    <div className="signup-page no-scroll">
      <AuthLayout
        heroTitle="Welcome To Taxpal"
        heroChip="Join us Today!!"
        footerNote={<div>Already Registered? <Link className="link" to="/">Login</Link></div>}
      >
        <h2 className="auth-title">Signup</h2>
        <p className="auth-sub">Just some details to get you in.!</p>

        <form onSubmit={submit} className="auth-form">
          <input className="input" name="username" placeholder="Username" value={form.username} onChange={onChange}/>
          <input className="input" name="email" placeholder="Email" value={form.email} onChange={onChange}/>
          
          <div className="password-wrapper">
            <input
              className="input"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={onChange}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
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
            <span className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <input className="input" name="country" placeholder="Country" value={form.country} onChange={onChange}/>
          <input className="input" name="bracket" placeholder="Income Bracket (Optional)" value={form.bracket} onChange={onChange}/>

          <button className="btn btn-gradient" type="submit">Signup</button>
        </form>
      </AuthLayout>
    </div>
  );
}
