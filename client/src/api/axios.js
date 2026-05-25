import axios from "axios";

// Do not force a global Content-Type header here — leave content-type to be set
// per-request so multipart/form-data uploads work correctly (browser sets the
// required boundary). Authorization header will be set in the request interceptor.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("tripgenie_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
