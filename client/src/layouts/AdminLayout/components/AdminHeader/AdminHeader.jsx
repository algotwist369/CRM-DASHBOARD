import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../../../components'
import { HiMenu, HiX, HiPlus } from 'react-icons/hi'
import AdminNotificationBell from '../../../../components/notifications/AdminNotificationBell'
import adminService from '../../../../services/admin/adminService'
import authService from '../../../../services/auth/authService'

const AdminHeader = ({ onSidebarToggle, isSidebarCollapsed }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User',
    role: 'Administrator',
    email: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await adminService.getProfile()
        if (res.success && res.data) {
          setAdminProfile({
            name: res.data.data.name || 'Admin User',
            role: 'Administrator',
            email: res.data.data.email || ''
          })
        }
      } catch (error) {
        console.error('Failed to fetch admin profile:', error)
      }
    }

    fetchProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Force logout even if API fails
      localStorage.clear()
      navigate('/auth/login')
    }
  }

  // Function to generate breadcrumb items from current route
  const getBreadcrumbs = () => {
    const pathname = location.pathname
    const pathSegments = pathname.split('/').filter(Boolean)

    // Route name mappings
    const routeNames = {
      'admin': 'Admin',
      'dashboard': 'Dashboard',
      'businesses': 'Businesses',
      'create': 'Create',
      'edit': 'Edit',
      'analytics': 'Analytics',
      'staff': 'Staff',
      'daily-records': 'Daily Records',
      'managers': 'Managers',
      'customers': 'Customers',
      'services': 'Services',
      'appointments': 'Appointments',
      'invoices': 'Invoices',
      'reviews': 'Reviews',
      'campaigns': 'Campaigns',
      'templates': 'Templates',
      'automated': 'Automated',
      'loyalty': 'Loyalty',
      'rewards': 'Rewards',
      'plans': 'Plans',
      'subscriptions': 'Subscriptions',
      'daily-business': 'Daily Business',
      'notifications': 'Notifications',
      'reports': 'Reports',
      'settings': 'Settings',
    }

    const breadcrumbs = []

    // Always start with Admin
    if (pathSegments.length > 0 && pathSegments[0] === 'admin') {
      breadcrumbs.push({ name: 'Admin', path: '/admin' })

      // Build breadcrumb for remaining segments
      let currentPath = '/admin'
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
            // The next iteration will handle the action segment (edit, analytics, etc.)
            // But we still need to include the ID in the path
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

      // If on dashboard or just /admin, ensure Dashboard is shown
      if (breadcrumbs.length === 1) {
        if (pathname === '/admin/dashboard' || pathname === '/admin') {
          breadcrumbs.push({ name: 'Dashboard', path: '/admin/dashboard' })
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
    <header className="w-full h-16 bg-white/90 backdrop-blur border-b border-gray-200 flex-shrink-0">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          {/* Sidebar toggle (mobile) */}
          <button
            type="button"
            onClick={onSidebarToggle}
            className="lg:hidden mr-3 inline-flex items-center justify-center  p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? <HiMenu className="h-6 w-6" /> : <HiX className="h-6 w-6" />}
          </button>
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
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
        <div className="flex items-center space-x-4">
          {/* Search */}
          {/* <div className="hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 lg:w-80 pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div> */}

          {/* Add Business Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/businesses/create')}
            className="hidden sm:flex items-center gap-2"
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Business</span>
          </Button>

          {/* Notifications */}
          <AdminNotificationBell />

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {adminProfile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{adminProfile.name}</p>
                <p className="text-xs text-gray-500">{adminProfile.role}</p>
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white  shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <a
                    href="/admin/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </a>
                  <a
                    href="/admin/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </a>
                  <a
                    href="/admin/help"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help & Support
                  </a>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
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
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        ></div>
      )}
    </header>
  )
}

export default AdminHeader
