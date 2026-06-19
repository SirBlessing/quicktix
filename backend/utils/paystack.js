const axios = require('axios')
const api = axios.create({ baseURL: 'https://api.paystack.co', headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } })

const initPayment = async ({ email, amount, reference, metadata, callback_url }) => {
  const r = await api.post('/transaction/initialize', { email, amount, reference, metadata, callback_url, currency: 'NGN', channels: ['card','bank','ussd','bank_transfer'] })
  if (!r.data.status) throw new Error(r.data.message)
  return r.data.data
}

const verifyPayment = async (reference) => {
  const r = await api.get('/transaction/verify/' + encodeURIComponent(reference))
  if (!r.data.status) throw new Error(r.data.message)
  return r.data.data
}

const getBanks = async () => {
  const r = await api.get('/bank?country=nigeria&perPage=100')
  return r.data.data
}

const verifyAccount = async (accountNumber, bankCode) => {
  const r = await api.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`)
  return r.data.data
}

module.exports = { initPayment, verifyPayment, getBanks, verifyAccount }
