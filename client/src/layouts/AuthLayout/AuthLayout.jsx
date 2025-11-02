import React from 'react'
import { Outlet } from 'react-router-dom'
import { AuthHeader } from './components'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <AuthHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 RAMA CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AuthLayout