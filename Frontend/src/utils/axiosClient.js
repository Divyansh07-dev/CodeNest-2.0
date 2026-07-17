import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
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