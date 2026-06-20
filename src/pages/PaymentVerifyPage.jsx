import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import client from '../api/client'

// Paystack redirects the user back to /checkout/verify?reference=xxx
// after a paid ticket purchase. This page verifies the payment and
// then forwards to the ticket confirmation page.

export default function PaymentVerifyPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const reference = params.get('reference')

  const [status, setStatus] = useState('verifying') // verifying | success | failed

  useEffect(() => {
    if (!reference) {
      navigate('/', { replace: true })
      return
    }

    client.get(`/payments/verify/${reference}`)
      .then(r => {
        setStatus('success')
        const ticketId = r.data.ticket?.ticketId
        setTimeout(() => {
          if (ticketId) {
            navigate(`/ticket/${ticketId}`, { replace: true })
          } else {
            navigate('/explore', { replace: true })
          }
        }, 1500)
      })
      .catch(err => {
        console.error('Payment verification error:', err.response?.data)
        setStatus('failed')
      })
  }, [reference, navigate])

  return (
    <div className="page fade-up">
      <div className="container">
        {status === 'verifying' && (
          <div className="state-box" style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
            <div className="checkout-spinner" style={{ margin: '0 auto 24px' }} />
            <h2 className="state-title">Verifying your payment...</h2>
            <p className="state-sub">Please wait. This takes a few seconds.</p>
            <p className="state-sub" style={{ marginTop: 8, fontSize: 13 }}>
              Reference: <code style={{ background: 'var(--g50)', padding: '2px 8px', borderRadius: 4 }}>{reference}</code>
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="state-box success" style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
            <span className="state-icon">🎉</span>
            <h2 className="state-title ok">Payment Confirmed!</h2>
            <p className="state-sub">Getting your ticket ready...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="state-box" style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', border: '2px solid #FECACA', background: '#FEF2F2' }}>
            <span className="state-icon">❌</span>
            <h2 className="state-title" style={{ color: '#E53E3E' }}>Payment Not Confirmed</h2>
            <p className="state-sub" style={{ marginBottom: 24 }}>
              We could not verify your payment. If money was deducted from your account, it will be refunded automatically within 5–7 business days. Please contact support with your reference number.
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 14, color: '#E53E3E', marginBottom: 24 }}>
              Ref: {reference}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/explore')}>
              Browse Events
            </button>
          </div>
        )}
      </div>
    </div>
  )
}