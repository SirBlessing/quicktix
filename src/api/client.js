import axios from 'axios'

const RENDER_URL = 'https://quicktix-282n.onrender.com'

const client = axios.create({
  baseURL: `${RENDER_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
})

// On page load — restore token from localStorage into axios default headers
// This runs once when the module is imported, covering page refreshes
const savedToken = localStorage.getItem('qt_token')
if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
  client.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
}

// Call this after login/signup to update the header immediately
export const setAuthToken = (token) => {
  if (token && token !== 'undefined' && token !== 'null') {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete client.defaults.headers.common['Authorization']
  }
}

export default client