import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  console.log('API Request - Token present:', !!token, 'Path:', config.url)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('Authorization header set:', config.headers.Authorization.substring(0, 20) + '...')
  } else {
    console.warn('No token found in localStorage for request to:', config.url)
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
