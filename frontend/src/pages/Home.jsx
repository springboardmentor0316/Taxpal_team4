// src/pages/Home.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
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
  FaCreditCard,
  FaDollarSign,
  FaMoneyBillAlt,
  FaChartLine,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoutConfirm from "../components/LogoutConfirm";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336", "#00BCD4"];

const CATEGORY_COLORS = {
  "Food & Dining": "#F44336",
  Transportation: "#2196F3",
  Entertainment: "#9C27B0",
  Shopping: "#FF9800",
  Utilities: "#FFC107",
  Healthcare: "#4CAF50",
  Others: "#00BCD4",
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getMonthsOfQuarter(q) {
  if (q === 1) return ["Jan", "Feb", "Mar"];
  if (q === 2) return ["Apr", "May", "Jun"];
  if (q === 3) return ["Jul", "Aug", "Sep"];
  return ["Oct", "Nov", "Dec"];
}

function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        padding: 8,
        borderRadius: 6,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          color: "#000",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            color: p.fill || "#333",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              background: p.fill || "#ccc",
              borderRadius: 2,
            }}
          />
          <div style={{ fontSize: 13 }}>
            {p.name}: <span style={{ fontWeight: 700 }}>{`₹${p.value}`}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ income: 0, expense: 0, savings: 0 });
  const [pieData, setPieData] = useState([]);
  const [recent, setRecent] = useState([]);
  const [allTx, setAllTx] = useState([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAllTx, setShowAllTx] = useState(false);
  const [showMenu, setShowMenu] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [filter, setFilter] = useState("Year");
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);
  const [recentSortOrder, setRecentSortOrder] = useState("Newest to Oldest");
  const [searchTerm, setSearchTerm] = useState("");
  const [record, setRecord] = useState({
    type: "income",
    category: "",
    description: "",
    amount: "",
    date: getLocalDateString(),
    note: "",
  });
  const [username, setUsername] = useState("");

  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me");
      setUsername(res.data.name || "User");
    } catch (err) {
      console.error("fetchUser error", err);
      setUsername("User");
    }
  };

  const hasToken = () => !!localStorage.getItem("token");

  const fetchDashboard = useCallback(async () => {
    if (!hasToken()) {
      setTotals({ income: 0, expense: 0, savings: 0 });
      setPieData([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get("/dashboard");
      const { totals: newTotals, pie } = res.data || {};
      setTotals(newTotals || { income: 0, expense: 0, savings: 0 });
      setPieData(
        Array.isArray(pie)
          ? pie.map((p) => ({ name: p._id, value: p.total }))
          : []
      );
    } catch (err) {
      console.error("fetchDashboard error", err);
      if (hasToken())
        toast.error(err?.response?.data?.message || "Could not load dashboard");
      setTotals({ income: 0, expense: 0, savings: 0 });
      setPieData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!hasToken()) {
      setAllTx([]);
      setRecent([]);
      return;
    }
    try {
      const res = await api.get("/transactions");
      let txs = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.transactions)
        ? res.data.transactions
        : [];
      txs.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAllTx(txs);
      const newestFirst = [...txs].reverse();
      setRecent(newestFirst.slice(0, 5));
    } catch (err) {
      console.error("fetchTransactions error", err);
      if (hasToken()) toast.error("Could not load transactions");
      setAllTx([]);
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchDashboard();
    fetchTransactions();
  }, [fetchDashboard, fetchTransactions]);

  const availableYears = useMemo(() => {
    const setYears = new Set();
    allTx.forEach((t) => setYears.add(new Date(t.date).getFullYear()));
    return Array.from(setYears).sort((a, b) => a - b);
  }, [allTx]);

  useEffect(() => {
    if (availableYears.length && selectedYear === null)
      setSelectedYear(availableYears[availableYears.length - 1]);
    else if (!availableYears.length && selectedYear === null)
      setSelectedYear(new Date().getFullYear());
  }, [availableYears, selectedYear]);

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const onRecordChange = (e) => {
    const { name, value } = e.target;
    setRecord((prev) => ({ ...prev, [name]: value }));
  };

  const submitRecord = async (e) => {
    e.preventDefault();
    if (!record.description || !record.category || !record.amount || !record.date) {
      toast.error("Please fill in Description, Category, Amount and Date.");
      return;
    }
    try {
      const [yyyy, mm, dd] = record.date.split("-");
      const now = new Date();
      const dateIso = new Date(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      ).toISOString();
      const payload = { ...record, amount: Number(record.amount), date: dateIso };
      if (!hasToken()) {
        toast.error("You must be logged in to record transactions.");
        return;
      }
      if (editTx) {
        await api.put(`/transactions/${editTx._id}`, payload);
        toast.success("Transaction updated");
        setEditTx(null);
      } else {
        await api.post("/transactions", payload);
        toast.success("Recorded successfully");
      }
      setRecord({
        type: "income",
        category: "",
        description: "",
        amount: "",
        date: getLocalDateString(),
        note: "",
      });
      setShowRecordModal(false);
      await fetchDashboard();
      await fetchTransactions();
    } catch (err) {
      console.error("submitRecord err", err);
      toast.error(err?.response?.data?.message || "Failed to save");
    }
  };

  const handleDeleteTx = async (id) => {
    if (!window.confirm("Delete transaction?")) return;
    try {
      if (!hasToken()) {
        toast.error("You must be logged in to delete transactions.");
        return;
      }
      await api.delete(`/transactions/${id}`);
      toast.success("Deleted");
      await fetchDashboard();
      await fetchTransactions();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const handleEditTx = (tx) => {
    setRecord({
      type: tx.type,
      category: tx.category,
      description: tx.description,
      amount: tx.amount,
      date: tx.date.split("T")[0],
      note: tx.note,
    });
    setEditTx(tx);
    setShowRecordModal(true);
  };

  // Highlight + search filtering logic
  const filteredBySearch = useMemo(() => {
    if (!searchTerm.trim()) return allTx;
    const lower = searchTerm.toLowerCase();
    return allTx.filter(
      (tx) =>
        tx.description?.toLowerCase().includes(lower) ||
        tx.category?.toLowerCase().includes(lower) ||
        tx.note?.toLowerCase().includes(lower)
    );
  }, [allTx, searchTerm]);

  const displayedTx = useMemo(() => {
    const base = showAllTx ? [...filteredBySearch] : [...recent];
    return recentSortOrder === "Newest to Oldest" ? base : [...base].reverse();
  }, [filteredBySearch, recent, showAllTx, recentSortOrder]);

  // Chart Data Logic
  const barData = useMemo(() => {
    if (!allTx.length) return [];
    const grouped = {};
    const txOfYear = allTx.filter(
      (t) => new Date(t.date).getFullYear() === Number(selectedYear)
    );
    if (filter === "Year") {
      MONTH_NAMES.forEach((m) => (grouped[m] = { name: m, income: 0, expense: 0 }));
      txOfYear.forEach((tx) => {
        const m = MONTH_NAMES[new Date(tx.date).getMonth()];
        grouped[m][tx.type] += tx.amount;
      });
      return MONTH_NAMES.map((m) => ({
        name: grouped[m].name,
        income: grouped[m].income,
        expense: grouped[m].expense,
      }));
    } else if (filter === "Quarter") {
      const q = selectedQuarter || 1;
      const months = getMonthsOfQuarter(q);
      months.forEach((m) => (grouped[m] = { name: m, income: 0, expense: 0 }));
      txOfYear.forEach((tx) => {
        const m = MONTH_NAMES[new Date(tx.date).getMonth()];
        if (months.includes(m)) grouped[m][tx.type] += tx.amount;
      });
      return months.map((m) => ({
        name: grouped[m].name,
        income: grouped[m].income,
        expense: grouped[m].expense,
      }));
    } else if (filter === "Month") {
      let mi = selectedMonthIndex;
      if (mi === null) {
        const monthsWithData = Array.from(
          new Set(txOfYear.map((t) => new Date(t.date).getMonth()))
        ).sort((a, b) => a - b);
        mi = monthsWithData.length
          ? monthsWithData[monthsWithData.length - 1]
          : new Date().getMonth();
      }
      const txOfMonth = txOfYear.filter(
        (tx) => new Date(tx.date).getMonth() === Number(mi)
      );
      txOfMonth.forEach((tx) => {
        const day = new Date(tx.date).getDate();
        const key = String(day).padStart(2, "0");
        if (!grouped[key])
          grouped[key] = { name: `${MONTH_NAMES[mi]} ${String(day)}`, income: 0, expense: 0 };
        grouped[key][tx.type] += tx.amount;
      });
      return Object.keys(grouped)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => ({
          name: grouped[k].name,
          income: grouped[k].income,
          expense: grouped[k].expense,
        }));
    }
    return [];
  }, [allTx, filter, selectedYear, selectedQuarter, selectedMonthIndex]);

  const barCount = barData.length || 1;
  const computedBarSize = barCount <= 3 ? 48 : barCount <= 6 ? 34 : 18;
  const chartHeight = filter === "Month" ? 340 : filter === "Quarter" ? 300 : 260;

  return (
    <div className="dashboard-page">
      <ToastContainer position="bottom-right" autoClose={2000} />
      <aside className="sidebar always-expanded">
        <div className="logo">
          <img src="/assets/logo.png" alt="Taxpal Logo" />
        </div>
        <nav>
          <Link to="/dashboard" className="sidebar-item">
            <FaHome /> <span className="label">Dashboard</span>
          </Link>
          <Link to="/transactions" className="sidebar-item">
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
            onClick={handleLogout}
          >
            <FaSignOutAlt /> <span className="label">Logout</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {/* --- Topbar --- */}
        <div className="topbar" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            className="search-wrapper"
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              flex: 1,
              maxWidth: "900px",
              minWidth: "260px",
              marginRight: "8px",
            }}
          >
            <FaSearch
              className="search-icon"
              style={{
                position: "absolute",
                left: "10px",
                fontSize: "16px",
                color: "#555",
              }}
            />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: 6,
                border: "1px solid #ccc",
                outline: "none",
                background: "#f8f8f8",
                transition: "all 0.2s",
                color: "#000",          // ← text color
                caretColor: "#000",
              }}
            />
            {searchTerm && (
              <div
                className="search-dropdown"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  borderRadius: 6,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  zIndex: 30,
                  maxHeight: 240,
                  overflowY: "auto",
                }}
              >
                {filteredBySearch.length ? (
                  filteredBySearch.slice(0, 5).map((tx) => (
                    <div
                      key={tx._id}
                      className="search-item"
                      onClick={() => {
                        setSearchTerm("");
                        // navigate with highlight info
                        navigate("/transactions", {
                          state: { highlightTxId: tx._id, openViewMore: true },
                        });
                      }}
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f2f2f2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ color: "#333", fontWeight: 500 }}>
                        {tx.description || "—"}
                      </span>
                      <small style={{ color: "#777" }}>{tx.category}</small>
                    </div>
                  ))
                ) : (
                  <div
                    className="search-item no-results"
                    style={{
                      padding: "10px 12px",
                      color: "#888",
                      textAlign: "center",
                    }}
                  >
                    No matching transactions
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className="topbar-right"
            style={{ display: "flex", alignItems: "center", gap: 16 }}
          >
            {/* Notifications */}
            <button
              className="notification-btn"
              onClick={() => navigate("/settings/")}
              title="View Notifications"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              🔔
            </button>

            {/* Welcome text */}
            <div
              className="welcome-user"
              style={{ whiteSpace: "nowrap", fontWeight: 500 }}
            >
              Welcome, {username || "User"}!
            </div>

            {/* Profile dropdown */}
            <div className="profile-dropdown" style={{ position: "relative" }}>
              <FaUserCircle
                size={26}
                onClick={() =>
                  setShowMenu(showMenu === "profile" ? null : "profile")
                }
                className="profile-icon"
                style={{ cursor: "pointer" }}
              />
              {showMenu === "profile" && (
                <div
                  className="profile-menu"
                  style={{
                    position: "absolute",
                    top: 36,
                    right: 0,
                    zIndex: 50,
                    background: "#fff",
                    borderRadius: 6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    minWidth: 160,
                    padding: 8,
                  }}
                >
                  <button
                    className="dropdown-item view-profile"
                    onClick={() => {
                      setShowMenu(null);
                      navigate("/settings/");
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 12px",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    View Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Dashboard Content --- */}
        {loading ? (
          <div className="loading">Loading home...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="cards-row widgets">
              <div className="card widget">
                <div
                  className="widget-top"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <FaCreditCard className="widget-icon" />
                  <FaEllipsisV className="widget-menu" />
                </div>
                <p>Estimated Tax Due</p>
                <h3>₹{(totals.income * 0.1).toFixed(2)}</h3>
              </div>

              <div className="card widget">
                <div
                  className="widget-top"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <FaDollarSign className="widget-icon" />
                  <FaEllipsisV className="widget-menu" />
                </div>
                <p>Monthly Income</p>
                <h3>₹{totals.income}</h3>
              </div>

              <div className="card widget">
                <div
                  className="widget-top"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <FaMoneyBillAlt className="widget-icon" />
                  <FaEllipsisV className="widget-menu" />
                </div>
                <p>Monthly Expenses</p>
                <h3>₹{totals.expense}</h3>
              </div>

              <div className="card widget">
                <div
                  className="widget-top"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <FaChartLine className="widget-icon" />
                  <FaEllipsisV className="widget-menu" />
                </div>
                <p>Savings</p>
                <h3>₹{totals.savings}</h3>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-row" style={{ gap: 24 }}>
              <div className="chart-card" style={{ flex: 0.9, minHeight: 220 }}>
                <h3>Expense Breakdown</h3>
                <div
                  style={{ display: "flex", gap: 24, alignItems: "center" }}
                >
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              CATEGORY_COLORS[entry.name] ||
                              COLORS[idx % COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {pieData.map((entry, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            background:
                              CATEGORY_COLORS[entry.name] ||
                              COLORS[idx % COLORS.length],
                          }}
                        />
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-card" style={{ flex: 1.6, minHeight: chartHeight }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3>Income vs Expenses</h3>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8 }}>
                      {["Year", "Quarter", "Month"].map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setFilter(f);
                            if (f === "Year") {
                              setSelectedQuarter(null);
                              setSelectedMonthIndex(null);
                            } else if (f === "Quarter") {
                              setSelectedQuarter(1);
                              setSelectedMonthIndex(null);
                            } else if (f === "Month") {
                              setSelectedMonthIndex(new Date().getMonth());
                              setSelectedQuarter(null);
                            }
                          }}
                          className={`filter-btn ${
                            filter === f ? "active" : ""
                          }`}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            background:
                              filter === f ? "#4CAF50" : "#fff",
                            color: filter === f ? "#fff" : "#333",
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <select
                      value={selectedYear ?? ""}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      style={{ padding: "6px 8px", borderRadius: 6 }}
                    >
                      {availableYears.length ? (
                        availableYears.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))
                      ) : (
                        <option value={new Date().getFullYear()}>
                          {new Date().getFullYear()}
                        </option>
                      )}
                    </select>
                    {filter === "Quarter" && (
                      <select
                        value={selectedQuarter ?? 1}
                        onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                        style={{ padding: "6px 8px", borderRadius: 6 }}
                      >
                        <option value={1}>Q1</option>
                        <option value={2}>Q2</option>
                        <option value={3}>Q3</option>
                        <option value={4}>Q4</option>
                      </select>
                    )}
                    {filter === "Month" && (
                      <select
                        value={selectedMonthIndex ?? new Date().getMonth()}
                        onChange={(e) =>
                          setSelectedMonthIndex(Number(e.target.value))
                        }
                        style={{ padding: "6px 8px", borderRadius: 6 }}
                      >
                        {MONTH_NAMES.map((m, idx) => (
                          <option key={m} value={idx}>
                            {m}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div style={{ height: 12 }} />
                <ResponsiveContainer width="100%" height={chartHeight - 20}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="income"
                      fill="#4CAF50"
                      name="Income"
                      barSize={computedBarSize}
                    />
                    <Bar
                      dataKey="expense"
                      fill="#F44336"
                      name="Expenses"
                      barSize={computedBarSize}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transactions */}
            <div className="transactions-section">
              <div className="transactions-card">
                <div
                  className="transactions-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <h3 style={{ margin: 0 }}>Recent Transactions</h3>
                  <div
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <select
                      value={recentSortOrder}
                      onChange={(e) => setRecentSortOrder(e.target.value)}
                      style={{ padding: "6px 8px", borderRadius: 6 }}
                    >
                      <option>Newest to Oldest</option>
                      <option>Oldest to Newest</option>
                    </select>
                    {allTx.length > 5 && (
                      <button
                        className="view-more-btn"
                        onClick={() => setShowAllTx((p) => !p)}
                      >
                        {showAllTx ? "Show Less" : "View More"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="transactions-table-wrapper">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount (₹)</th>
                        <th>Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedTx.map((tx) => (
                        <tr key={tx._id}>
                          <td>{new Date(tx.date).toLocaleString()}</td>
                          <td>{tx.description || tx.note || "—"}</td>
                          <td>{tx.category}</td>
                          <td>{tx.amount}</td>
                          <td
                            className={
                              tx.type === "income"
                                ? "type-income"
                                : "type-expense"
                            }
                          >
                            {tx.type.charAt(0).toUpperCase() +
                              tx.type.slice(1)}
                          </td>
                          <td>
  <div className="dropdown" style={{ position: "relative" }}>
    <FaEllipsisV
      style={{ cursor: "pointer", fontSize: 18 }}
      onClick={() =>
        setShowMenu(showMenu === tx._id ? null : tx._id)
      }
    />
    {showMenu === tx._id && (
      <div
        className="dropdown-menu"
        style={{
          position: "absolute",
          top: 24,
          right: 0,
          background: "#000",
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 50,
          minWidth: 120,
        }}
      >
        <button
          onClick={() => handleEditTx(tx)}
          className="dropdown-item edit"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            padding: "6px 12px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <FaEdit /> Edit
        </button>
        <button
          onClick={() => handleDeleteTx(tx._id)}
          className="dropdown-item delete"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            padding: "6px 12px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <FaTrash /> Delete
        </button>
      </div>
    )}
  </div>
</td>

                        </tr>
                      ))}
                      {displayedTx.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                            No transactions to show.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
              <h3>
                {record.type === "income"
                  ? editTx
                    ? "Edit Income"
                    : "Record Income"
                  : editTx
                  ? "Edit Expense"
                  : "Record Expense"}
              </h3>
              <button
                onClick={() => {
                  setShowRecordModal(false);
                  setEditTx(null);
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitRecord} className="modal-form">
              <div className="form-row equal-row">
                <label className="form-col">
                  Description
                  <input
                    name="description"
                    type="text"
                    value={record.description}
                    onChange={onRecordChange}
                    placeholder="Short description"
                    required
                  />
                </label>
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
                    <option value="Others">Others</option>
                  </select>
                </label>
              </div>
              <div className="form-row equal-row">
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
                <label className="form-col">
                  Date
                  <input
                    name="date"
                    type="date"
                    value={record.date}
                    onChange={onRecordChange}
                    required
                  />
                </label>
              </div>
              <label>
                Note (Optional)
                <textarea
                  name="note"
                  value={record.note}
                  onChange={onRecordChange}
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowRecordModal(false);
                    setEditTx(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editTx ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LogoutConfirm
        show={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

