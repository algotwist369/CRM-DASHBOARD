import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaBullseye } from 'react-icons/fa'

const CustomerTargeting = () => {
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/customers')}
            className="p-2 hover:bg-gray-100  transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaBullseye className="text-primary-600" />
              Customer Targeting
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-12 text-center rounded-lg shadow-sm">
        <FaBullseye className="mx-auto text-gray-300 text-6xl mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Feature Unavailable</h2>
        <p className="text-gray-600 mb-6">
          The Customer Targeting feature has been disabled as requested.
        </p>
        <button
          onClick={() => navigate('/manager/customers')}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Return to Customers
        </button>
      </div>
    </div>
  )
}

export default CustomerTargeting

