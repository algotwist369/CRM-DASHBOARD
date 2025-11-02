import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AdminSidebar, AdminHeader } from './components'
import authService from '../../services/auth/authService'

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getToken()
        const role = authService.getUserRole()
        if (!token) {
          navigate('/auth/login')
          return
        }
        if (role !== 'admin') {
          navigate('/unauthorized')
          return
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Authentication check failed:', error)
        navigate('/auth/login')
      }
    }

    checkAuth()
  }, [navigate])

  useEffect(() => {
    // Handle sidebar collapse state in localStorage
    const savedState = localStorage.getItem('adminSidebarCollapsed')
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState))
    }
  }, [])

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState))
  }

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed)
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(collapsed))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader
          onSidebarToggle={handleSidebarToggle}
          isSidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>© 2024 Elite Hair Studio CRM</span>
              <span>•</span>
              <span>Version 1.0.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin/help" className="hover:text-gray-900">
                Help
              </a>
              <a href="/admin/support" className="hover:text-gray-900">
                Support
              </a>
              <a href="/admin/privacy" className="hover:text-gray-900">
                Privacy
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => handleSidebarCollapse(true)}
        ></div>
      )}
    </div>
  )
}

export default AdminLayout
