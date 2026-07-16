import axios from 'axios'

const RENDER_URL = 'https://quicktix-282n.onrender.com'

const client = axios.create({
  baseURL: `${RENDER_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
})

client.interceptors.request.use(config => {
  const token = localStorage.getItem('qt_token')
  // Guard: don't send if token is missing, "undefined", or "null"
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

client.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
)

export default client