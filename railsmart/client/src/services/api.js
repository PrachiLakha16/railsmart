import axios from 'axios'

// Use environment variable — falls back to localhost in development
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data)
}

export const trainAPI = {
  search: (from, to, cls) =>
    api.get(`/trains/search?from=${from}&to=${to}&class=${cls}`),
  getById: (id) => api.get(`/trains/${id}`)
}

export const alternateAPI = {
  find: (source, destination, sortBy) =>
    api.get(`/alternate?source=${source}&destination=${destination}&sortBy=${sortBy}`)
}

export const passengerAPI = {
  getAll: () => api.get('/passengers'),
  add: (data) => api.post('/passengers', data),
  update: (id, data) => api.put(`/passengers/${id}`, data),
  delete: (id) => api.delete(`/passengers/${id}`)
}

export const bookingAPI = {
  getAutofill: () => api.get('/booking/autofill')
}

export const wlAlertAPI = {
  getAll: () => api.get('/wl-alerts'),
  create: (data) => api.post('/wl-alerts', data),
  cancel: (id) => api.delete(`/wl-alerts/${id}`)
}

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  clearAll: () => api.delete('/notifications/clear-all')
}

export default api