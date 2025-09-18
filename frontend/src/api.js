// src/api.js
import axios from "axios";

// ✅ Base URL — use env var if set, otherwise localhost
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL + "/api", // now it works for /api/users, /api/budgets, /api/transactions, etc.
  headers: { "Content-Type": "application/json" },
});

// ✅ Automatically attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
