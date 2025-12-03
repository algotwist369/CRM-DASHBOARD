import React, { useEffect } from 'react'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { Link, useLocation } from 'react-router-dom'
import {
  FaStore,
  FaUsers,
  FaChartBar,
  FaMobileAlt,
  FaShieldAlt,
  FaHeadset,
  FaCheckCircle
} from 'react-icons/fa'

const ForBusinesses = () => {
  usePageTitle('For Businesses - Booking App')
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash?.replace('#', '') || location.state?.scrollTo
    if (!hash) return
    const element = document.getElementById(hash)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location])

  const benefits = [
    {
      icon: FaStore,
      title: 'Perfect for Any Business',
      description: 'Whether you run a salon, spa, clinic, or any service-based business, our platform adapts to your needs.'
    },
    {
      icon: FaUsers,
      title: 'Manage Your Team',
      description: 'Add staff members, assign roles, and manage schedules all from one dashboard.'
    },
    {
      icon: FaChartBar,
      title: 'Track Performance',
      description: 'Monitor your business metrics with detailed analytics and insights.'
    },
    {
      icon: FaMobileAlt,
      title: 'Mobile First',
      description: 'Access your dashboard from anywhere. Manage bookings on the go with our mobile app.'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Compliant',
      description: 'Your data is protected with bank-level security and GDPR compliance.'
    },
    {
      icon: FaHeadset,
      title: 'Dedicated Support',
      description: 'Get help when you need it with our responsive customer support team.'
    }
  ]

  const features = [
    'Online appointment booking 24/7',
    'Automated email and SMS reminders',
    'Customer database and history',
    'Staff scheduling and management',
    'Payment processing integration',
    'Customizable booking forms',
    'Multi-location support',
    'Advanced reporting and analytics',
    'Mobile app for iOS and Android',
    'API access for integrations'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div id="overview" className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Built for Your Business
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto mb-8">
              Everything you need to manage appointments, customers, and grow your business
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-white text-primary-600  font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Businesses Love Us
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of businesses using our platform to streamline operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-white   border border-gray-200 p-6 sm:p-8"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100  flex items-center justify-center mb-4">
                  <Icon className="text-primary-600 text-xl sm:text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Everything You Need
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our comprehensive platform includes all the tools you need to manage your business efficiently.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <FaCheckCircle className="text-primary-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-primary-100  p-8 sm:p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Started Today</h3>
              <p className="text-gray-700 mb-6">
                Start your free trial and see how easy it is to manage your business with our platform.
              </p>
              <Link
                to="/register"
                className="inline-block px-6 py-3 bg-primary-600 text-white  font-semibold hover:bg-primary-700 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="get-started" className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform to grow and succeed
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-primary-600  font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForBusinesses

