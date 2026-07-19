import axios from 'axios'

const client = axios.create({
  baseURL: 'https://quicktix-282n.onrender.com/api'
})

// Reads token fresh from localStorage on EVERY request
// This is the most reliable approach — no stale state possible
client.interceptors.request.use(config => {
  const token = localStorage.getItem('qt_token')
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

export default client