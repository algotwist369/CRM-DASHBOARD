import React from 'react'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaEnvelope } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Careers = () => {
  usePageTitle('We are Hiring - Booking App')

const positions = [
  {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote / Mumbai, India',
    type: 'Full-time',
    description: 'We are looking for an experienced frontend developer to join our team.'
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Mumbai, India',
    type: 'Full-time',
    description: 'Help us create beautiful and intuitive user experiences.'
  },
  {
    title: 'Customer Success Manager',
    department: 'Support',
    location: 'Remote / India',
    type: 'Full-time',
    description: 'Help our customers succeed and grow their businesses.'
  },
  {
    title: 'Marketing Specialist',
    department: 'Marketing',
    location: 'Remote / India',
    type: 'Full-time',
    description: 'Drive growth and engagement through creative marketing campaigns.'
  }
];


  const benefits = [
    'Competitive salary and equity',
    'Health, dental, and vision insurance',
    'Flexible working hours',
    'Remote work options',
    'Professional development budget',
    'Unlimited paid time off',
    'Team building events',
    'Latest tech equipment'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaBriefcase className="mx-auto text-5xl sm:text-6xl mb-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              We're Hiring!
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto">
              Join our team and help shape the future of business management
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Open Positions */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Open Positions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {positions.map((position, index) => (
              <div
                key={index}
                className="bg-white   border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                    <p className="text-primary-600 font-medium">{position.department}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <FaMapMarkerAlt className="text-primary-600" />
                    {position.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <FaClock className="text-primary-600" />
                    {position.type}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{position.description}</p>
                <Link
                  to="/contact"
                  className="inline-block px-4 py-2 bg-primary-600 text-white  text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white   border border-gray-200 p-8 sm:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Work With Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-xs">✓</span>
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800  p-8 sm:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Don't See a Role That Fits?</h2>
          <p className="text-xl text-primary-100 mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3 bg-white text-primary-600  font-semibold hover:bg-gray-100 transition-colors"
          >
            Send Your Resume
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Careers

