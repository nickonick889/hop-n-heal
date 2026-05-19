import axios from 'axios';

// Central axios instance used by every API helper in this folder.
// baseURL is empty so that Vite's dev proxy (/api → localhost:5000) is used.
// In production, set VITE_API_URL to your deployed server URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true, // sends the httpOnly JWT cookie automatically
});

export default api;
