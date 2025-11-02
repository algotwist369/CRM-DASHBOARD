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
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <HiOutlineHome className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-wide">CRM Manager</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-gray-400 hover:text-white"
        >
          {isCollapsed ? (
            <HiOutlineChevronRight className="w-5 h-5" />
          ) : (
            <HiOutlineChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <div key={item.name}>
            <NavLink
              to={item.href}
              onClick={(e) => {
                if (item.submenu) {
                  e.preventDefault()
                  handleSubmenuToggle(item.name)
                }
              }}
              className={({ isActive }) => {
                const isParentActive = isActive || isActiveRoute(item.href)
                const hasActiveChild = item.submenu && isSubmenuActive(item.submenu)
                const base = 'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30'
                if (isParentActive) return `${base} bg-primary-600 text-white active:bg-primary-700`
                if (hasActiveChild) return `${base} bg-primary-600/80 text-white hover:bg-primary-600`
                return `${base} text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700`
              }}
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              aria-expanded={item.submenu ? activeSubmenu === item.name : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="ml-3">{item.name}</span>
                  {item.submenu && (
                    <HiOutlineChevronDown
                      className={`ml-auto w-4 h-4 transition-transform ${activeSubmenu === item.name ? 'rotate-180' : ''
                        }`}
                    />
                  )}
                </>
              )}
            </NavLink>

            {/* Submenu */}
            {item.submenu && !isCollapsed && activeSubmenu === item.name && (
              <div className="ml-6 mt-2 space-y-1">
                {item.submenu.map((subItem) => (
                  <NavLink
                    key={subItem.name}
                    to={subItem.href}
                    className={({ isActive }) => {
                      const base = 'block px-3 py-2 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30'
                      return (isActive || isActiveRoute(subItem.href))
                        ? `${base} bg-primary-500 text-white active:bg-primary-600`
                        : `${base} text-gray-400 hover:bg-gray-800 hover:text-white active:bg-gray-700`
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
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed ? (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
              <FaUserCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
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
              className="text-gray-400 hover:text-white"
            >
              <RiLogoutBoxRLine className='w-6 h-6 text-red-500' />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <FaUserCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerSidebar