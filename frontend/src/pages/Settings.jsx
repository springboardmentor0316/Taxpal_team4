// src/pages/Settings.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Settings.css";

import {
  FaHome,
  FaWallet,
  FaListAlt,
  FaCalculator,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaBell,
  FaShieldAlt,
  FaEdit,
  FaTimes,
} from "react-icons/fa";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🔹 Import LogoutConfirm modal
import LogoutConfirm from "../components/LogoutConfirm";

export default function Settings() {
  const navigate = useNavigate();

  const [leftTab, setLeftTab] = useState("categories");
  const [categoryType, setCategoryType] = useState("expense");

  const [expenseCategories, setExpenseCategories] = useState([
    "Business Expenses",
    "Office Rent",
    "Software Subscriptions",
    "Professional Development",
    "Marketing",
    "Travel",
    "Meal & Entertainment",
    "Utilities",
  ]);
  const [incomeCategories, setIncomeCategories] = useState([
    "Salary",
    "Investment Income",
    "Freelance",
    "Rental Income",
  ]);

  // 🔹 State for Logout Confirm Modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Trigger logout modal
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // Cancel logout
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Confirm logout
  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    toast.info("Logged out successfully");
    setShowLogoutConfirm(false);
    setTimeout(() => navigate("/", { replace: true }), 800);
  };

  const handleDeleteCategory = (index) => {
    if (categoryType === "expense") {
      const updated = expenseCategories.filter((_, i) => i !== index);
      setExpenseCategories(updated);
    } else {
      const updated = incomeCategories.filter((_, i) => i !== index);
      setIncomeCategories(updated);
    }
    toast.success("Category removed");
  };

  const handleEditCategory = (index) => {
    const current =
      categoryType === "expense"
        ? expenseCategories[index]
        : incomeCategories[index];
    const newName = prompt("Edit category name:", current);
    if (!newName) return;
    if (categoryType === "expense") {
      const updated = [...expenseCategories];
      updated[index] = newName;
      setExpenseCategories(updated);
    } else {
      const updated = [...incomeCategories];
      updated[index] = newName;
      setIncomeCategories(updated);
    }
    toast.success("Category updated");
  };

  const handleAddCategory = () => {
    const name = prompt(`Add new ${categoryType} category:`);
    if (!name) return;
    if (categoryType === "expense")
      setExpenseCategories([...expenseCategories, name]);
    else setIncomeCategories([...incomeCategories, name]);
    toast.success("Category added");
  };

  const currentCategories =
    categoryType === "expense" ? expenseCategories : incomeCategories;

  return (
    <div className="home-container">
      <ToastContainer position="bottom-right" autoClose={2000} />

      {/* ================== Sidebar ================== */}
      <aside className="sidebar">
        <div className="logo">
          <img src="/assets/logo.png" alt="Taxpal Logo" />
        </div>

        <nav>
          <Link to="/dashboard" className="sidebar-item">
            <FaHome /> <span>Dashboard</span>
          </Link>
          <Link to="/transactions" className="sidebar-item">
            <FaWallet /> <span>Transactions</span>
          </Link>
          <Link to="/budgets" className="sidebar-item">
            <FaListAlt /> <span>Budgets</span>
          </Link>
          <Link to="/tax" className="sidebar-item">
            <FaCalculator /> <span>Tax Estimator</span>
          </Link>
          <Link to="/reports" className="sidebar-item">
            <FaFileAlt /> <span>Reports</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <Link to="/settings" className="sidebar-item active">
            <FaCog /> <span>Settings</span>
          </Link>

          {/* 🔹 Open modal instead of direct logout */}
          <div className="sidebar-item logout" onClick={handleLogoutClick}>
            <FaSignOutAlt /> <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* ================== Main Content ================== */}
      <main className="main-content settings-main">
        {/* Topbar */}
        <div className="topbar">
          <input type="text" placeholder="Search..." />
          <div className="topbar-right">
            <button className="tiny-btn">7 Days ▾</button>
            <button className="tiny-btn">☀️/🌙</button>
            <button className="tiny-btn">🔔</button>
            <div className="profile">👤</div>
          </div>
        </div>

        {/* Settings content */}
        <div className="settings-container">
          <aside className="settings-sidebar">
            <h2>
              <FaCog className="section-icon" /> Settings
            </h2>
            <p className="settings-subtitle">Manage your account settings</p>

            <ul className="settings-menu">
              <li
                className={leftTab === "profile" ? "active" : ""}
                onClick={() => setLeftTab("profile")}
                role="button"
                tabIndex={0}
              >
                <FaUser className="menu-icon" /> Profile
              </li>

              <li
                className={leftTab === "categories" ? "active" : ""}
                onClick={() => setLeftTab("categories")}
                role="button"
                tabIndex={0}
              >
                <FaListAlt className="menu-icon" /> Categories
              </li>

              <li
                className={leftTab === "notifications" ? "active" : ""}
                onClick={() => setLeftTab("notifications")}
                role="button"
                tabIndex={0}
              >
                <FaBell className="menu-icon" /> Notifications
              </li>

              <li
                className={leftTab === "security" ? "active" : ""}
                onClick={() => setLeftTab("security")}
                role="button"
                tabIndex={0}
              >
                <FaShieldAlt className="menu-icon" /> Security
              </li>
            </ul>
          </aside>

          <section className="settings-content">
            {leftTab === "categories" && (
              <div className="settings-card bright-card">
                <div className="settings-header">
                  <h2>Category Management</h2>
                  <div className="settings-links">
                    <button
                      className={`small-link ${
                        categoryType === "expense" ? "underline" : ""
                      }`}
                      onClick={() => setCategoryType("expense")}
                    >
                      Expense Categories
                    </button>
                    <button
                      className={`small-link ${
                        categoryType === "income" ? "underline" : ""
                      }`}
                      onClick={() => setCategoryType("income")}
                    >
                      Income Categories
                    </button>
                  </div>
                </div>

                <div className="categories-list">
                  {currentCategories.length === 0 ? (
                    <div className="empty">No categories yet</div>
                  ) : (
                    currentCategories.map((category, idx) => (
                      <div className="category-item bright-category" key={idx}>
                        <span>{category}</span>
                        <div className="actions">
                          <FaEdit
                            className="icon edit"
                            onClick={() => handleEditCategory(idx)}
                          />
                          <FaTimes
                            className="icon delete"
                            onClick={() => handleDeleteCategory(idx)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="add-row">
                  <button className="add-btn center-btn" onClick={handleAddCategory}>
                    + Add New Category
                  </button>
                </div>
              </div>
            )}

            {leftTab === "profile" && (
              <div className="settings-card bright-card">
                <h3>Profile</h3>
                <p>Edit your name, email, country, income bracket, avatar here.</p>
              </div>
            )}

            {leftTab === "notifications" && (
              <div className="settings-card bright-card">
                <h3>Notifications</h3>
                <p>Manage email/push notification preferences.</p>
              </div>
            )}

            {leftTab === "security" && (
              <div className="settings-card bright-card">
                <h3>Security</h3>
                <p>Change password, enable 2FA, manage sessions.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 🔹 Logout Confirmation Modal */}
      <LogoutConfirm
        show={showLogoutConfirm}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
