import React, { useEffect } from 'react'
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

  useEffect(() => {
    window.scrollTo(0, 0);
  })
  usePageTitle('Features - Spa Advisor')

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
      <div className="bg-primary-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Powerful Features
            </h1>
            <p className="text-sm text-primary-100">
              Everything you need to manage and grow your business
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white border p-4"
              >
                <div className="w-10 h-10 bg-primary-100 flex items-center justify-center mb-3">
                  <Icon className="text-primary-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-xs">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-lg font-semibold mb-2">Ready to Get Started?</h2>
          <p className="text-sm text-primary-100 mb-4">
            Join thousands of businesses already using our platform
          </p>
          <a
            href="/free-listing"
            className="inline-block px-6 py-2 bg-white text-primary-600 hover:bg-gray-100"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </div>
  )
}

export default Features

