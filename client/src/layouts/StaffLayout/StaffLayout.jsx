import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { StaffSidebar, StaffHeader } from './components'

const StaffLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Simulate authentication check
    const checkAuth = async () => {
      try {
        // In a real app, this would check for valid staff tokens
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock authentication check
        const isAuthenticated = true // This would come from your auth context
        const userRole = 'staff' // This would come from your auth context
        
        if (!isAuthenticated || userRole !== 'staff') {
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
    const savedState = localStorage.getItem('staffSidebarCollapsed')
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState))
    }
  }, [])

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('staffSidebarCollapsed', JSON.stringify(newState))
  }

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed)
    localStorage.setItem('staffSidebarCollapsed', JSON.stringify(collapsed))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <StaffSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <StaffHeader
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
        <footer className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>© 2024 Elite Hair Studio CRM</span>
              <span>•</span>
              <span>Staff Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/staff/help" className="hover:text-gray-900">
                Help
              </a>
              <a href="/staff/support" className="hover:text-gray-900">
                Support
              </a>
              <a href="/staff/privacy" className="hover:text-gray-900">
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

export default StaffLayout
