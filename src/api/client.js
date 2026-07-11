import axios from 'axios'

// !! PASTE YOUR RENDER URL HERE — no trailing slash !!
const RENDER_URL = 'https://quicktix-282n.onrender.com'

const client = axios.create({
  baseURL: `${RENDER_URL}/api`
})

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('qt_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('qt_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client