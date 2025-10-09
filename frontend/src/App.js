import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import OTP from "./pages/OTP";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Budgets from "./pages/Budgets";
import TaxEstimator from "./pages/TaxEstimator";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import "./styles/global.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />{" "}
        <Route path="/signup" element={<Signup />} />{" "}
        <Route path="/forgot" element={<ForgotPassword />} />{" "}
        <Route path="/otp" element={<OTP />} />{" "}
        <Route path="/reset" element={<ResetPassword />} />{" "}
        <Route path="/home" element={<Home />} />{" "}
        <Route path="/dashboard" element={<Dashboard />} />{" "}
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/tax" element={<TaxEstimator />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/transactions" element={<Transactions />} />
      </Routes>{" "}
      {/* ✅ Toasts appear at the top-right corner */}{" "}
      <ToastContainer position="top-right" autoClose={3000} />{" "}
    </BrowserRouter>
  );
}
