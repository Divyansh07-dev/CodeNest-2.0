// utils/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '',  // relative → uses Vite proxy in dev
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Add interceptor to attach token from localStorage (if not using cookies)
axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
// import axios from 'axios';

// const axiosClient = axios.create({
//   baseURL: '',                     // ← must be empty string!
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// export default axiosClient;