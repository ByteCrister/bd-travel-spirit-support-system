// utils/axios.ts
import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_DOMAIN!}/api`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Optional: Add interceptors for auth tokens or logging
api.interceptors.request.use(
    (config) => {
        // Example: attach token if available
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors (401, 500, etc.)
        return Promise.reject(error);
    }
);

export default api;
