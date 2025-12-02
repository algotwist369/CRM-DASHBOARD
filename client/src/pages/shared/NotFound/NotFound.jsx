import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Card } from '../../../components'

const NotFound = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleContactSupport = () => {
    // In a real app, this would open a support ticket or contact form
    window.open('mailto:support@elitehair.com?subject=Page Not Found - ' + location.pathname)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="p-8 text-center">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
              <p className="text-lg text-gray-600 mb-6">
                Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you might have entered the wrong URL.
              </p>
            </div>

            {/* Current Path Info */}
            <div className="mb-8 p-4 bg-gray-100 ">
              <p className="text-sm text-gray-600 mb-2">You were looking for:</p>
              <code className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                {location.pathname}
              </code>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" onClick={handleGoHome}>
                Go to Homepage
              </Button>
              <Button variant="outline" onClick={handleGoBack}>
                Go Back
              </Button>
              <Button variant="outline" onClick={handleContactSupport}>
                Contact Support
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Popular Pages</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate('/booking/business-info')}
                  className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                >
                  Register
                </button>
                <button
                  onClick={() => navigate('/appointment-status')}
                  className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                >
                  Check Appointment
                </button>
              </div>
            </div>

            {/* Search Suggestion */}
            <div className="mt-6 p-4 bg-blue-50 ">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Looking for something specific?</h4>
              <p className="text-sm text-blue-700">
                Try searching for what you need or browse our main sections above.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default NotFound
