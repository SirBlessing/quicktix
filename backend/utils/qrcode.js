const QRCode = require('qrcode')
const generateQR = async (data) => QRCode.toDataURL(data, { errorCorrectionLevel: 'H', width: 300, margin: 2, color: { dark: '#0D0B1A', light: '#FFFFFF' } })
module.exports = { generateQR }
