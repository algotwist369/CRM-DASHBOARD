import React from 'react'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { FaUserPlus, FaCog, FaCalendarCheck, FaRocket } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const HowItWorks = () => {
  usePageTitle('How It Works - Booking App')

  const steps = [
    {
      number: '01',
      icon: FaUserPlus,
      title: 'Sign Up',
      description: 'Create your free account in minutes. No credit card required to get started.'
    },
    {
      number: '02',
      icon: FaCog,
      title: 'Set Up Your Business',
      description: 'Add your business details, services, staff, and availability. Customize to match your brand.'
    },
    {
      number: '03',
      icon: FaCalendarCheck,
      title: 'Start Accepting Bookings',
      description: 'Share your booking link with customers. They can book appointments 24/7 from any device.'
    },
    {
      number: '04',
      icon: FaRocket,
      title: 'Grow Your Business',
      description: 'Use analytics and tools to manage customers, send reminders, and grow your business.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              How It Works
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-primary-600 text-2xl sm:text-3xl" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-primary-200 mb-2">{step.number}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-primary-300"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-primary-300 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage appointments and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Setup</h3>
              <p className="text-gray-600">
                Get started in minutes. No technical knowledge required.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Affordable Pricing</h3>
              <p className="text-gray-600">
                Start free, scale as you grow. No hidden fees.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Proven Results</h3>
              <p className="text-gray-600">
                Trusted by thousands of businesses worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks

