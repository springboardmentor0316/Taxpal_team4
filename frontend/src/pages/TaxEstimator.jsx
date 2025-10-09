// src/pages/TaxEstimator.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./TaxEstimator.css";
import {
  FaHome,
  FaWallet,
  FaListAlt,
  FaCalculator,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaRegFileAlt,
} from "react-icons/fa";
import axios from "axios";
import LogoutConfirm from "../components/LogoutConfirm";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TaxEstimator() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const [form, setForm] = useState({
    country: "",
    state: "",
    filingStatus: "",
    quarter: "",
    income: "",
    expenses: "",
    retirement: "",
    insurance: "",
    homeOffice: "",
  });

  const [calculatedTax, setCalculatedTax] = useState(null);
  const [countries, setCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [taxHistory, setTaxHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchCSV = async (path, setter) => {
      try {
        const res = await fetch(path);
        const text = await res.text();
        const rows = text.split("\n").slice(1);
        const data = rows
          .map((row) => row.trim())
          .filter((row) => row)
          .map((row) => row.split(","));
        setter(data);
      } catch (err) {
        console.error(`❌ Failed to load ${path}:`, err);
      }
    };

    fetchCSV("/data/countries.csv", (data) =>
      setCountries(data.map(([code, name]) => ({ code, name })))
    );

    fetchCSV("/data/states.csv", (data) =>
      setAllStates(
        data.map(([country_code, state_code, state_name]) => ({
          country_code,
          state_code,
          state_name,
        }))
      )
    );
  }, []);

  const fetchCalendar = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tax/calendar");
      const sorted = res.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setCalendarEvents(sorted);
    } catch (err) {
      console.error("❌ Error fetching calendar:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tax/history");
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTaxHistory(sorted);
    } catch (err) {
      console.error("❌ Error fetching tax history:", err);
    }
  };

  useEffect(() => {
    fetchCalendar();
    fetchHistory();
  }, []);

  const groupByMonth = (events, dateField = "date", desc = false) => {
    const groups = {};
    events.forEach((ev) => {
      const date = new Date(ev[dateField]);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(ev);
    });

    // Sort month keys descending if desc=true, else ascending
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return desc ? dateB - dateA : dateA - dateB;
    });

    return sortedKeys.map((key) => ({
      month: key,
      events: groups[key].sort((a, b) =>
        desc
          ? new Date(b[dateField]) - new Date(a[dateField])
          : new Date(a[dateField]) - new Date(b[dateField])
      ),
    }));
  };

  const groupedCalendar = groupByMonth(calendarEvents);
  const groupedHistory = groupByMonth(taxHistory, "createdAt", true); // ✅ Descending

  useEffect(() => {
    if (form.country) {
      setFilteredStates(
        allStates.filter((s) => s.country_code === form.country)
      );
    } else {
      setFilteredStates([]);
    }
  }, [form.country, allStates]);

  const handleLogoutClick = () => setShowLogout(true);
  const handleCancelLogout = () => setShowLogout(false);
  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    setShowLogout(false);
    navigate("/");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const income = parseFloat(form.income) || 0;
    const expenses = parseFloat(form.expenses) || 0;
    const retirement = parseFloat(form.retirement) || 0;
    const insurance = parseFloat(form.insurance) || 0;
    const homeOffice = parseFloat(form.homeOffice) || 0;

    const deductions = expenses + retirement + insurance + homeOffice;
    const taxableIncome = Math.max(income - deductions, 0);

    let taxRate = form.filingStatus === "married" ? 0.08 : 0.1;
    const estimatedTax = taxableIncome * taxRate;

    setCalculatedTax({
      quarter: form.quarter,
      deductions,
      taxableIncome,
      estimatedTax,
    });

    try {
      await axios.post("http://localhost:5000/api/tax/calculate", {
        country: form.country,
        state: form.state,
        filingStatus: form.filingStatus,
        quarter: form.quarter,
        income,
        expenses,
        retirement,
        insurance,
        homeOffice,
        estimatedTax,
      });

      toast.success("✅ Tax estimation calculated & saved!");
      await fetchCalendar();
      await fetchHistory();
    } catch (err) {
      console.error("❌ Error saving tax record:", err);
      toast.error("❌ Failed to save tax calculation");
    }
  };

  return (
    <div className="tax-page">
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
          <Link to="/tax" className="sidebar-item active">
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
          <div className="sidebar-item logout" onClick={handleLogoutClick}>
            <FaSignOutAlt /> <span>Logout</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <input type="text" placeholder="Search..." />
          <div className="topbar-right">
            <button>7Days</button>
            <button>☀️/🌙</button>
            <button>🔔</button>
            <div className="profile">👤</div>
          </div>
        </div>

        <h2 className="page-title">Tax Estimator</h2>
        <p className="subtitle">Calculate your estimated tax obligations</p>

        {/* Tax Form + Summary */}
        <div className="tax-estimator-grid">
          <form className="tax-form" onSubmit={handleSubmit}>
            <h3>Quarterly Tax Calculator</h3>
            <div className="form-row">
              <select name="country" value={form.country} onChange={handleChange}>
                <option value="">Country/Region</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select name="state" value={form.state} onChange={handleChange}>
                <option value="">State/Province</option>
                {filteredStates.map((s) => (
                  <option key={s.state_code} value={s.state_code}>
                    {s.state_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <select
                name="filingStatus"
                value={form.filingStatus}
                onChange={handleChange}
              >
                <option value="">Filing Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>

              <select name="quarter" value={form.quarter} onChange={handleChange}>
                <option value="">Quarter</option>
                <option value="Q1">Q1 (Jan - Mar)</option>
                <option value="Q2">Q2 (Apr - Jun)</option>
                <option value="Q3">Q3 (Jul - Sep)</option>
                <option value="Q4">Q4 (Oct - Dec)</option>
              </select>
            </div>

            <input
              type="number"
              name="income"
              placeholder="Gross Income For Quarter"
              value={form.income}
              onChange={handleChange}
            />

            <h4>Deductions</h4>
            <div className="form-row">
              <input
                type="number"
                name="expenses"
                placeholder="Business Expenses"
                value={form.expenses}
                onChange={handleChange}
              />
              <input
                type="number"
                name="retirement"
                placeholder="Retirement Contributions"
                value={form.retirement}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <input
                type="number"
                name="insurance"
                placeholder="Health Insurance Premiums"
                value={form.insurance}
                onChange={handleChange}
              />
              <input
                type="number"
                name="homeOffice"
                placeholder="Home Office Deduction"
                value={form.homeOffice}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-calc">
              Calculate Estimated Tax
            </button>
          </form>

          <div className="tax-summary glass-card">
            <h4>Tax Summary</h4>
            <div className="summary-icon">
              <FaRegFileAlt size={30} />
            </div>
            {calculatedTax ? (
              <div className="summary-results">
                <p>
                  <strong>Quarter:</strong> {calculatedTax.quarter}
                </p>
                <p>
                  <strong>Total Deductions:</strong> ₹{calculatedTax.deductions}
                </p>
                <p>
                  <strong>Taxable Income:</strong> ₹{calculatedTax.taxableIncome}
                </p>
                <p>
                  <strong>Estimated Tax:</strong>{" "}
                  <span className="highlight">₹{calculatedTax.estimatedTax}</span>
                </p>
              </div>
            ) : (
              <p>
                Enter your income and deduction details to calculate your estimated
                quarterly tax.
              </p>
            )}
          </div>
        </div>

        {/* ✅ Tax Calendar */}
        <div className="tax-calendar">
          <h3>Tax Calendar</h3>
          {groupedCalendar.length === 0 ? (
            <p>No upcoming tax events.</p>
          ) : (
            groupedCalendar.map(({ month, events }) => (
              <div key={month} className="calendar-month">
                <h4>{month}</h4>
                {events.map((ev, idx) => (
                  <div key={idx} className="calendar-card">
                    <div className="calendar-title">
                      <strong>{ev.title}</strong>
                      <span
                        className={`badge ${
                          ev.type === "reminder" ? "reminder" : "payment"
                        }`}
                      >
                        {ev.type}
                      </span>
                    </div>
                    <p>{new Date(ev.date).toDateString()}</p>
                    <p className="desc">{ev.description}</p>
                    {ev.type === "payment" && ev.amount !== undefined && (
                      <p>
                        <strong>Amount:</strong> ₹{ev.amount}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* ✅ Line space between calendar & history */}
        <div style={{ marginTop: "25px" }}></div>

        {/* ✅ Tax History */}
        <div className="tax-calendar">
          <h3>Tax History</h3>
          <div style={{ textAlign: "center", marginBottom: "12px" }}>
            <button
              className="btn-calc"
              style={{
                width: "130px",
                padding: "6px 8px",
                fontSize: "13px",
                background: "linear-gradient(90deg, #6366f1, #a855f7)",
              }}
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide History" : "See Tax History"}
            </button>
          </div>

          {showHistory &&
            groupedHistory.map(({ month, events }) => (
              <div key={month} className="calendar-month">
                <h4>{month}</h4>
                <div className="calendar-card">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Quarter</th>
                        <th>Income (₹)</th>
                        <th>Deductions (₹)</th>
                        <th>Estimated Tax (₹)</th>
                        <th>Date Calculated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((record) => (
                        <tr key={record._id}>
                          <td>{record.quarter}</td>
                          <td>{record.income}</td>
                          <td>
                            {record.expenses +
                              record.retirement +
                              record.insurance +
                              record.homeOffice}
                          </td>
                          <td>{record.estimatedTax}</td>
                          <td>{new Date(record.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

          {showHistory && groupedHistory.length === 0 && (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>
              No previous tax calculations.
            </p>
          )}
        </div>
      </main>

      <LogoutConfirm
        show={showLogout}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
