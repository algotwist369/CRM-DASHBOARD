import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaBullhorn,
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaSpinner,
  FaEdit,
  FaPlay,
  FaPause,
  FaStop,
  FaDollarSign,
  FaPercentage,
  FaEnvelopeOpen,
  FaMousePointer,
  FaEye
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const CampaignDetails = () => {
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

  if (!campaign) return null

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
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="text-gray-600">{campaign.description}</p>
        </div>
      </div>

      <div className="bg-white   border border-gray-200 p-6">
        <p className="text-gray-600">Campaign details page - Coming soon with full CRM features</p>
      </div>
    </div>
  )
}

export default CampaignDetails

