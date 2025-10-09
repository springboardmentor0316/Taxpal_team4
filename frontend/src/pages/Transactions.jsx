// src/pages/Transactions.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import "./Transactions.css";
import {
  FaHome,
  FaWallet,
  FaListAlt,
  FaCalculator,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaEllipsisV,
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoutConfirm from "../components/LogoutConfirm";

export default function Transactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const highlightTxId = location.state?.highlightTxId || null;
  const openViewMore = location.state?.openViewMore || false;

  const [transactions, setTransactions] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [showAll, setShowAll] = useState(openViewMore);

  const [highlightGroup, setHighlightGroup] = useState({ description: "", category: "" });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // When highlightTxId changes, find the transaction's description and category for group highlight
  useEffect(() => {
    if (highlightTxId && transactions.length > 0) {
      const tx = transactions.find((t) => t._id === highlightTxId);
      if (tx) {
        setHighlightGroup({ description: tx.description, category: tx.category });
      }
    }
  }, [highlightTxId, transactions]);

  // Clear highlight after 4 seconds
  useEffect(() => {
    if (highlightTxId) {
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true });
        setHighlightGroup({ description: "", category: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [highlightTxId, navigate, location.pathname]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/transactions`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const tx = res.data.transactions || [];
      setTransactions(tx.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("fetchTransactions error", err);
      toast.error(err.response?.data?.message || "Failed to load transactions");
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 15000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.info("Logged out successfully");
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await axios.delete(`${API_URL}/api/transactions/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      toast.success("Transaction deleted");
      fetchTransactions();
    } catch (err) {
      console.error("deleteTransaction error", err);
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const openEditModalFunc = (tx) => {
    setEditTx({
      type: tx.type,
      category: tx.category,
      description: tx.description,
      amount: tx.amount,
      date: tx.date.split("T")[0],
      note: tx.note || "",
      _id: tx._id,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTx((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const [yyyy, mm, dd] = editTx.date.split("-");
      const now = new Date();
      const dateIso = new Date(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      ).toISOString();
      const payload = {
        ...editTx,
        amount: Number(editTx.amount),
        date: dateIso,
      };
      await axios.put(`${API_URL}/api/transactions/${editTx._id}`, payload, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      toast.success("Transaction updated");
      setShowEditModal(false);
      setEditTx(null);
      fetchTransactions();
    } catch (err) {
      console.error("submitEdit error", err);
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const displayedTx = showAll ? transactions : transactions.slice(0, 5);

  return (
    <div className="transactions-page">
      <ToastContainer position="bottom-right" autoClose={2000} />

      {/* Sidebar */}
      <aside className="sidebar always-expanded">
        <div className="logo">
          <img src="/assets/logo.png" alt="Taxpal Logo" />
        </div>
        <nav>
          <Link to="/dashboard" className="sidebar-item">
            <FaHome /> <span className="label">Dashboard</span>
          </Link>
          <Link to="/transactions" className="sidebar-item active">
            <FaWallet /> <span className="label">Transactions</span>
          </Link>
          <Link to="/budgets" className="sidebar-item">
            <FaListAlt /> <span className="label">Budgets</span>
          </Link>
          <Link to="/tax" className="sidebar-item">
            <FaCalculator /> <span className="label">Tax Estimator</span>
          </Link>
          <Link to="/reports" className="sidebar-item">
            <FaFileAlt /> <span className="label">Reports</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <Link to="/settings" className="sidebar-item">
            <FaCog /> <span className="label">Settings</span>
          </Link>
          <div
            className="sidebar-item logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <FaSignOutAlt /> <span className="label">Logout</span>
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

        {/* Transaction Management Section */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "0.3rem",
            }}
          >
            Transaction Management
          </h1>
          <p
            style={{
              color: "#9CA3AF",
              fontSize: "1rem",
              marginBottom: "1rem",
            }}
          >
            Manage and review all your financial transactions in one place.
          </p>
        </div>

        {/* Transactions Overview Section in Card */}
        <div
          className="transactions-overview-card"
          style={{
            backgroundColor: "#1F2937",
            color: "#fff",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            className="transactions-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Transactions Overview</h3>
            {transactions.length > 5 && (
              <span
                onClick={() => setShowAll((p) => !p)}
                style={{
                  color: "#3b82f6",
                  cursor: "pointer",
                  fontWeight: "500",
                  textDecoration: "none",
                }}
                onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                onMouseOut={(e) => (e.target.style.textDecoration = "none")}
              >
                {showAll ? "Show Less" : "View More"}
              </span>
            )}
          </div>

          {/* Transactions Table */}
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedTx.map((tx, index) => {
                  const highlight =
                    (highlightGroup.description && highlightGroup.category
                      ? tx.description === highlightGroup.description &&
                        tx.category === highlightGroup.category
                      : tx._id === highlightTxId);
                  return (
                    <tr
                      key={tx._id || index}
                      className={highlight ? "highlighted" : ""}
                    >
                      <td
                        className={tx.type === "income" ? "green-text" : "red-text"}
                      >
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </td>
                      <td>{tx.category}</td>
                      <td>{tx.description}</td>
                      <td>₹{tx.amount}</td>
                      <td>{formatDate(tx.date)}</td>
                      <td>{tx.note || "-"}</td>
                      <td className="actions-cell">
                        <FaEllipsisV
                          className="ellipsis-icon"
                          onClick={() =>
                            setOpenMenu(openMenu === index ? null : index)
                          }
                        />
                        {openMenu === index && (
                          <div className="action-menu">
                            <button
                              className="edit-btn"
                              onClick={() => openEditModalFunc(tx)}
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(tx._id)}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && editTx && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {editTx.type === "income" ? "Edit Income" : "Edit Expense"}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditTx(null);
                }}
              >
                ✕
              </button>
            </div>
            <form className="modal-form" onSubmit={submitEdit}>
              <div className="form-row equal-row">
                <label className="form-col">
                  Description
                  <input
                    type="text"
                    name="description"
                    value={editTx.description}
                    onChange={handleEditChange}
                    required
                  />
                </label>
                <label className="form-col">
                  Category
                  <select
                    name="category"
                    value={editTx.category}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Others">Others</option>
                  </select>
                </label>
              </div>
              <div className="form-row equal-row">
                <label className="form-col">
                  Amount
                  <input
                    type="number"
                    name="amount"
                    value={editTx.amount}
                    onChange={handleEditChange}
                    required
                  />
                </label>
                <label className="form-col">
                  Date
                  <input
                    type="date"
                    name="date"
                    value={editTx.date}
                    onChange={handleEditChange}
                    required
                  />
                </label>
              </div>
              <label>
                Note (Optional)
                <textarea
                  name="note"
                  value={editTx.note}
                  onChange={handleEditChange}
                ></textarea>
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditTx(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      <LogoutConfirm
        show={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
