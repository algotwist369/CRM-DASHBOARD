import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaBell, FaSearch } from 'react-icons/fa'
import { Button } from '../../../../components'

const PublicHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationCount] = useState(0) // TODO: Implement notification fetching logic

  const navigationItems = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'For Businesses', href: '/for-businesses' },
  ]

  const handleFreeListing = () => {
    navigate('/free-listing')
  }

  const handleLogin = () => {
    navigate('/auth/login')
  }

  const handleNotifications = () => {
    navigate('/notifications')
  }

  const handleCheckAppointment = () => {
    navigate('/check-appointment')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="hidden min-[375px]:block">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-tight">Booking App</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-tight hidden sm:block">Business Management System</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative text-sm xl:text-base font-medium transition-colors whitespace-nowrap pb-1 ${
                    isActive
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-700 hover:text-primary-600 hover:border-b-2 hover:border-primary-300'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            <button
              onClick={handleCheckAppointment}
              className="flex items-center gap-1.5 text-sm xl:text-base text-gray-700 hover:text-primary-600 font-medium transition-colors whitespace-nowrap px-2 py-1 rounded-md hover:bg-gray-50"
              title="Check Appointment Status"
            >
              <span>Check Status</span>
            </button>
            <Link
              to="/advertise"
              className={`relative text-sm xl:text-base font-medium transition-colors whitespace-nowrap pb-1 ${
                location.pathname === '/advertise'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-700 hover:text-primary-600 hover:border-b-2 hover:border-primary-300'
              }`}
            >
              Advertise
            </Link>
            <Link
              to="/careers"
              className={`relative text-sm xl:text-base font-medium transition-colors whitespace-nowrap pb-1 ${
                location.pathname === '/careers'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-700 hover:text-primary-600 hover:border-b-2 hover:border-primary-300'
              }`}
            >
              We are hiring
            </Link>
            <button
              onClick={handleNotifications}
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Notifications"
            >
              <FaBell className="w-4 h-4 sm:w-5 sm:h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            <Button variant="outline" onClick={handleLogin} className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              Login
            </Button>
            <Button variant="primary" onClick={handleFreeListing} className="relative overflow-visible text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              <span className="hidden xl:inline">Free Listing</span>
              <span className="xl:hidden">Free</span>
              <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap shadow-xl border-2 border-white z-10 transform rotate-12 hover:scale-110 transition-transform">
                <span className="relative z-10">FREE</span>
                <span className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50 animate-pulse"></span>
              </span>
            </Button>
          </div>

          {/* Tablet Actions (hidden on mobile and desktop) */}
          <div className="hidden md:flex lg:hidden items-center space-x-2">
            <button
              onClick={handleNotifications}
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Notifications"
            >
              <FaBell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            <Button variant="outline" onClick={handleLogin} className="text-sm px-3 py-1.5">
              Login
            </Button>
            <Button variant="primary" onClick={handleFreeListing} className="relative overflow-visible text-sm px-3 py-1.5">
              Free
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap shadow-xl border-2 border-white z-10 transform rotate-12">
                <span className="relative z-10">FREE</span>
                <span className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50 animate-pulse"></span>
              </span>
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleNotifications}
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Notifications"
            >
              <FaBell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            <Button
              variant="primary"
              onClick={handleFreeListing}
              className="relative overflow-visible text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 sm:py-2 h-8 sm:h-9 shadow-md hover:shadow-lg transition-shadow"
            >
              <span className="relative z-0">Free</span>
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg border-2 border-white z-10 transform rotate-12">
                <span className="relative z-10">FREE</span>
                <span className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50 animate-pulse"></span>
              </span>
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 sm:py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="flex flex-col space-y-1 sm:space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm sm:text-base font-medium transition-colors px-4 py-2.5 sm:py-3 rounded-md ${
                      isActive
                        ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <div className="px-4 pt-2 space-y-1 sm:space-y-2 border-t border-gray-200 mt-2">
                <button
                  onClick={() => {
                    handleCheckAppointment()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left flex items-center gap-2 text-sm sm:text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 font-medium transition-colors px-4 py-2.5 sm:py-3 rounded-md"
                >
                  <FaSearch className="w-4 h-4" />
                  <span>Check Appointment Status</span>
                </button>
                <Link
                  to="/advertise"
                  className="block text-sm sm:text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 font-medium transition-colors px-4 py-2.5 sm:py-3 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Advertise
                </Link>
                <Link
                  to="/careers"
                  className="block text-sm sm:text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 font-medium transition-colors px-4 py-2.5 sm:py-3 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  We are hiring
                </Link>
              </div>
              <div className="px-4 pt-3 sm:pt-4 border-t border-gray-200 space-y-2 sm:space-y-3">
                <Button variant="outline" className="w-full text-sm sm:text-base py-2.5 sm:py-3" onClick={handleLogin}>
                  Login
                </Button>
                <Button variant="primary" className="w-full relative overflow-visible text-sm sm:text-base py-2.5 sm:py-3" onClick={handleFreeListing}>
                  Free Listing
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap shadow-xl border-2 border-white z-10 transform rotate-12">
                    <span className="relative z-10">FREE</span>
                    <span className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50 animate-pulse"></span>
                  </span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default PublicHeader
