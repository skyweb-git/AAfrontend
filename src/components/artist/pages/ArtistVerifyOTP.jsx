import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { artistAuth } from '../services/api'
import { useArtist } from '../context/ArtistContext'

const ArtistVerifyOTP = () => {
  const navigate = useNavigate()
  const { login } = useArtist()
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingArtistEmail')
    if (!pendingEmail) {
      navigate('/artist/login')
      return
    }
    setEmail(pendingEmail)
  }, [navigate])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await artistAuth.verifyOTP(email, otp)
      if (response.success) {
        login(response.token, response.artist)
        localStorage.removeItem('pendingArtistEmail')
        navigate('/artist/dashboard')
      } else {
        setError(response.message || 'Invalid OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      await artistAuth.requestOTP(email)
      setResendTimer(60)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    localStorage.removeItem('pendingArtistEmail')
    navigate('/artist/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to<br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              required
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Verify & Continue
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-500">
              Resend OTP in <span className="font-medium">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArtistVerifyOTP
