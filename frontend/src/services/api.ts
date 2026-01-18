import axios from 'axios'
import { store } from '../store'

// We use relative path for API_URL in development to leverage Vite proxy if needed, 
// or the environment variable. 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token')
            // Warning: Direct dispatch might not work if cyclic dependency, but here store is imported.
            // Ideally we should handle this in a more robust way, but this follows user pattern.
            // We check if store has dispatch method available (it should).
            if (store && store.dispatch) {
                store.dispatch({ type: 'auth/logout' })
            }
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
