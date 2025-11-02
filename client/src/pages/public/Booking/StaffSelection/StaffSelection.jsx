import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaUser,
  FaUserTie
} from 'react-icons/fa'

const StaffSelection = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [business, setBusiness] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBusinessData()
    loadSelectedStaff()
  }, [businessLink])

  const loadBusinessData = () => {
    const businessData = sessionStorage.getItem('bookingBusiness')
    if (businessData) {
      try {
        const parsed = JSON.parse(businessData)
        setBusiness(parsed)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        navigate(`/${businessLink}`)
      }
    } else {
      navigate(`/${businessLink}`)
    }
  }

  const loadSelectedStaff = () => {
    const saved = sessionStorage.getItem('selectedStaff')
    if (saved) {
      try {
        setSelectedStaff(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load selected staff')
      }
    }
  }

  const selectStaff = (staff) => {
    setSelectedStaff(staff)
    sessionStorage.setItem('selectedStaff', JSON.stringify(staff))
  }

  const handleContinue = () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member or choose "Any Available"')
      return
    }
    navigate(`/book/${businessLink}/time`) // Go to time selection page
  }

  const handleBack = () => {
    navigate(`/book/${businessLink}/services`) // Go back to service selection page
  }

  const handleAnyAvailable = () => {
    setSelectedStaff(null)
    sessionStorage.removeItem('selectedStaff')
    navigate(`/book/${businessLink}/time`) // Go to time selection page
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading staff...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <p className="text-gray-600 mb-6">Business not found</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const staffList = business.staff || []

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Select Staff Member</h1>
          <p className="text-gray-600 mt-2">Choose a preferred staff member or let us assign one</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staff List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Any Available Option */}
            <div
              onClick={handleAnyAvailable}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all ${
                !selectedStaff
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    !selectedStaff
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300'
                  }`}
                >
                  {!selectedStaff && <FaCheckCircle className="text-white text-xs" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Any Available Staff</h3>
                  <p className="text-sm text-gray-600">We'll assign the best available staff member</p>
                </div>
              </div>
            </div>

            {/* Staff Members */}
            {staffList.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FaUserTie className="mx-auto text-gray-400 text-4xl mb-4" />
                <p className="text-gray-600">No staff members available</p>
              </div>
            ) : (
              staffList.map((staff, index) => {
                const isSelected = selectedStaff?._id === staff._id || selectedStaff?.id === staff.id

                return (
                  <div
                    key={index}
                    onClick={() => selectStaff(staff)}
                    className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                          isSelected
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <FaCheckCircle className="text-white text-xs" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {staff.name}
                            </h3>
                            {staff.role && (
                              <p className="text-sm text-gray-600 mb-2">{staff.role}</p>
                            )}
                            {staff.specialization && (
                              <p className="text-xs text-gray-500">
                                Specializes in: {staff.specialization}
                              </p>
                            )}
                          </div>
                          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-primary-600 text-2xl" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Business</span>
                  <span className="text-gray-900 font-medium">{business.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Staff</span>
                  <span className="text-gray-900 font-medium">
                    {selectedStaff ? selectedStaff.name : 'Any Available'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Continue
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffSelection
