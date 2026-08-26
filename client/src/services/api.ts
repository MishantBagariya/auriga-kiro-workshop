import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const message =
        error.response.data?.error?.message || "An error occurred";
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      return Promise.reject(
        new Error("Network error. Please check your connection."),
      );
    }
    return Promise.reject(error);
  },
);
