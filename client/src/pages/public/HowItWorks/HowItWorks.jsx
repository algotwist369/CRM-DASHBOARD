import React, { useEffect } from 'react'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { FaUserPlus, FaCog, FaCalendarCheck, FaRocket } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const HowItWorks = () => {
  usePageTitle('How It Works - Booking App')

  useEffect(() => {
    window.scrollTo(0, 0);
  })
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
      <div className="bg-primary-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              How It Works
            </h1>
            <p className="text-sm text-primary-100">
              Get started in just a few simple steps
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <div className="bg-white border p-4 text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="text-primary-600" />
                  </div>
                  <div className="text-2xl font-bold text-primary-200 mb-2">{step.number}</div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-xs">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                    <div className="w-4 h-0.5 bg-primary-300"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-primary-300 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Why Choose Us?
            </h2>
            <p className="text-sm text-gray-600">
              Everything you need to manage appointments and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Fast Setup</h3>
              <p className="text-gray-600 text-xs">
                Get started in minutes. No technical knowledge required.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Affordable Pricing</h3>
              <p className="text-gray-600 text-xs">
                Start free, scale as you grow. No hidden fees.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Proven Results</h3>
              <p className="text-gray-600 text-xs">
                Trusted by thousands of businesses worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-lg font-semibold mb-2">Ready to Get Started?</h2>
          <p className="text-sm text-primary-100 mb-4">
            Join thousands of businesses already using our platform
          </p>
          <Link
            to="/free-listing"
            className="inline-block px-6 py-2 bg-white text-primary-600 hover:bg-gray-100"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks

