import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaChartLine,
  FaSpinner
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const CampaignAnalytics = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState(null)

  useEffect(() => {
    fetchCampaign()
  }, [id])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      const result = await managerService.getCampaigns({})
      if (result.success) {
        const foundCampaign = result.data.data.find(c => c._id === id)
        if (foundCampaign) {
          setCampaign(foundCampaign)
        } else {
          toast.error('Campaign not found')
          navigate('/manager/campaigns')
        }
      }
    } catch (error) {
      toast.error('Failed to fetch campaign')
      navigate('/manager/campaigns')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-primary-600 text-4xl" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/manager/campaigns')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaChartLine className="text-primary-600" />
            Campaign Analytics
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Campaign analytics page - Coming soon with detailed metrics</p>
      </div>
    </div>
  )
}

export default CampaignAnalytics

