import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: '/api', // Vite proxy will handle this to http://localhost:5000/api
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optional: Redirect to login or dispatch logout action
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
