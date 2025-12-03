import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../../../../components'
import {
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineCash,
  HiOutlineClipboardList,
  HiOutlineCog
} from 'react-icons/hi'
import { FaUserCircle } from 'react-icons/fa'
import { RiLogoutBoxRLine } from 'react-icons/ri'
import authService from '../../../../services/auth/authService'

const StaffSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation()
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const [userInfo, setUserInfo] = useState(null)

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

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/staff/dashboard',
      icon: <HiOutlineHome className="w-5 h-5" />
    },
    {
      name: 'My Profile',
      href: '/staff/profile',
      icon: <HiOutlineUser className="w-5 h-5" />
    },
    {
      name: 'My Business',
      href: '/staff/business',
      icon: <HiOutlineOfficeBuilding className="w-5 h-5" />
    },
    {
      name: 'Transactions',
      href: '/staff/transactions',
      icon: <HiOutlineCash className="w-5 h-5" />
    },
    {
      name: 'Daily Business',
      href: '/staff/daily-business',
      icon: <HiOutlineClipboardList className="w-5 h-5" />
    },
    {
      name: 'Settings',
      href: '/staff/settings',
      icon: <HiOutlineCog className="w-5 h-5" />
    }
  ]

  const handleSubmenuToggle = (itemName) => {
    setActiveSubmenu(activeSubmenu === itemName ? null : itemName)
  }

  const isActiveRoute = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const isSubmenuActive = (submenuItems) => {
    return submenuItems?.some(item => isActiveRoute(item.href))
  }

  const handleLogout = () => {
    authService.logout()
  }

  const staffName = userInfo?.name || userInfo?.staff?.name || 'Staff User'
  const staffEmail = userInfo?.email || userInfo?.staff?.email || 'staff@elitehair.com'

  return (
    <div
      className={`bg-gray-900 text-white transition-all duration-300 flex flex-col h-screen lg:h-full overflow-hidden
      fixed inset-y-0 left-0 z-50 transform ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} 
      ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} lg:static lg:inset-auto lg:transform-none`}
    >
      {/* Logo Section */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-700 min-h-[73px]`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-8 h-8 bg-primary-600  flex items-center justify-center flex-shrink-0">
                <HiOutlineHome className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-wide ml-3 truncate">Staff Portal</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-gray-400 hover:text-white flex-shrink-0 ml-2"
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-400 hover:text-white"
          >
            <HiOutlineChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isParentActive = isActiveRoute(item.href)
          const hasActiveChild = item.submenu && isSubmenuActive(item.submenu)
          
          return (
            <div key={item.name}>
              <NavLink
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onToggle()
                  }
                  if (item.submenu) {
                    handleSubmenuToggle(item.name)
                  }
                }}
                className={({ isActive }) => {
                  const base = `relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-3 py-2.5  text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 group`
                  if (isActive || isParentActive) return `${base} bg-primary-600 text-white shadow-lg active:bg-primary-700`
                  if (hasActiveChild) return `${base} bg-primary-600/80 text-white hover:bg-primary-600 shadow-md`
                  return `${base} text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700`
                }}
                aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.name}</span>
                    {item.submenu && (
                      <svg
                        className={`ml-2 w-4 h-4 transition-transform duration-200 ${
                          activeSubmenu === item.name ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </>
                )}
              </NavLink>

              {/* Submenu */}
              {item.submenu && !isCollapsed && activeSubmenu === item.name && (
                <div className="ml-8 mt-1 space-y-1 border-l-2 border-gray-700 pl-3">
                  {item.submenu.map((subItem) => (
                    <NavLink
                      key={subItem.name}
                      to={subItem.href}
                      className={({ isActive }) => {
                        const base = 'block px-3 py-2  text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30'
                        return (isActive || isActiveRoute(subItem.href))
                          ? `${base} bg-primary-500 text-white  active:bg-primary-600`
                          : `${base} text-gray-400 hover:bg-gray-800 hover:text-white hover:pl-4 active:bg-gray-700`
                      }}
                    >
                      {subItem.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <FaUserCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {staffName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {staffEmail}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all flex-shrink-0 p-2"
              title="Logout"
            >
              <RiLogoutBoxRLine className='w-5 h-5' />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleLogout}
              className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center hover:shadow-lg transition-all"
              title={staffName}
            >
              <FaUserCircle className="w-6 h-6 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffSidebar
