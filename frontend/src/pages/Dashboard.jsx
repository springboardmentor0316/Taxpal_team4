// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  FaHome,
  FaWallet,
  FaListAlt,
  FaCalculator,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336", "#00BCD4"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ income: 0, expense: 0, savings: 0 });
  const [pieData, setPieData] = useState([]);
  const [recent, setRecent] = useState([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [record, setRecord] = useState({
    type: "income",
    category: "",
    amount: "",
    date: "",
    note: "",
  });

  // ✅ Fetch dashboard data (one-time on mount)
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard");
      const { totals, pie, recent } = res.data;
      setTotals(totals);
      setPieData(pie.map((p) => ({ name: p._id, value: p.total })));
      setRecent(recent);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(); // load only once
  }, []);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ✅ Record handlers
  const onRecordChange = (e) =>
    setRecord({ ...record, [e.target.name]: e.target.value });

  const submitRecord = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: record.type,
        category: record.category,
        amount: Number(record.amount),
        date: record.date || new Date().toISOString(),
        note: record.note || "",
      };
      await api.post("/transactions", payload);
      toast.success("Recorded");
      setShowRecordModal(false);
      setRecord({ type: "income", category: "", amount: "", date: "", note: "" });
      fetchDashboard(); // reload after adding record
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record");
    }
  };

  const handleDeleteTx = async (id) => {
    if (!window.confirm("Delete transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Deleted");
      fetchDashboard();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleEditTx = async (tx) => {
    const newAmount = prompt("Update amount", tx.amount);
    if (newAmount == null) return;
    try {
      await api.put(`/transactions/${tx._id}`, { amount: Number(newAmount) });
      toast.success("Updated");
      fetchDashboard();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const avatarLetter = (name = "") =>
    name ? name.trim()[0].toUpperCase() : "U";

  return (
    <div className="home-container">
      <ToastContainer position="bottom-right" autoClose={2000} />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <img src="/assets/logo.png" alt="Taxpal Logo" />
        </div>
        <nav>
          <Link to="/dashboard" className="sidebar-item active">
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
        {loading ? (
          <div className="loading">Loading dashboard...</div>
        ) : (
          <>
            {/* Topbar */}
            <div className="topbar">
              <input type="text" placeholder="Search..." />
              <div className="topbar-right">
                <button>7 Days</button>
                <button>☀️/🌙</button>
                <button>🔔</button>
                <div className="profile">👤</div>
              </div>
            </div>

            {/* Record buttons */}
            <div className="record-buttons">
              <button
                className="record-btn income-btn"
                onClick={() => {
                  setRecord({ ...record, type: "income" });
                  setShowRecordModal(true);
                }}
              >
                + Record Income
              </button>
              <button
                className="record-btn expense-btn"
                onClick={() => {
                  setRecord({ ...record, type: "expense" });
                  setShowRecordModal(true);
                }}
              >
                + Record Expense
              </button>
            </div>

            {/* Cards */}
            <div className="cards-row">
              <div className="card">
                Estimated Tax Due <h3>₹{(totals.income * 0.1).toFixed(2)}</h3>
              </div>
              <div className="card">
                Monthly Income <h3>₹{totals.income}</h3>
              </div>
              <div className="card">
                Monthly Expenses <h3>₹{totals.expense}</h3>
              </div>
              <div className="card">
                Savings <h3>₹{totals.savings}</h3>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-row">
              <div className="chart-card">
                <h3>All Expenses</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${v}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h3>Earning Flow</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={recent
                      .slice()
                      .reverse()
                      .map((r) => ({
                        name: new Date(r.date).toLocaleDateString(),
                        uv: r.amount,
                      }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v) => `₹${v}`} />
                    <Line
                      type="monotone"
                      dataKey="uv"
                      stroke="#4CAF50"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom row */}
            <div className="bottom-row">
              <div className="transactions-card">
                <h3>Recent Transaction</h3>
                <ul>
                  {recent.map((tx) => (
                    <li key={tx._id}>
                      <div className="tx-info">
                        <div className="avatar">
                          {avatarLetter(tx.category || tx.note || "U")}
                        </div>
                        <div>
                          <p>{tx.category}</p>
                          <small>{new Date(tx.date).toLocaleString()}</small>
                        </div>
                      </div>
                      <div className="tx-right">
                        <span>₹{tx.amount}</span>
                        <div className="tx-actions">
                          <button onClick={() => handleEditTx(tx)}>Edit</button>
                          <button onClick={() => handleDeleteTx(tx._id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-info">
                <h3>Card Information</h3>
                <p>
                  Status: <span className="active">Active</span>
                </p>
                <p>Card: Credit</p>
                <p>Card Type: Visa</p>
                <p>Card Number: 223456****</p>
                <p>Expire Date: 12-12-2026</p>
                <p>Currency: INR</p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Record Modal */}
      {showRecordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{record.type === "income" ? "Record Income" : "Record Expense"}</h3>
              <button onClick={() => setShowRecordModal(false)}>✕</button>
            </div>

            <form onSubmit={submitRecord} className="modal-form">
              {/* Category + Amount in one row */}
              <div className="form-row equal-row">
                <label className="form-col">
                  Category
                  <select
                    name="category"
                    value={record.category}
                    onChange={onRecordChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </label>

                <label className="form-col">
                  Amount
                  <input
                    name="amount"
                    type="number"
                    value={record.amount}
                    onChange={onRecordChange}
                    required
                  />
                </label>
              </div>

              {/* Date full width */}
              <label>
                Date
                <input
                  name="date"
                  type="date"
                  value={record.date}
                  onChange={onRecordChange}
                />
              </label>

              {/* Note full width */}
              <label>
                Note (Optional)
                <textarea
                  name="note"
                  value={record.note}
                  onChange={onRecordChange}
                />
              </label>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowRecordModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
