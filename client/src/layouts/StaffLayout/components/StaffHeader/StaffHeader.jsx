import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../../../components'
import { HiMenu, HiX } from 'react-icons/hi'
import authService from '../../../../services/auth/authService'
import staffService from '../../../../services/staff/staffService'

const StaffHeader = ({ onSidebarToggle, isSidebarCollapsed }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New appointment assigned',
      message: 'You have a new appointment with Sarah Johnson at 2 PM',
      time: '10 minutes ago',
      unread: true,
      createdAt: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: 2,
      title: 'Schedule update',
      message: 'Your schedule has been updated for tomorrow',
      time: '1 hour ago',
      unread: true,
      createdAt: new Date(Date.now() - 60 * 60 * 1000)
    },
    {
      id: 3,
      title: 'Performance review',
      message: 'Your monthly performance review is now available',
      time: '2 hours ago',
      unread: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ])

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  useEffect(() => {
    try {
      const user = authService.getCurrentUser()
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUserInfo(JSON.parse(storedUser))
      } else if (user) {
        setUserInfo(user)
      }
    } catch (e) {
      console.error('Error getting user info:', e)
    }
  }, [])

  // Fetch notifications from server (prepared for when endpoint is available)
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true)
      // Uncomment when server endpoint is ready:
      // const res = await staffService.getNotifications()
      // if (res.success) {
      //   setNotifications(res.data.data || res.data || [])
      // }
    } catch (e) {
      console.error('Error fetching notifications:', e)
    } finally {
      setLoadingNotifications(false)
    }
  }, [])

  useEffect(() => {
    // Fetch notifications on mount
    // fetchNotifications()
    // Uncomment when server endpoint is ready
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => n.unread).length

  // Function to generate breadcrumb items from current route
  const getBreadcrumbs = () => {
    const pathname = location.pathname
    const pathSegments = pathname.split('/').filter(Boolean)
    
    // Route name mappings
    const routeNames = {
      'staff': 'Staff',
      'dashboard': 'Dashboard',
      'profile': 'My Profile',
      'business': 'My Business',
      'settings': 'Settings',
    }

    const breadcrumbs = []
    
    // Always start with Staff
    if (pathSegments.length > 0 && pathSegments[0] === 'staff') {
      breadcrumbs.push({ name: 'Staff', path: '/staff' })
      
      // Build breadcrumb for remaining segments
      let currentPath = '/staff'
      for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i]
        currentPath += `/${segment}`
        const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        breadcrumbs.push({ name, path: currentPath })
      }
      
      // If on dashboard or just /staff, ensure Dashboard is shown
      if (breadcrumbs.length === 1) {
        if (pathname === '/staff/dashboard' || pathname === '/staff') {
          breadcrumbs.push({ name: 'Dashboard', path: '/staff/dashboard' })
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

  const handleLogout = () => {
    authService.logout()
    navigate('/auth/staff-login')
  }

  const handleNotificationClick = async (notificationId) => {
    try {
      // Mark notification as read when endpoint is available
      // await staffService.markNotificationRead(notificationId)
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, unread: false } : n)
      )
    } catch (e) {
      console.error('Error marking notification as read:', e)
    }
  }

  const staffName = userInfo?.name || userInfo?.staff?.name || 'Staff User'
  const staffEmail = userInfo?.email || userInfo?.staff?.email || 'staff@elitehair.com'
  const staffRole = userInfo?.role || userInfo?.staff?.role || 'Staff Member'

  return (
    <header className="w-full h-16 bg-white/90 backdrop-blur border-b border-gray-200 flex-shrink-0">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          {/* Sidebar toggle (mobile) */}
          <button
            type="button"
            onClick={onSidebarToggle}
            className="lg:hidden mr-3 inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
          <div className="hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 lg:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNotificationMenuOpen(!notificationMenuOpen)
                setUserMenuOpen(false)
              }}
              className="relative text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Dropdown */}
            {notificationMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  {loadingNotifications && (
                    <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mt-2"></div>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          notification.unread ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                            notification.unread ? 'bg-primary-500' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">No new notifications.</div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <Button variant="outline" size="sm" className="w-full text-sm font-medium text-primary-600 border-primary-200 bg-primary-50 hover:bg-primary-100">
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUserMenuOpen(!userMenuOpen)
                setNotificationMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{staffName}</p>
                <p className="text-xs text-gray-500">{staffRole}</p>
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <a
                    href="/staff/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </a>
                  <a
                    href="/staff/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </a>
                  <a
                    href="/staff/help"
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
      {notificationMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setNotificationMenuOpen(false)}
        ></div>
      )}
    </header>
  )
}

export default StaffHeader
