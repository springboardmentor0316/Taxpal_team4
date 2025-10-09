// src/pages/Reports.jsx
import React, { useEffect, useState, useRef } from "react";
import "./Reports.css";
import {
  FaHome,
  FaWallet,
  FaListAlt,
  FaCalculator,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaDownload,
  FaPrint,
  FaTrash,
  FaFileInvoice,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoutConfirm from "../components/LogoutConfirm";
import { io } from "socket.io-client";

export default function Reports() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "",
    period: "",
    format: "",
    from: "",
    to: "",
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const previewIframeRef = useRef(null);

  const BACKEND_BASE =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const socket = io(BACKEND_BASE);

    socket.on("reports:created", ({ report }) => {
      if (!report) return;
      const exists = recentReports.some(
        (r) => (r._id || r.id) === (report._id || report.id)
      );
      if (exists) return;
      toast.success("Report generated successfully");
      setRecentReports((prev) => [report, ...prev]);
    });

    socket.on("reports:deleted", ({ id }) => {
      setRecentReports((prev) =>
        prev.filter((r) => (r._id || r.id) !== id)
      );
      if (previewReport && (previewReport._id === id || previewReport.id === id)) {
        setPreviewReport(null);
      }
      toast.success("Report deleted successfully");
    });

    return () => socket.disconnect();
  }, [BACKEND_BASE, previewReport, recentReports]);

  useEffect(() => {
    fetchRecent();
  }, []);

  async function fetchRecent() {
    try {
      setLoading(true);
      const res = await api.get("/reports");
      let reports = res.data.reports || [];

      // Filter out deleted transaction reports (if any lingering)
      reports = reports.filter(
        (r) => !r.name?.toLowerCase().includes("deleted")
      );
      // Sort latest first
      reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentReports(reports);
    } catch (err) {
      console.error("fetchRecent error", err);
      toast.error("Failed to load recent reports");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function resetForm() {
    setForm({ type: "", period: "", format: "", from: "", to: "" });
    toast.success("Form reset successfully");
  }

  async function generate(e) {
    e.preventDefault();
    if (!form.type || !form.period || !form.format)
      return toast.error("Please select all fields");
    if (form.period === "custom" && (!form.from || !form.to))
      return toast.error("Please select a custom date range.");

    try {
      setLoading(true);
      const res = await api.post("/reports/generate", { ...form });
      const newReport = res.data.report;

      if (newReport) {
        const previewUrl = `${BACKEND_BASE}/api/reports/${
          newReport._id || newReport.id
        }/preview`;
        setPreviewReport({ ...newReport, previewUrl });
      }
    } catch (err) {
      console.error("generate error", err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  function preview(r) {
    if (!r) return;
    const id = r._id || r.id;
    const previewUrl = `${BACKEND_BASE}/api/reports/${id}/preview`;
    setPreviewReport({ ...r, previewUrl });
    toast.success("Report loaded in preview");
  }

  function downloadReport(r) {
    if (!r || !r.url)
      return toast.error("Report file is not available");
    window.open(r.url, "_blank");
    toast.success("Downloading report...");
  }

  function printReport(r) {
    if (!r) return toast.error("Report not available");
    if (r.format === "csv") {
      return toast.warning(
        "Printing is not available for CSV format. Please download and open it in Excel or another spreadsheet app."
      );
    }

    const id = r._id || r.id;
    const previewUrl = `${BACKEND_BASE}/api/reports/${id}/preview`;
    const iframe = previewIframeRef.current;

    if (iframe && iframe.src === previewUrl) {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch {
        const w = window.open(r.url, "_blank");
        if (w) w.print();
      }
      return;
    }

    setPreviewReport({ ...r, previewUrl });
    const onLoad = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch {
        const w = window.open(r.url, "_blank");
        if (w) w.print();
      } finally {
        iframe.removeEventListener("load", onLoad);
      }
    };
    if (iframe) iframe.addEventListener("load", onLoad);
  }

  async function deleteReport(r) {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await api.delete(`/reports/${r._id || r.id}`);
    } catch (err) {
      console.error("delete error", err);
      toast.error("Failed to delete report");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Pagination logic: show top 5 by default
  const displayedReports = showAllReports ? recentReports : recentReports.slice(0, 5);

  return (
    <div className="home-container">
      <ToastContainer position="top-right" autoClose={2000} limit={3} />

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
          <Link to="/reports" className="sidebar-item active">
            <FaFileAlt /> <span>Reports</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <Link to="/settings" className="sidebar-item">
            <FaCog /> <span>Settings</span>
          </Link>
          <div
            className="sidebar-item logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <FaSignOutAlt /> <span>Logout</span>
          </div>
        </div>
      </aside>

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

        <div className="reports-container">
          <h2 style={{ marginBottom: 0 }}>Financial Reports</h2>
          <p className="subtitle" style={{ marginTop: 0 }}>
            Generate and download your financial reports
          </p>

          {/* Generate Report */}
          <div className="card generate-card">
            <h3>Generate Report</h3>
            <form onSubmit={generate} className="generate-form">
              <div className="row">
                <select name="type" value={form.type} onChange={handleChange} required>
                  <option value="">Report Type</option>
                  <option value="transactions">Transactions</option>
                  <option value="budgets">Budgets</option>
                  <option value="tax">Tax Estimator</option>
                  <option value="income_statement">Income Statement</option>
                  <option value="balance_sheet">Balance Sheet</option>
                </select>

                <select name="period" value={form.period} onChange={handleChange} required>
                  <option value="">Period</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="this_quarter">This Quarter</option>
                  <option value="last_quarter">Last Quarter</option>
                  <option value="ytd">Year to Date</option>
                  <option value="custom">Custom Range</option>
                </select>

                <select name="format" value={form.format} onChange={handleChange} required>
                  <option value="">Format</option>
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              {form.period === "custom" && (
                <div className="row custom-range">
                  <input type="date" name="from" value={form.from} onChange={handleChange} />
                  <input type="date" name="to" value={form.to} onChange={handleChange} />
                </div>
              )}

              <div className="actions">
                <button type="button" className="btn-reset" onClick={resetForm}>Reset</button>
                <button className="btn-generate" type="submit" disabled={loading}>
                  {loading ? "Generating…" : "Generate Report"}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Reports */}
          <div className="card recent-card">
            <div className="recent-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3>Recent Reports</h3>
              {recentReports.length > 5 && (
                <button
                  className="btn-view-more"
                  onClick={() => setShowAllReports(!showAllReports)}
                >
                  {showAllReports ? "View Less" : "View More"}
                </button>
              )}
            </div>

            <table className="reports-table">
              <thead>
                <tr><th>Report Name</th><th>Generated</th><th>Period</th><th>Format</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {displayedReports.length === 0 ? (
                  <tr><td colSpan="5" className="empty">No Results</td></tr>
                ) : (
                  displayedReports.map((r) => (
                    <tr key={r._id || r.id}>
                      <td>{r.name || `${r.type} report`}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td>{r.period || "—"}</td>
                      <td>{r.format?.toUpperCase()}</td>
                      <td className="actions-cell">
                        <button onClick={() => preview(r)}>Preview</button>
                        <button className="btn-download" onClick={() => downloadReport(r)}><FaDownload /></button>
                        <button onClick={() => deleteReport(r)}><FaTrash /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Preview */}
          <div className="card preview-card">
            <div className="preview-header">
              <h3>Report Preview</h3>
              <div className="preview-actions">
                <button
                  onClick={() => previewReport && printReport(previewReport)}
                  disabled={!previewReport}
                >
                  <FaPrint /> Print
                </button>
                <button
                  className="btn-download"
                  onClick={() => previewReport && downloadReport(previewReport)}
                  disabled={!previewReport}
                >
                  <FaDownload /> Download
                </button>
              </div>
            </div>

            <div className="preview-body">
              {!previewReport ? (
                <div className="preview-empty">
                  <FaFileInvoice className="icon" />
                  <p>Select a report to preview</p>
                  <p className="tagline">
                    Generated reports will appear here for review before downloading
                  </p>
                </div>
              ) : (
                <iframe
                  ref={previewIframeRef}
                  title="report-preview"
                  src={previewReport.previewUrl}
                  className="preview-iframe"
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <LogoutConfirm
        show={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
