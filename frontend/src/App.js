import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth Pages
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import ForgotPassword from "./ForgotPassword";
import OtpPage from "./OtpPage";
import ResetPassword from "./ResetPassword";

// Main App Pages
import IncomePage from "./IncomePage";
import ExpensePage from "./ExpensePage";
import DashboardPage from "./DashboardPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → Login page */}
        <Route path="/" element={<LoginPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Main App Routes */}
        <Route path="/income" element={<IncomePage />} />
        <Route path="/expense" element={<ExpensePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}
