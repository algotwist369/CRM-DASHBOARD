import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AdminSidebar, AdminHeader } from './components'
import authService from '../../services/auth/authService'
import SocketDebugPanel from '../../components/debug/SocketDebugPanel'
import { useSocket } from '../../contexts/SocketContext'
import toast from 'react-hot-toast'
import ProtectedFooter from '../../components/common/ProtectedFooter'

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { socket } = useSocket()

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

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return

    const handleNewAppointment = (data) => {
      toast.success(
        <div>
          <p className="font-bold">{data.message}</p>
          <p className="text-sm text-gray-500">{data.time}</p>
          {data.source === 'online' && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mt-1 inline-block">Online Booking</span>}
        </div>,
        {
          duration: 6000,
          position: 'top-right',
          icon: '📅',
          style: {
            border: '1px solid #E5E7EB',
            padding: '16px',
            color: '#1F2937',
          },
        }
      )
    }

    socket.on('new_appointment', handleNewAppointment)

    return () => {
      socket.off('new_appointment', handleNewAppointment)
    }
  }, [socket])

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
        <ProtectedFooter />
      </div>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => handleSidebarCollapse(true)}
        ></div>
      )}

      {/* Socket.IO Debug Panel (Development Only) */}
      {import.meta.env.DEV && <SocketDebugPanel />}
    </div>
  )
}

export default AdminLayout
