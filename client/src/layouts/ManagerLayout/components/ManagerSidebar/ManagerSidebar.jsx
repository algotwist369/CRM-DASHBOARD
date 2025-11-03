import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../../../../components'
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineChevronDown,
} from 'react-icons/hi'
import { FaBullhorn } from 'react-icons/fa'
import { FaUserCircle } from 'react-icons/fa';
import { RiLogoutBoxRLine } from "react-icons/ri";
import authService from '../../../../services/auth/authService';

const ManagerSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation()
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const [pendingSubmenu, setPendingSubmenu] = useState(null)

  const handleLogout = () => {
    authService.logout()
  }

  useEffect(() => {
    try {
      const getProfile = async () => {
        const profile = authService.getCurrentUser();
        console.log("Profile:", profile);
      };
      getProfile();
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [])

  // When sidebar expands and there's a pending submenu, open it
  useEffect(() => {
    if (!isCollapsed && pendingSubmenu) {
      // Small delay to allow sidebar animation to complete
      const timer = setTimeout(() => {
        setActiveSubmenu(pendingSubmenu)
        setPendingSubmenu(null)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isCollapsed, pendingSubmenu])

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/manager/dashboard',
      icon: <HiOutlineHome className="w-5 h-5" />,
    },
    {
      name: 'Staff',
      href: '/manager/staff',
      icon: <HiOutlineUserGroup className="w-5 h-5" />,
      submenu: [
        { name: 'All Staff', href: '/manager/staff' },
        { name: 'Add Staff', href: '/manager/staff/add' },
      ],
    },
    {
      name: 'Customers',
      href: '/manager/customers',
      icon: <HiOutlineUsers className="w-5 h-5" />,
      submenu: [
        { name: 'All Customers', href: '/manager/customers' },
        { name: 'Customer Analytics', href: '/manager/customers/analytics' },
        { name: 'Customer Segments', href: '/manager/customers/segments' },
        { name: 'Customer Insights', href: '/manager/customers/insights' },
        { name: 'Customer Targeting', href: '/manager/customers/targeting' },
      ],
    },
    {
      name: 'Appointments',
      href: '/manager/appointments',
      icon: <HiOutlineCalendar className="w-5 h-5" />,
      submenu: [
        { name: 'All Appointments', href: '/manager/appointments' },
        { name: 'Calendar View', href: '/manager/appointments/calendar' },
      ],
    },
    {
      name: 'Transactions',
      href: '/manager/transactions',
      icon: <HiOutlineCurrencyDollar className="w-5 h-5" />,
      submenu: [
        { name: 'All Transactions', href: '/manager/transactions' },
        { name: 'Add Transaction', href: '/manager/transactions/add' },
      ],
    },
    {
      name: 'Daily Business',
      href: '/manager/daily-business',
      icon: <HiOutlineChartBar className="w-5 h-5" />,
      submenu: [
        { name: 'Daily Records', href: '/manager/daily-business' },
        { name: 'Add Record', href: '/manager/daily-business/add' },
      ],
    },
    {
      name: 'Notifications',
      href: '/manager/notifications',
      icon: <HiOutlineBell className="w-5 h-5" />,
    },
    {
      name: 'Campaigns',
      href: '/manager/campaigns',
      icon: <FaBullhorn className="w-5 h-5" />,
      submenu: [
        { name: 'All Campaigns', href: '/manager/campaigns' },
        { name: 'Create Campaign', href: '/manager/campaigns/create' },
        { name: 'Campaign Analytics', href: '/manager/campaigns/analytics' },
      ],
    },
    {
      name: 'Reports',
      href: '/manager/reports',
      icon: <HiOutlineChartBar className="w-5 h-5" />,
    },
    {
      name: 'Settings',
      href: '/manager/settings',
      icon: <HiOutlineCog className="w-5 h-5" />,
    },
  ]

  const handleSubmenuToggle = (itemName) => {
    setActiveSubmenu(activeSubmenu === itemName ? null : itemName)
  }

  const isActiveRoute = (href) =>
    location.pathname === href || location.pathname.startsWith(href + '/')

  const isSubmenuActive = (submenuItems) =>
    submenuItems.some((item) => isActiveRoute(item.href))

  // Get manager info from localStorage
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
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <HiOutlineHome className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-wide ml-3 truncate">CRM Manager</h1>
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
        {navigationItems.map((item) => (
          <div key={item.name}>
            <NavLink
              to={item.href}
              onClick={(e) => {
                if (item.submenu) {
                  e.preventDefault()
                  // If sidebar is collapsed and item has submenu, expand the sidebar first
                  if (isCollapsed) {
                    setPendingSubmenu(item.name)
                    onToggle()
                  } else {
                    // Sidebar is already expanded, just toggle the submenu
                    handleSubmenuToggle(item.name)
                  }
                }
              }}
              className={({ isActive }) => {
                const isParentActive = isActive || isActiveRoute(item.href)
                const hasActiveChild = item.submenu && isSubmenuActive(item.submenu)
                const base = `flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 group`
                if (isParentActive) return `${base} bg-primary-600 text-white shadow-lg active:bg-primary-700`
                if (hasActiveChild) return `${base} bg-primary-600/80 text-white hover:bg-primary-600 shadow-md`
                return `${base} text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700`
              }}
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              aria-expanded={item.submenu ? activeSubmenu === item.name : undefined}
              title={isCollapsed ? item.name : undefined}
            >
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="ml-3 flex-1 text-left">{item.name}</span>
                  {item.submenu && (
                    <HiOutlineChevronDown
                      className={`ml-2 w-4 h-4 transition-transform duration-200 ${activeSubmenu === item.name ? 'rotate-180' : ''
                        }`}
                    />
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
                      const base = 'block px-3 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30'
                      return (isActive || isActiveRoute(subItem.href))
                        ? `${base} bg-primary-500 text-white shadow-sm active:bg-primary-600`
                        : `${base} text-gray-400 hover:bg-gray-800 hover:text-white hover:pl-4 active:bg-gray-700`
                    }}
                  >
                    {subItem.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
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
                {userInfo?.name || 'Manager User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userInfo?.business || 'Manager'}
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
              title={userInfo?.name || 'Manager User'}
            >
              <FaUserCircle className="w-6 h-6 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerSidebar