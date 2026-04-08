
import axios from "axios";

const BASE_URL = "https://nxv0f4xk-8080.inc1.devtunnels.ms/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[Axios] Token attached:", token.substring(0, 20) + "...");
    } else {
      console.warn("[Axios] No token found in localStorage");
    }
    console.log("[Axios] Request to:", config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler
api.interceptors.response.use(
  (response) => {
    console.log("[Axios] Response OK:", response.status);
    return response;
  },
  (error) => {
    console.error("[Axios] Error:", error.response?.status, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
