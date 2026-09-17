import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { artistAuth } from '../services/api'
import { useArtist } from '../context/ArtistContext'
import axios from 'axios'

const ArtistLogin = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useArtist()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ssoChecking, setSsoChecking] = useState(true)
  const [ssoError, setSsoError] = useState('')
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('')

  useEffect(() => {
    // If already authenticated as artist, redirect to dashboard
    if (isAuthenticated) {
      navigate('/artist/dashboard')
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('order_id')

    const verifyAndCheckSSO = async () => {
      if (orderId) {
        try {
          setVerifyingPayment(true)
          setPaymentStatus('Verifying your membership payment...')
          const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sverxiioo.nanoprofiles.com/api'
          const verifyRes = await axios.post(`${API_BASE_URL}/payments/verify-membership`, { orderId })
          
          if (verifyRes.data && verifyRes.data.success) {
            setPaymentStatus('Payment verified successfully! Welcome onboard.')
            setTimeout(() => {
              navigate('/artist/login', { replace: true })
              setVerifyingPayment(false)
            }, 2000)
            return
          } else {
            setError(verifyRes.data?.message || 'Payment verification failed.')
            setVerifyingPayment(false)
          }
        } catch (err) {
          console.error('Verify payment error:', err)
          setError(err.response?.data?.error || 'Payment verification failed.')
          setVerifyingPayment(false)
        }
      }

      const userToken = localStorage.getItem('authToken')
      if (userToken) {
        try {
          setLoading(true)
          const response = await artistAuth.ssoLogin(userToken)
          if (response.success) {
            login(response.token, response.artist)
            navigate('/artist/dashboard')
            return
          }
        } catch (err) {
          console.log('SSO Auto-login bypassed:', err.response?.data?.message || err.message)
          setSsoError(err.response?.data?.message || err.message)
        } finally {
          setLoading(false)
        }
      }
      setSsoChecking(false)
    }

    verifyAndCheckSSO()
  }, [isAuthenticated, login, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await artistAuth.requestOTP(email)
      if (response.success) {
        // Store email for OTP verification page
        localStorage.setItem('pendingArtistEmail', email)
        navigate('/artist/verify-otp')
      } else {
        setError(response.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Artist not found or error sending OTP')
    } finally {
      setLoading(false)
    }
  }

  if (verifyingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-900 font-bold mb-2">{paymentStatus}</p>
          <p className="text-gray-500 text-sm">Please do not refresh or close this page.</p>
        </div>
      </div>
    )
  }

  if (ssoChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Checking active session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Artist Dashboard</h1>
          <p className="text-gray-600">Enter your registered artist email to continue</p>
        </div>

        {ssoError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed text-left flex items-start gap-2.5 shadow-sm">
            <span className="text-sm">💡</span>
            <span>
              <strong>SSO Status:</strong> {ssoError}
              {ssoError.toLowerCase().includes('network error') ? ' (Please make sure the backend server is running on port 5000)' : ' (Try logging in manually below)'}.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continue <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Only registered artists can access this dashboard
        </p>
      </div>
    </div>
  )
}

export default ArtistLogin
