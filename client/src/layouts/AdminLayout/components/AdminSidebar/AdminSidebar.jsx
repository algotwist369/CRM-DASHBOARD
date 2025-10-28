import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../../../../components'
import {
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineChevronDown,
} from 'react-icons/hi'
import { FaUserCircle } from 'react-icons/fa';
import { RiLogoutBoxRLine } from "react-icons/ri";


import authService from '../../../../services/auth/authService';

const AdminSidebar = ({ isCollapsed, onToggle }) => {
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
      href: '/admin/dashboard',
      icon: <HiOutlineHome className="w-5 h-5" />,
    },
    {
      name: 'Businesses',
      href: '/admin/businesses',
      icon: <HiOutlineOfficeBuilding className="w-5 h-5" />,
      submenu: [
        { name: 'All Businesses', href: '/admin/businesses' },
        { name: 'Create Business', href: '/admin/businesses/create' },
      ],
    },
    {
      name: 'Managers',
      href: '/admin/managers',
      icon: <HiOutlineUserGroup className="w-5 h-5" />,
      submenu: [
        { name: 'All Managers', href: '/admin/managers' },
        { name: 'Create Manager', href: '/admin/managers/create' },
      ],
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: <HiOutlineChartBar className="w-5 h-5" />,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
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

  return (
    <div
      className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
        } flex flex-col min-h-screen`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <HiOutlineHome className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-wide">CRM Admin</h1>
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
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <div key={item.name}>
            <NavLink
              to={item.href}
              onClick={() => item.submenu && handleSubmenuToggle(item.name)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ||
                  isActiveRoute(item.href) ||
                  (item.submenu && isSubmenuActive(item.submenu))
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
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
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive || isActiveRoute(subItem.href)
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`
                    }
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
                Admin User
              </p>
              <p className="text-xs text-gray-400 truncate">
                admin@elitehair.com
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

export default AdminSidebar
