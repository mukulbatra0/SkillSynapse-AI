import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register({ username, email, password }) {
  const response = await api.post("/api/auth/register", {
    username,
    email,
    password,
  });
  
  // Store token in localStorage
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });

  // Store token in localStorage
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }

  return response.data;
}

export async function logout() {
  const response = await api.get("/api/auth/logout");
  
  // Remove token from localStorage
  localStorage.removeItem('token');
  
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/get-me");
  return response.data;
}
