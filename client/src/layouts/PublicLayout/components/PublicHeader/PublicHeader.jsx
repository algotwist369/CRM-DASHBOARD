import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaBell, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import { GrAnnounce } from 'react-icons/gr'
import { Button, Modal } from '../../../../components'
import { BookDemoForm } from '../../../../pages/public/BookDemo'

const BUSINESS_LINKS = [
  { name: 'Reviews Management', href: '/reviews-management' },
  { name: 'Google My Business Reviews', href: '/google-my-business-reviews' },
  { name: 'Facebook Reviews', href: '/facebook-reviews' },
  { name: 'Yelp Reviews', href: '/yelp-reviews' },
  { name: 'TripAdvisor Reviews', href: '/tripadvisor-reviews' }
]

const EXPLORE_LINKS = [
  { name: 'Features', href: '/features' },
  { name: 'How It Works', href: '/how-it-works' },
  {
    name: 'For Businesses',
    href: '/reviews-management',
    children: BUSINESS_LINKS
  },
  { name: 'Pricing', href: '/pricing' }
]

const QUICK_ACTION_LINKS = [
  { name: 'Check Status', action: 'check-status' },
  { name: 'Careers', href: '/careers' }
]

const MOBILE_SECTIONS = [
  { title: 'Explore', items: EXPLORE_LINKS },
  { title: 'For Businesses', items: BUSINESS_LINKS },
  { title: 'Quick Actions', items: QUICK_ACTION_LINKS },
  { title: 'More', items: [{ name: 'Advertise', href: '/advertise' }] }
]

// Utility function to check if a link is active
const isLinkActive = (href, location) => {
  if (!href) return false
  const [path, hash] = href.split('#')
  if (hash) {
    if (location.pathname !== path) return false
    const normalizedHash = `#${hash}`
    if (!location.hash) {
      return hash === 'overview'
    }
    return location.hash === normalizedHash
  }
  return location.pathname === href
}

const Dropdown = ({
  label,
  align = 'left',
  links,
  location,
  activeKey,
  setActiveKey,
  onSelect,
  dropdownRef
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const isOpen = activeKey === label
  const position = align === 'right' ? 'right-0' : 'left-0'

  useEffect(() => {
    if (!isOpen) {
      setActiveSubmenu(null)
    }
  }, [isOpen])

  const handleItemHover = useCallback((item) => {
    setActiveSubmenu(item.children?.length > 0 ? item.name : null)
  }, [])

  const handleOpen = useCallback(() => setActiveKey(label), [label, setActiveKey])
  const handleToggle = useCallback(() => setActiveKey(isOpen ? null : label), [isOpen, label, setActiveKey])
  const handleClose = useCallback(() => setActiveSubmenu(null), [])

  const linkActiveCheck = useCallback((href) => isLinkActive(href, location), [location])

  return (
    <div
      ref={dropdownRef}
      className="relative hidden lg:block"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-sm xl:text-base font-medium text-gray-700 hover:text-primary-600 px-2 py-1 hover:bg-gray-50 transition-all duration-200"
        onClick={handleToggle}
        onFocus={handleOpen}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className={`absolute ${position} top-full mt-2 w-56 bg-white border border-gray-200 shadow-xl py-2 z-50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200`}>
          {links.map((item) => {
            const showSubmenu = item.children?.length > 0 && activeSubmenu === item.name
            const itemIsActive = item.href && linkActiveCheck(item.href)
            return (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => handleItemHover(item)}
                onFocusCapture={() => handleItemHover(item)}
              >
                <button
                  onClick={() => onSelect(item)}
                  className={`w-full flex items-center justify-between gap-4 px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                    itemIsActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.children?.length > 0 && <FaChevronRight className="w-3 h-3 text-gray-400" />}
                </button>
                {showSubmenu && (
                  <div
                    className="absolute left-full top-0 ml-1 w-56 bg-white border border-gray-200 shadow-xl py-2 z-50 rounded-lg animate-in fade-in slide-in-from-left-2 duration-200"
                    onMouseEnter={() => setActiveSubmenu(item.name)}
                    onFocusCapture={() => setActiveSubmenu(item.name)}
                    onMouseLeave={handleClose}
                  >
                    {item.children.map((child) => {
                      const childIsActive = child.href && linkActiveCheck(child.href)
                      return (
                        <button
                          key={child.name}
                          onClick={() => onSelect(child)}
                          className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                            childIsActive
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          }`}
                        >
                          {child.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const PublicHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationCount] = useState(0)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [openMobileSection, setOpenMobileSection] = useState(null)
  const [showBookDemoModal, setShowBookDemoModal] = useState(false)
  const exploreRef = useRef(null)
  const quickRef = useRef(null)

  // Inject animations CSS once
  useEffect(() => {
    if (typeof document === 'undefined') return
    const styleId = 'public-header-animations'
    if (document.getElementById(styleId)) return

    const styleEl = document.createElement('style')
    styleEl.id = styleId
    styleEl.textContent = `
      @keyframes freeBadgeWave {
        0%, 100% { transform: translateY(-10%) rotate(-6deg) scale(1); }
        50% { transform: translateY(10%) rotate(6deg) scale(1.05); }
      }
      .free-badge-animate {
        animation: freeBadgeWave 1.6s ease-in-out infinite;
        will-change: transform;
      }
      @keyframes advertiseIconPulse {
        0%, 100% { transform: translateY(0) scale(1); }
        40% { transform: translateY(-15%) scale(1.08); }
        60% { transform: translateY(5%) scale(0.96); }
      }
      .advertise-icon-animate {
        animation: advertiseIconPulse 1.8s ease-in-out infinite;
        transform-origin: center;
        will-change: transform;
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .mobile-menu-enter {
        animation: slideDown 0.2s ease-out;
      }
    `
    document.head.appendChild(styleEl)
  }, [])

  // Handle click outside dropdowns
  useEffect(() => {
    if (!openDropdown) return

    const handleClickOutside = (event) => {
      const exploreNode = exploreRef.current
      const quickNode = quickRef.current

      if (exploreNode?.contains(event.target) || quickNode?.contains(event.target)) {
        return
      }
      setOpenDropdown(null)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }, [location.pathname])

  const handleNavigate = useCallback((path, options = {}) => {
    navigate(path, options)
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }, [navigate])

  const handleOpenBookDemo = useCallback(() => {
    setShowBookDemoModal(true)
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }, [])

  const handleAction = useCallback((item) => {
    if (item.action === 'check-status') {
      handleNavigate('/check-appointment')
      return
    }
    if (item.href) {
      const [basePath, hash] = item.href.split('#')
      if (hash) {
        const targetHash = `#${hash}`
        if (location.pathname === basePath) {
          handleNavigate(`${basePath}${targetHash}`)
          requestAnimationFrame(() => {
            const target = document.getElementById(hash)
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          })
        } else {
          handleNavigate(`${basePath}${targetHash}`, { state: { scrollTo: hash } })
        }
        return
      }
      handleNavigate(item.href)
    }
  }, [location.pathname, handleNavigate])

  const toggleMobileSection = useCallback((title) => {
    setOpenMobileSection(prev => prev === title ? null : title)
  }, [])

  const renderMobileSection = useCallback((section) => {
    const isOpen = openMobileSection === section.title
    return (
      <div key={section.title} className="border border-gray-200 overflow-hidden rounded-lg">
        <button
          type="button"
          onClick={() => toggleMobileSection(section.title)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm sm:text-base font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
        >
          <span>{section.title}</span>
          <FaChevronDown className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="flex flex-col py-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {section.items.map((item) => {
              const itemIsActive = item.href ? isLinkActive(item.href, location) : false
              return (
                <button
                  key={item.name}
                  onClick={() => handleAction(item)}
                  className={`text-left px-4 py-2 text-sm sm:text-base font-medium transition-colors duration-150 ${
                    itemIsActive
                      ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }, [openMobileSection, location, handleAction, toggleMobileSection])

  // Memoize notification badge component
  const NotificationBadge = useMemo(() => {
    if (notificationCount === 0) return null
    return (
      <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
        {notificationCount > 9 ? '9+' : notificationCount}
      </span>
    )
  }, [notificationCount])

  return (
    <>
      <header className="bg-primary-50 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 flex items-center justify-center mr-2 sm:mr-3 rounded-md">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="hidden min-[375px]:block">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-tight">SpaAdvisor</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 leading-tight hidden sm:block">Business Management System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            <Dropdown
              label="Explore"
              links={EXPLORE_LINKS}
              location={location}
              activeKey={openDropdown}
              setActiveKey={setOpenDropdown}
              onSelect={handleAction}
              dropdownRef={exploreRef}
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            <Dropdown
              label="Quick Actions"
              align="right"
              links={QUICK_ACTION_LINKS}
              location={location}
              activeKey={openDropdown}
              setActiveKey={setOpenDropdown}
              onSelect={handleAction}
              dropdownRef={quickRef}
            />
            <Link
              to="/advertise"
              className={`relative flex items-center gap-1 text-sm xl:text-base font-medium transition-all duration-200 whitespace-nowrap px-2 py-1 rounded-md ${
                location.pathname === '/advertise'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5">
                <GrAnnounce className="w-full h-full advertise-icon-animate text-blue-500" />
              </span>
              Advertise
            </Link>
            {/* <button
              onClick={() => handleNavigate('/notifications')}
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200 rounded-md hover:bg-gray-50"
              aria-label="Notifications"
            >
              <FaBell className="w-4 h-4 sm:w-5 sm:h-5" />
              {NotificationBadge}
            </button> */}
            <Button variant="outline" onClick={() => handleNavigate('/auth/login')} className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              Login
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={handleOpenBookDemo}
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              >
                Book Demo
              </Button>
              <Button
                variant="primary"
                onClick={() => handleNavigate('/free-listing')}
                className="relative overflow-visible text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              >
                <span className="hidden xl:inline">Free Listing</span>
                <span className="xl:hidden">Free</span>
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap shadow-xl border-2 border-white z-10 free-badge-animate">
                  <span className="relative z-10">FREE</span>
                  <span className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50"></span>
                </span>
              </Button>
            </div>
          </div>

          {/* Tablet Actions */}
          <div className="hidden md:flex lg:hidden items-center space-x-2">
            {/* <button
              onClick={() => handleNavigate('/notifications')}
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200 rounded-md hover:bg-gray-50"
              aria-label="Notifications"
            >
              <FaBell className="w-5 h-5" />
              {NotificationBadge}
            </button> */}
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={handleOpenBookDemo} className="text-sm px-3 py-1.5">
                Book Demo
              </Button>
              <Button variant="primary" onClick={() => handleNavigate('/free-listing')} className="relative overflow-visible text-sm px-3 py-1.5">
                Free
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap shadow-xl border-2 border-white z-10 free-badge-animate">
                  <span className="relative z-10">FREE</span>
                  <span className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50"></span>
                </span>
              </Button>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => handleNavigate('/notifications')}
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200 rounded-md hover:bg-gray-100"
              aria-label="Notifications"
            >
              <FaBell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-1.5">
              <Button
                variant="primary"
                onClick={handleOpenBookDemo}
                className="text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 sm:py-2 h-8 sm:h-9"
              >
                Demo
              </Button>
              <Button
                variant="primary"
                onClick={() => handleNavigate('/free-listing')}
                className="relative overflow-visible text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 sm:py-2 h-8 sm:h-9 shadow-md hover:shadow-lg transition-shadow"
              >
                <span className="relative z-0">Free</span>
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg border-2 border-white z-10 free-badge-animate">
                  <span className="relative z-10">FREE</span>
                  <span className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50"></span>
                </span>
              </Button>
            </div>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-md"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 sm:py-4 max-h-[calc(100vh-4rem)] overflow-y-auto mobile-menu-enter">
            <nav className="flex flex-col space-y-1 sm:space-y-2">
              {MOBILE_SECTIONS.map(renderMobileSection)}
              <div className="px-4 pt-3 sm:pt-4 border-t border-gray-200 space-y-2 sm:space-y-3">
                <Button variant="ghost" className="w-full text-sm sm:text-base py-2.5 sm:py-3" onClick={handleOpenBookDemo}>
                  Book a Demo
                </Button>
                <Button variant="outline" className="w-full text-sm sm:text-base py-2.5 sm:py-3" onClick={() => handleNavigate('/auth/login')}>
                  Login
                </Button>
                <Button variant="primary" className="w-full relative overflow-visible text-sm sm:text-base py-2.5 sm:py-3" onClick={() => handleNavigate('/free-listing')}>
                  Free Listing
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap shadow-xl border-2 border-white z-10 free-badge-animate">
                    <span className="relative z-10">FREE</span>
                    <span className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50"></span>
                  </span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
      </header>

      <Modal
        isOpen={showBookDemoModal}
        onClose={() => setShowBookDemoModal(false)}
        title="Book a Demo"
        size="xl"
      >
        <div className="space-y-6">
          <details className="group bg-primary-50 border border-primary-100 p-4 sm:p-5 rounded-lg">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <h3 className="text-lg font-semibold text-primary-900">
                See how SpaAdvisor drives growth
              </h3>
              <span className="text-primary-700 transition-transform duration-200 group-open:rotate-180">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <ul className="mt-4 space-y-2 text-sm text-primary-900">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0"></span>
                <span>Increase repeat bookings with automated reminders and loyalty tools.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0"></span>
                <span>Understand performance across locations with real-time dashboards.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0"></span>
                <span>Deliver 5-star experiences by aligning staff, schedules, and services.</span>
              </li>
            </ul>
          </details>
          <BookDemoForm
            mode="modal"
            onComplete={(payload) => {
              setShowBookDemoModal(false)
              handleNavigate('/contact', {
                state: { intent: 'book-demo', payload, message: 'BookDemoFormSubmitted' }
              })
            }}
          />
        </div>
      </Modal>
    </>
  )
}

export default PublicHeader
