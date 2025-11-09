import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaIdBadge,
  FaRupeeSign,
  FaPercent,
  FaBriefcase,
  FaUserTag,
  FaLock,
  FaArrowLeft,
  FaEdit,
  FaSpinner,
  FaCalendarAlt
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import managerService from '../../../../services/manager/managerService'

const ROLE_COLORS = {
  stylist: 'bg-blue-100 text-blue-700',
  therapist: 'bg-purple-100 text-purple-700',
  receptionist: 'bg-green-100 text-green-700',
  cleaner: 'bg-orange-100 text-orange-700',
  assistant: 'bg-gray-100 text-gray-700',
  other: 'bg-pink-100 text-pink-700',
}

const StaffDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState(null)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        const res = await managerService.getStaff({ limit: 1000 })
        if (res.success) {
          const staffList = res.data?.data || []
          const foundStaff = staffList.find(s => s._id === id || s.id === id)
          if (foundStaff) {
            setStaff(foundStaff)
          } else {
            toast.error('Staff member not found')
            navigate('/manager/staff')
          }
        } else {
          toast.error('Failed to load staff details')
          navigate('/manager/staff')
        }
      } catch (error) {
        toast.error('Failed to load staff details')
        navigate('/manager/staff')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStaff()
    }
  }, [id, navigate])

  const formatCurrency = (amount) => {
    if (!amount) return '₹0'
    return `₹${parseInt(amount).toLocaleString('en-IN')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    )
  }

  if (!staff) {
    return null
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer border border-gray-300 rounded-lg p-2 hover:bg-blue-50 transition-colors"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{staff.name}</h1>
            <p className="text-gray-600 mt-1">Staff Member Details</p>
          </div>
          <Link
            to={`/manager/staff/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaEdit />
            <span>Edit Staff</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FaUser className="text-gray-400 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{staff.name}</p>
                </div>
              </div>
              {staff.phone && (
                <div className="flex items-center gap-3">
                  <FaPhoneAlt className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">{staff.phone}</p>
                  </div>
                </div>
              )}
              {staff.email && (
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{staff.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <FaUserTag className="text-gray-400 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    ROLE_COLORS[staff.role] || ROLE_COLORS.other
                  }`}>
                    {staff.role || 'N/A'}
                  </span>
                </div>
              </div>
              {staff.joiningDate && (
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Joining Date</p>
                    <p className="font-medium text-gray-900">{formatDate(staff.joiningDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.specialization && (
                <div className="flex items-center gap-3">
                  <FaIdBadge className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-medium text-gray-900">{staff.specialization}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <FaBriefcase className="text-gray-400 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium text-gray-900">{staff.experience || 0} years</p>
                </div>
              </div>
              {staff.salary && (
                <div className="flex items-center gap-3">
                  <FaRupeeSign className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium text-gray-900">{formatCurrency(staff.salary)}</p>
                  </div>
                </div>
              )}
              {staff.commission > 0 && (
                <div className="flex items-center gap-3">
                  <FaPercent className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Commission</p>
                    <p className="font-medium text-gray-900">{staff.commission}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                  staff.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {staff.username && (
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium text-gray-900 mt-1">{staff.username}</p>
                </div>
              )}
              {staff.pin && (
                <div>
                  <p className="text-sm text-gray-500">Has Login PIN</p>
                  <p className="font-medium text-gray-900 mt-1">
                    <FaLock className="inline mr-1" />
                    PIN Set
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Performance (if available) */}
          {staff.performance && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Performance</h3>
              <div className="space-y-3">
                {staff.performance.totalCustomers !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Total Customers</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {staff.performance.totalCustomers || 0}
                    </p>
                  </div>
                )}
                {staff.performance.totalRevenue !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {formatCurrency(staff.performance.totalRevenue)}
                    </p>
                  </div>
                )}
                {staff.performance.rating !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {staff.performance.rating || 0} / 5.0
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffDetails
