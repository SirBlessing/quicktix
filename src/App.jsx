import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar              from './components/Navbar'
import LandingPage         from './pages/LandingPage'
import ExplorePage         from './pages/ExplorePage'
import LoginPage           from './pages/LoginPage'
import SignupPage          from './pages/SignupPage'
import Dashboard           from './pages/Dashboard'
import CreateEvent         from './pages/CreateEventPage'
import EditEventPage       from './pages/EditEventPage'
import EventPage           from './pages/EventPage'
import CheckoutPage        from './pages/CheckoutPage'
import PaymentVerifyPage   from './pages/PaymentVerifyPage'
import TicketConfirm       from './pages/TicketConfirmPage'
import CheckInPage         from './pages/CheckInPage'

// ── Protected route wrapper ───────────────────────────────
// IMPORTANT: while loading=true we show a spinner — never redirect.
// Without this, a page refresh kicks users to /login while
// AuthContext is still verifying their token in the background.
function Protected({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/explore"         element={<ExplorePage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/signup"          element={<SignupPage />} />
        <Route path="/event/:id"       element={<EventPage />} />
        <Route path="/checkout/:id"    element={<CheckoutPage />} />
        <Route path="/checkout/verify" element={<PaymentVerifyPage />} />
        <Route path="/ticket/:id"      element={<TicketConfirm />} />

        {/* Protected — must be logged in */}
        <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
        <Route path="/create-event" element={<Protected><CreateEvent /></Protected>} />
        <Route path="/edit-event/:id" element={<Protected><EditEventPage /></Protected>} />
        <Route path="/checkin"      element={<Protected><CheckInPage /></Protected>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}