import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../components'
import { FaBell } from "react-icons/fa";
import { HiMenu, HiX } from 'react-icons/hi'
import managerService from '../../../../services/manager/managerService'
import authService from '../../../../services/auth/authService'

const ManagerHeader = ({ onSidebarToggle, isSidebarCollapsed }) => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const result = await managerService.getNotifications({ 
        page: 1, 
        limit: 5,
        status: 'sent' // Show only sent notifications for activity feed
      })
      if (result.success) {
        setNotifications(result.data.data || [])
        // Calculate "unread" count as notifications sent in last 24 hours
        const now = new Date()
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const recent = (result.data.data || []).filter(n => {
          const sentAt = n.sentAt || n.createdAt
          return new Date(sentAt) > yesterday
        })
        setUnreadCount(recent.length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch notifications when dropdown opens
    if (notificationMenuOpen) {
      fetchNotifications()
    }
  }, [notificationMenuOpen, fetchNotifications])

  useEffect(() => {
    // Fetch notifications on mount
    fetchNotifications()
    // Real-time updates: refresh every 10 seconds for better real-time feel
    const interval = setInterval(() => {
      fetchNotifications() // Always refresh for real-time updates
    }, 10000) // Reduced from 30s to 10s for better responsiveness
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/auth/manager-login')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/auth/manager-login')
    }
  }

  const handleNotificationClick = (notification) => {
    setNotificationMenuOpen(false)
    // Navigate to notification analytics page
    navigate(`/manager/notifications/${notification._id}/analytics`)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    }
  }

  // Get manager info from localStorage or token
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch (e) {
        return null
      }
    }
    return null
  }

  const userInfo = getUserInfo()

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
            <span>Manager</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Dashboard</span>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/manager/appointments')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Appointment
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/manager/staff/add')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add Staff
            </Button>
          </div>

          {/* Search */}
          <div className="hidden md:block">
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
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              className="relative text-gray-600 hover:text-gray-900"
            >
              <FaBell className='text-2xl'/>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Dropdown */}
            {notificationMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white  shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No notifications</div>
                  ) : (
                    notifications.map((notification) => {
                      const isRecent = notification.sentAt 
                        ? new Date(notification.sentAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                        : false
                      
                      return (
                        <div
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isRecent ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                              isRecent ? 'bg-blue-500' : 'bg-gray-300'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                                  notification.status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                                  notification.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {notification.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>{notification.stats?.totalRecipients || 0} recipients</span>
                                <span>{notification.stats?.sent || 0} sent</span>
                                <span>{formatTime(notification.sentAt || notification.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setNotificationMenuOpen(false)
                      navigate('/manager/notifications')
                    }}
                  >
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
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">
                  {userInfo?.name || 'Manager User'}
                </p>
                <p className="text-xs text-gray-500">Manager</p>
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
                    href="/manager/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </a>
                  <a
                    href="/manager/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </a>
                  <a
                    href="/manager/help"
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
      {(userMenuOpen || notificationMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false)
            setNotificationMenuOpen(false)
          }}
        ></div>
      )}
    </header>
  )
}

export default ManagerHeader