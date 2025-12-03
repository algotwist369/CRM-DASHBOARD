import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSearch,
  FaCalendarAlt,
  FaSpinner,
  FaArrowRight,
  FaInfoCircle
} from 'react-icons/fa'
import { usePageTitle } from '../../../hooks/usePageTitle'

const CheckAppointment = () => {
  const navigate = useNavigate()
  const [confirmationCode, setConfirmationCode] = useState('')
  const [loading, setLoading] = useState(false)

  usePageTitle('Check Appointment Status - Booking App')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const code = confirmationCode.trim().toUpperCase()
    
    if (!code) {
      toast.error('Please enter a confirmation code')
      return
    }

    if (code.length < 6) {
      toast.error('Confirmation code must be at least 6 characters')
      return
    }

    // Navigate to appointment status page
    navigate(`/appointment/${code}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <FaCalendarAlt className="text-primary-600 text-3xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Check Appointment Status
          </h1>
          <p className="text-lg text-gray-600">
            Enter your confirmation code to view your appointment details
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white  shadow-lg border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Confirmation Code Input */}
            <div>
              <label htmlFor="confirmationCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmation Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="confirmationCode"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                  placeholder="Enter your confirmation code (e.g., CONF123456)"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-mono uppercase"
                  maxLength={50}
                  autoFocus
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <FaInfoCircle className="text-primary-500" />
                <span>You received this code when you booked your appointment</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !confirmationCode.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white  font-semibold text-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Check Status</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Need Help?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>Check your email or SMS for the confirmation code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>The code is usually 6-20 characters long</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>If you can't find your code, please contact the business directly</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckAppointment

