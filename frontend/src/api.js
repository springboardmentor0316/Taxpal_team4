import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // adjust if needed
});

// ✅ Helper to set/remove token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token); // store in localStorage
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

export default api;
