import axios from 'axios'

const RENDER_URL = 'https://quicktix-282n.onrender.com'

const client = axios.create({
  baseURL: `${RENDER_URL}/api`
})

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('qt_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ── DO NOT redirect here on 401 ───────────────────────────
// The old version did window.location.href = '/login' here.
// That caused a hard page refresh 3 seconds after login because
// AuthContext's /auth/me call returned 401 while Render was
// waking up from sleep — and the interceptor fired before
// AuthContext could handle it.
// AuthContext now handles 401 itself in its catch block.
client.interceptors.response.use(
  res => res,
  err => Promise.reject(err)
)

export default client