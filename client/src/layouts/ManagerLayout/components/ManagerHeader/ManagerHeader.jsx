import React, { useState, useCallback, memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../../../components'
import { HiMenu, HiX } from 'react-icons/hi'
import authService from '../../../../services/auth/authService'
import ManagerNotificationBell from '../../../../components/notifications/ManagerNotificationBell'


const ManagerHeader = ({ onSidebarToggle, isSidebarCollapsed }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      navigate('/auth/manager-login')
    }
  }, [navigate])

  const closeDropdowns = useCallback(() => {
    setUserMenuOpen(false)
  }, [])

  // Get user info
  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  })()

  // Function to generate breadcrumb items from current route
  const getBreadcrumbs = () => {
    const pathname = location.pathname
    const pathSegments = pathname.split('/').filter(Boolean)

    // Route name mappings
    const routeNames = {
      'manager': 'Manager',
      'dashboard': 'Dashboard',
      'appointments': 'Appointments',
      'staff': 'Staff',
      'customers': 'Customers',
      'notifications': 'Notifications',
      'profile': 'Profile',
      'settings': 'Settings',
      'analytics': 'Analytics',
      'edit': 'Edit',
      'add': 'Add',
    }

    const breadcrumbs = []

    // Always start with Manager
    if (pathSegments.length > 0 && pathSegments[0] === 'manager') {
      breadcrumbs.push({ name: 'Manager', path: '/manager' })

      // Build breadcrumb for remaining segments
      let currentPath = '/manager'
      for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i]
        const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) || /^\d+$/.test(segment)

        if (isId) {
          // This is an ID segment - always update path
          currentPath += `/${segment}`

          // Check if there's a next segment (like "edit", "analytics", etc.)
          const nextSegment = pathSegments[i + 1]
          if (nextSegment && !(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nextSegment) || /^\d+$/.test(nextSegment))) {
            // There's a next segment that's not an ID, skip adding "Details" breadcrumb
          } else {
            // This is the last segment or followed by another ID, add "Details"
            const prevSegment = pathSegments[i - 1]
            const prevName = routeNames[prevSegment] || prevSegment.charAt(0).toUpperCase() + prevSegment.slice(1)
            breadcrumbs.push({
              name: `${prevName} Details`,
              path: currentPath
            })
          }
        } else {
          // Regular segment
          currentPath += `/${segment}`
          const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
          breadcrumbs.push({ name, path: currentPath })
        }
      }

      // If on dashboard or just /manager, ensure Dashboard is shown
      if (breadcrumbs.length === 1) {
        if (pathname === '/manager/dashboard' || pathname === '/manager') {
          breadcrumbs.push({ name: 'Dashboard', path: '/manager/dashboard' })
        }
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  const ChevronIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )

  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 flex-shrink-0">
      <div className="h-full px-3 sm:px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSidebarToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isSidebarCollapsed ? <HiMenu className="h-5 w-5" /> : <HiX className="h-5 w-5" />}
          </button>
          <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{crumb.name}</span>
                ) : (
                  <>
                    <span
                      className="hover:text-gray-900 cursor-pointer"
                      onClick={() => navigate(crumb.path)}
                    >
                      {crumb.name}
                    </span>
                    <ChevronIcon />
                  </>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Actions - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              className="text-sm"
              onClick={() => navigate('/manager/transactions/add')}
            >
              + Add Transaction
            </Button>
            <Button
              variant="outline"
              size="md"
              className="text-sm"
              onClick={() => navigate('/manager/appointments')}
            >
              + Appointment
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/manager/staff/add')}
              className="text-sm"
            >
              + Staff
            </Button>
          </div>

          {/* Notifications */}
          <ManagerNotificationBell />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 text-gray-700 hover:bg-gray-100 rounded"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userInfo?.name?.charAt(0) || 'M'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-tight">
                  {userInfo?.name || 'Manager'}
                </p>
                <p className="text-xs text-gray-500">Manager</p>
              </div>
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <a
                    href="/manager/profile"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <a
                    href="/manager/settings"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={closeDropdowns} />
      )}
    </header>
  )
}

export default memo(ManagerHeader)