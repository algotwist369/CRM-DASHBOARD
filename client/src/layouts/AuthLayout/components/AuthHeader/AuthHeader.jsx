import React from 'react'
import { Link } from 'react-router-dom'

const AuthHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10  bg-gray-800 flex items-center justify-center ">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
                SpaAdvisor
              </h1>
              <p className="text-xs text-gray-500">Premium Hair Services</p>
            </div>
          </Link>

          {/* Back to Home */}
          <Link
            to="/"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </header>
  )
}

export default AuthHeader
