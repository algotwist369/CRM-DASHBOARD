import React from 'react'
import { usePageTitle } from '../../../hooks/usePageTitle'
import {
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaBell,
  FaMobileAlt,
  FaShieldAlt,
  FaCreditCard,
  FaCog,
  FaHeadset,
  FaSync,
  FaLock,
  FaRocket
} from 'react-icons/fa'

const Features = () => {
  usePageTitle('Features - Booking App')

  const features = [
    {
      icon: FaCalendarAlt,
      title: 'Easy Appointment Booking',
      description: 'Streamline your booking process with our intuitive calendar system. Customers can book appointments 24/7 from any device.'
    },
    {
      icon: FaUsers,
      title: 'Customer Management',
      description: 'Manage all your customers in one place. Track their history, preferences, and build lasting relationships.'
    },
    {
      icon: FaChartLine,
      title: 'Analytics & Reports',
      description: 'Get insights into your business performance with detailed analytics and customizable reports.'
    },
    {
      icon: FaBell,
      title: 'Automated Reminders',
      description: 'Reduce no-shows with automated SMS and email reminders sent to customers before appointments.'
    },
    {
      icon: FaMobileAlt,
      title: 'Mobile Responsive',
      description: 'Access your dashboard from anywhere. Our platform works seamlessly on desktop, tablet, and mobile devices.'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security. Regular backups ensure your information is always safe.'
    },
    {
      icon: FaCreditCard,
      title: 'Payment Integration',
      description: 'Accept payments online with integrated payment gateways. Support for multiple payment methods.'
    },
    {
      icon: FaCog,
      title: 'Customizable Settings',
      description: 'Tailor the platform to your business needs with extensive customization options and settings.'
    },
    {
      icon: FaHeadset,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our round-the-clock customer support team.'
    },
    {
      icon: FaSync,
      title: 'Real-time Updates',
      description: 'Stay synchronized with real-time updates across all devices. Changes reflect instantly.'
    },
    {
      icon: FaLock,
      title: 'Role-based Access',
      description: 'Control access with role-based permissions. Manage staff, managers, and admin access levels.'
    },
    {
      icon: FaRocket,
      title: 'Quick Setup',
      description: 'Get started in minutes. Our simple setup process gets your business online quickly.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Powerful Features
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto">
              Everything you need to manage and grow your business
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-primary-600 text-xl sm:text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform
          </p>
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </div>
  )
}

export default Features

