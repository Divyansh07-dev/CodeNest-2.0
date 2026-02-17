import axios from 'axios';

const BASE_URL = 'https://codenest-2-0.onrender.com' || 'http://localhost:3000';
console.log(BASE_URL)

const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosClient;