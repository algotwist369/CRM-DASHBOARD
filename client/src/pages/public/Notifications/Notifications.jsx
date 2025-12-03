import React, { useState } from 'react'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { FaBell, FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa'

const Notifications = () => {
  usePageTitle('Notifications - Booking App')
  
  const [notifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Welcome to Booking App!',
      message: 'Thank you for joining us. Start by setting up your business profile.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Appointment Confirmed',
      message: 'Your appointment with John Doe has been confirmed for tomorrow at 2:00 PM.',
      time: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Payment Pending',
      message: 'You have a pending payment of $50. Please complete the payment.',
      time: '1 day ago',
      read: true
    },
    {
      id: 4,
      type: 'info',
      title: 'New Feature Available',
      message: 'Check out our new analytics dashboard to track your business performance.',
      time: '2 days ago',
      read: true
    }
  ])

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-600" />
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-600" />
      default:
        return <FaInfoCircle className="text-blue-600" />
    }
  }

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaBell className="mx-auto text-5xl sm:text-6xl mb-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Notifications
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto">
              Stay updated with all your important updates and alerts
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {notifications.length === 0 ? (
          <div className="bg-white   border border-gray-200 p-12 text-center">
            <FaBell className="mx-auto text-gray-400 text-5xl mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up! No new notifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white   border-2 p-6 ${getBgColor(notification.type)} ${
                  !notification.read ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-gray-700 mb-2">{notification.message}</p>
                        <p className="text-sm text-gray-500">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications

