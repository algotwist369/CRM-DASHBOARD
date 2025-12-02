import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaChartLine, FaArrowLeft } from 'react-icons/fa'

const CampaignAnalyticsOverview = () => {
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/manager/campaigns')}
          className="p-2 hover:bg-gray-100  transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaChartLine className="text-primary-600" />
            Campaign Analytics Overview
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics across all campaigns</p>
        </div>
      </div>

      <div className="bg-white   border border-gray-200 p-6">
        <p className="text-gray-600">Campaign analytics overview - Coming soon</p>
      </div>
    </div>
  )
}

export default CampaignAnalyticsOverview

