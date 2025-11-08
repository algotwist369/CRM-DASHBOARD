import React, { useState } from 'react'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { FaBullhorn, FaChartLine, FaUsers, FaCheckCircle } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const Advertise = () => {
  usePageTitle('Advertise - Booking App')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    website: '',
    budget: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Thank you! We will contact you soon about advertising opportunities.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      businessName: '',
      website: '',
      budget: '',
      message: ''
    })
  }

  const benefits = [
    'Reach thousands of potential customers',
    'Targeted advertising options',
    'Multiple ad formats available',
    'Real-time performance tracking',
    'Flexible budget options',
    'Dedicated account manager'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaBullhorn className="mx-auto text-5xl sm:text-6xl mb-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Advertise With Us
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto">
              Reach thousands of customers looking for your services
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Advertise With Us?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our platform connects businesses with customers actively looking for services. 
              Advertise your business and reach your target audience effectively.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <FaCheckCircle className="text-primary-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Track Your Results</h3>
                  <p className="text-sm text-gray-600">Monitor ad performance in real-time</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FaUsers className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Targeted Audience</h3>
                  <p className="text-sm text-gray-600">Reach customers in your area</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Started</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Budget
                </label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select budget range</option>
                  <option value="under-500">Under $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-5000">$1,000 - $5,000</option>
                  <option value="5000+">$5,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell us about your advertising needs..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Advertise

