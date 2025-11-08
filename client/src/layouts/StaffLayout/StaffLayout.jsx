import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { StaffSidebar, StaffHeader } from './components'

const StaffLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        // Check for auth token and role
        const authToken = localStorage.getItem('authToken')
        const userRole = localStorage.getItem('userRole')
        
        if (!authToken || userRole !== 'staff') {
          navigate('/auth/staff-login')
          return
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Authentication check failed:', error)
        navigate('/auth/staff-login')
      }
    }

    checkAuth()
  }, [navigate])

  useEffect(() => {
    // On mobile, sidebar should be collapsed by default
    // On desktop, check localStorage for saved state
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        // Mobile: sidebar collapsed by default
        setSidebarCollapsed(true)
      } else {
        // Desktop: check localStorage
        const savedState = localStorage.getItem('staffSidebarCollapsed')
        if (savedState !== null) {
          setSidebarCollapsed(JSON.parse(savedState))
        } else {
          // Default to expanded on desktop
          setSidebarCollapsed(false)
        }
      }
    }
    
    checkMobile()
    
    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
      {/* Sidebar - Fixed width on desktop (256px expanded, 64px collapsed), overlay on mobile */}
      <div className={`
        ${sidebarCollapsed ? 'w-16' : 'w-64'} 
        ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        fixed lg:fixed
        inset-y-0 left-0
        z-50 lg:z-30
        transition-transform duration-300 ease-in-out
        flex-shrink-0
      `}>
        <StaffSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* Main Content - Adjusts margin on desktop to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col overflow-hidden w-full transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <StaffHeader
          onSidebarToggle={handleSidebarToggle}
          isSidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span>© 2024 RAMA CRM</span>
              <span className="hidden sm:inline">•</span>
              <span>Staff Portal</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <a href="/staff/help" className="hover:text-gray-900">
                Help
              </a>
              <span className="hidden sm:inline">•</span>
              <a href="/staff/support" className="hover:text-gray-900">
                Support
              </a>
              <span className="hidden sm:inline">•</span>
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
