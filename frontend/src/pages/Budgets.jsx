// src/pages/Budgets.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Budgets.css";
import {
  FaHome,
  FaWallet,
  FaListAlt,
  FaCalculator,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaBullseye,
  FaReceipt,
  FaRegCalendarAlt,
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Budgets() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [formData, setFormData] = useState({
    _id: "",
    category: "",
    budget: "",
    date: "",
    description: "",
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const fetchBudgets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/budgets`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setBudgets(res.data.budgets || []);
    } catch (err) {
      console.error("fetchBudgets error", err);
      toast.error(err.response?.data?.message || "Failed to load budgets");
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/transactions`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("fetchTransactions error", err);
      toast.error(err.response?.data?.message || "Failed to load transactions");
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchTransactions();
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // 🔑 Calculate spent per category for the budget's month/year
  const calculateSpent = (category, date) => {
    const dateObj = date ? new Date(date) : new Date();
    const targetMonth = dateObj.getMonth();
    const targetYear = dateObj.getFullYear();

    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === category &&
          new Date(t.date).getMonth() === targetMonth &&
          new Date(t.date).getFullYear() === targetYear
      )
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  const getStatus = (budget, spent) => {
    if (spent > budget) return { label: "Exceeded", className: "status-exceeded" };
    if (budget - spent < 50) return { label: "Nearly Exceeded", className: "status-warning" };
    return { label: "On Track", className: "status-success" };
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      if (!token) return toast.error("Not authorized");

      const payload = {
        category: formData.category,
        amount: Number(formData.budget),
        date: formData.date,
        description: formData.description || "",
      };

      let res;
      if (editMode && formData._id) {
        res = await axios.put(`${API_URL}/api/budgets/${formData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Budget updated");
        setBudgets((prev) =>
          prev.map((b) => (b._id === formData._id ? res.data.budget : b))
        );
      } else {
        res = await axios.post(`${API_URL}/api/budgets`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Budget created");
        setBudgets((prev) => [res.data.budget, ...prev]);
      }

      setShowModal(false);
      setFormData({ _id: "", category: "", budget: "", date: "", description: "" });
      setEditMode(false);
    } catch (err) {
      console.error("create/update budget error", err);
      toast.error(err.response?.data?.message || "Failed to save budget");
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      _id: budget._id,
      category: budget.category,
      budget: budget.amount,
      date: budget.date?.slice(0, 7) || new Date().toISOString().slice(0, 7),
      description: budget.description || "",
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await axios.delete(`${API_URL}/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Budget deleted");
      setBudgets((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("deleteBudget error", err);
      toast.error(err.response?.data?.message || "Failed to delete budget");
    }
  };

  // Summary values
  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalSpent = budgets.reduce(
    (sum, b) => sum + calculateSpent(b.category, b.date),
    0
  );
  const remaining = totalBudget - totalSpent;
  const spentPercent = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const openCreateModal = () => {
    setEditMode(false);
    setFormData({
      _id: "",
      category: "",
      budget: "",
      date: new Date().toISOString().slice(0, 7),
      description: "",
    });
    setShowModal(true);
  };

  return (
    <div className="budgets-page">
      <ToastContainer position="bottom-right" autoClose={2000} />

      {/* Sidebar */}
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
          <Link to="/budgets" className="sidebar-item active">
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
          <Link to="/settings" className="sidebar-item">
            <FaCog /> <span>Settings</span>
          </Link>
          <div className="sidebar-item logout" onClick={handleLogout}>
            <FaSignOutAlt /> <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <input type="text" placeholder="Search..." />
          <div className="topbar-right">
            <button>7 Days</button>
            <button>☀️/🌙</button>
            <button>🔔</button>
            <div className="profile">👤</div>
          </div>
        </div>

        <div className="budget-header">
          <div>
            <h2>Budget Management</h2>
            <p>Manage your budgets and track spending</p>
          </div>
          <button
            className="create-btn"
            onClick={openCreateModal}
            style={{
              background: "linear-gradient(90deg,#6366f1,#a855f7)",
              color: "#fff",
              border: "none",
              padding: "10px 14px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Create New Budget
          </button>
        </div>

        {/* Summary */}
        <div className="summary-row">
          <div className="summary-card">
            <div className="summary-icon blue">
              <FaBullseye />
            </div>
            <div>
              <p>Total Budget</p>
              <h3>₹{totalBudget}</h3>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon red">
              <FaReceipt />
            </div>
            <div>
              <p>Total Spent</p>
              <h3>₹{totalSpent}</h3>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon orange">
              <span>{spentPercent}%</span>
            </div>
            <div>
              <p>Remaining</p>
              <h3>₹{remaining >= 0 ? remaining : 0}</h3>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="budget-table">
          <h3>Budget Overview</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((item, index) => {
                const spent = calculateSpent(item.category, item.date);
                const rem = (item.amount || 0) - spent;
                const status = getStatus(item.amount || 0, spent);
                return (
                  <tr key={item._id || index}>
                    <td>{item.category}</td>
                    <td>₹{item.amount}</td>
                    <td>₹{spent}</td>
                    <td className={rem >= 0 ? "green" : "red"}>₹{Math.abs(rem)}</td>
                    <td>
                      <span className={`status-badge ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="actions-wrapper">
                        <FaEllipsisV
                          className="ellipsis-icon"
                          onClick={() => setOpenMenu(openMenu === index ? null : index)}
                        />
                        {openMenu === index && (
                          <div className="action-menu">
                            <button className="edit-btn" onClick={() => handleEdit(item)}>
                              <FaEdit /> Edit
                            </button>
                            <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {budgets.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                    No budgets yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editMode ? "Edit Budget" : "Create New Budget"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="modal-form">
              <div className="form-grid">
                <label>
                  Category
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </label>

                <label>
                  Budget Amount
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </label>
              </div>

              <label className="month-label">
                Month
                <div className="month-input-wrapper">
                  <FaRegCalendarAlt className="calendar-icon" style={{ color: "#fff" }} />
                  <input
                    type="month"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </label>

              <label>
                Description (Optional)
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add any additional details..."
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                  style={{
                    background: "linear-gradient(90deg,#6366f1,#a855f7)",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {editMode ? "Update Budget" : "Create Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
