import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Card, Alert } from '../../../components'

const Unauthorized = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = () => {
    // Store the attempted URL to redirect after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname)
    navigate('/auth/login')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleContactSupport = () => {
    // In a real app, this would open a support ticket or contact form
    window.open('mailto:support@elitehair.com?subject=Access Denied - ' + location.pathname)
  }

  const getRequiredRole = () => {
    // In a real app, this would be determined by the route or context
    if (location.pathname.startsWith('/admin')) return 'Administrator'
    if (location.pathname.startsWith('/manager')) return 'Manager'
    if (location.pathname.startsWith('/staff')) return 'Staff'
    return 'Authenticated User'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="p-8 text-center">
            {/* Unauthorized Illustration */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Unauthorized Access</h2>
              <p className="text-lg text-gray-600 mb-6">
                You don't have permission to access this page. This area requires special authorization.
              </p>
            </div>

            {/* Access Information */}
            <div className="mb-8">
              <Alert
                type="warning"
                title="Access Required"
                message={`This page requires ${getRequiredRole()} privileges. Please contact your administrator if you believe you should have access.`}
              />
            </div>

            {/* Current Path Info */}
            <div className="mb-8 p-4 bg-gray-100 ">
              <p className="text-sm text-gray-600 mb-2">Attempted to access:</p>
              <code className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                {location.pathname}
              </code>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" onClick={handleLogin}>
                Login to Continue
              </Button>
              <Button variant="outline" onClick={handleGoHome}>
                Go to Homepage
              </Button>
              <Button variant="outline" onClick={handleContactSupport}>
                Contact Support
              </Button>
            </div>

            {/* Role Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Available Roles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-blue-50 ">
                  <h4 className="font-medium text-blue-900">Administrator</h4>
                  <p className="text-blue-700">Full system access and management</p>
                </div>
                <div className="p-3 bg-green-50 ">
                  <h4 className="font-medium text-green-900">Manager</h4>
                  <p className="text-green-700">Business and staff management</p>
                </div>
                <div className="p-3 bg-purple-50 ">
                  <h4 className="font-medium text-purple-900">Staff</h4>
                  <p className="text-purple-700">Appointment and customer management</p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-gray-50 ">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                If you believe you should have access to this page, please contact your administrator or support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                <span className="text-gray-600">Email: support@elitehair.com</span>
                <span className="text-gray-600">Phone: (555) 123-4567</span>
              </div>
            </div>

            {/* Public Access Options */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Public Access</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate('/booking/business-info')}
                  className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => navigate('/appointment-status')}
                  className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                >
                  Check Appointment
                </button>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Unauthorized
