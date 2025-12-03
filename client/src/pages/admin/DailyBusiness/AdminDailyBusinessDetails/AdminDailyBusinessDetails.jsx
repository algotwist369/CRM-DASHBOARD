import React, { useState, useEffect, useRef, memo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaRupeeSign,
  FaUsers,
  FaStickyNote,
  FaCloudSun,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaUserTie,
  FaBuilding
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import adminService from '../../../../services/admin/adminService'

// --- Helper Functions ---
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

// --- Sub-Components ---

const SummaryCards = memo(({ record }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <div className="bg-white  border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">Total Income</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(record.totalIncome)}
          </p>
        </div>
      </div>
    </div>
    <div className="bg-white  border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">Total Customers</p>
          <p className="text-lg font-bold text-gray-900">
            {record.totalCustomers || 0}
          </p>
        </div>
      </div>
    </div>
    <div className="bg-white  border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">Net Profit</p>
          <p className={`text-lg font-bold ${record.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
            {formatCurrency(record.netProfit)}
          </p>
        </div>
      </div>
    </div>
  </div>
))

const FinancialBreakdown = memo(({ record }) => (
  <div className="bg-white  border border-gray-200 p-4">
    <h2 className="text-sm font-semibold text-gray-800 mb-3">Financial Breakdown</h2>
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Total Income</span>
        <span className="font-semibold text-gray-900">
          {formatCurrency(record.totalIncome)}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Total Expenses</span>
        <span className="font-semibold text-red-600">
          {formatCurrency(record.totalExpenses)}
        </span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
        <span className="text-sm font-semibold text-gray-900">Net Profit</span>
        <span className={`text-sm font-bold ${record.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
          {formatCurrency(record.netProfit)}
        </span>
      </div>
    </div>
  </div>
))

const ServiceBreakdown = memo(({ services }) => {
  if (!services || services.length === 0) return null
  return (
    <div className="bg-white  border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Service Breakdown</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">Service</th>
              <th className="pb-2 font-medium text-center">Count</th>
              <th className="pb-2 font-medium text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={index} className="border-b border-gray-50 last:border-0">
                <td className="py-2 text-sm text-gray-900">
                  {service.serviceName || service.serviceType}
                </td>
                <td className="py-2 text-sm text-gray-600 text-center">{service.customerCount || 0}</td>
                <td className="py-2 text-sm text-gray-600 text-right">
                  {formatCurrency(service.totalRevenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

const StaffPerformance = memo(({ staffPerformance }) => {
  if (!staffPerformance || staffPerformance.length === 0) return null
  return (
    <div className="bg-white  border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Staff Performance</h2>
      <div className="space-y-2">
        {staffPerformance.map((perf, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 ">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                <FaUserTie />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {typeof perf.staff === 'object' ? perf.staff.name : 'Staff'}
                </p>
                <p className="text-xs text-gray-500">
                  {perf.customersServed || 0} served
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(perf.revenue)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

const AdditionalInfo = memo(({ record }) => (
  <div className="bg-white  border border-gray-200 p-4">
    <h2 className="text-sm font-semibold text-gray-800 mb-3">Additional Info</h2>
    <div className="space-y-3">
      {record.notes && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FaStickyNote className="text-gray-400 text-xs" />
            <span className="text-xs font-medium text-gray-500">Notes</span>
          </div>
          <p className="text-sm text-gray-700 pl-5">{record.notes}</p>
        </div>
      )}
      {record.weather && (
        <div className="flex items-center gap-2">
          <FaCloudSun className="text-gray-400 text-xs" />
          <span className="text-xs font-medium text-gray-500">Weather:</span>
          <span className="text-sm text-gray-700">{record.weather}</span>
        </div>
      )}
      {record.specialEvents && record.specialEvents.length > 0 && (
        <div>
          <span className="text-xs font-medium text-gray-500 block mb-1">Special Events:</span>
          <div className="flex flex-wrap gap-1">
            {record.specialEvents.map((event, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs border border-primary-100"
              >
                {event}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
))

const SidebarInfo = memo(({ record }) => (
  <div className="space-y-4">
    {/* Business Info */}
    {record.business && (
      <div className="bg-white  border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Business</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-gray-400 text-sm" />
            <p className="text-sm font-medium text-gray-900">{record.business.name}</p>
          </div>
          <div className="pl-6 text-xs text-gray-500 space-y-0.5">
            {record.business.type && <p className="capitalize">{record.business.type}</p>}
            {record.business.branch && <p>{record.business.branch}</p>}
          </div>
        </div>
      </div>
    )}

    {/* Manager Info */}
    {record.manager && (
      <div className="bg-white  border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Manager</h3>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <FaUserTie />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {typeof record.manager === 'object' ? record.manager.name : record.manager}
            </p>
            {typeof record.manager === 'object' && record.manager.username && (
              <p className="text-xs text-gray-500">@{record.manager.username}</p>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Status Card */}
    <div className="bg-white  border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Status</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${record.isCompleted ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
            <FaCheckCircle className="text-[10px]" />
            {record.isCompleted ? 'Completed' : 'Pending'}
          </span>
        </div>
        {record.completedAt && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Date</span>
            <span className="text-xs font-medium text-gray-900">{formatDate(record.completedAt)}</span>
          </div>
        )}
      </div>
    </div>

    {/* Metrics */}
    {record.metrics && (
      <div className="bg-white  border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Metrics</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-gray-50 rounded border border-gray-100">
            <p className="text-[10px] text-gray-500">Walk-in</p>
            <p className="text-sm font-semibold text-gray-900">{record.metrics.walkInCustomers || 0}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded border border-gray-100">
            <p className="text-[10px] text-gray-500">Appointment</p>
            <p className="text-sm font-semibold text-gray-900">{record.metrics.appointmentCustomers || 0}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded border border-gray-100">
            <p className="text-[10px] text-gray-500">New</p>
            <p className="text-sm font-semibold text-gray-900">{record.metrics.newCustomers || 0}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded border border-gray-100">
            <p className="text-[10px] text-gray-500">Repeat</p>
            <p className="text-sm font-semibold text-gray-900">{record.metrics.repeatCustomers || 0}</p>
          </div>
        </div>
      </div>
    )}
  </div>
))

// --- Main Component ---

const AdminDailyBusinessDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState(null)

  // Ref to prevent duplicate API calls
  const fetchingRef = useRef(false)

  useEffect(() => {
    const fetchRecord = async () => {
      // Prevent duplicate calls
      if (fetchingRef.current) return

      try {
        fetchingRef.current = true
        setLoading(true)
        const res = await adminService.getDailyBusinessRecords({ limit: 1000 })
        if (res.success) {
          const records = res.data?.data || []
          const foundRecord = records.find(r => r._id === id || r.id === id)
          if (foundRecord) {
            setRecord(foundRecord)
          } else {
            toast.error('Daily business record not found')
            navigate('/admin/daily-business')
          }
        } else {
          toast.error('Failed to load daily business record')
          navigate('/admin/daily-business')
        }
      } catch (error) {
        toast.error('Failed to load daily business record')
        navigate('/admin/daily-business')
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    }

    if (id) {
      fetchRecord()
    }
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    )
  }

  if (!record) {
    return null
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 mb-1 text-sm"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Daily Record</h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{formatDate(record.date)}</p>
          <p className="text-xs text-gray-500">ID: {record.id || record._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <FaRupeeSign className="text-green-600 text-2xl" />
                <div>
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(record.totalIncome)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <FaUsers className="text-blue-600 text-2xl" />
                <div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {record.totalCustomers || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <FaRupeeSign className="text-purple-600 text-2xl" />
                <div>
                  <p className="text-sm text-gray-500">Net Profit</p>
                  <p className={`text-2xl font-bold ${
                    record.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(record.netProfit)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Income</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(record.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Expenses</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(record.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Net Profit</span>
                <span className={`text-lg font-bold ${
                  record.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(record.netProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Service Breakdown */}
          {record.services && record.services.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-2">Service</th>
                      <th className="pb-2">Customers</th>
                      <th className="pb-2">Revenue</th>
                      <th className="pb-2">Avg. Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.services.map((service, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 font-medium text-gray-900">
                          {service.serviceName || service.serviceType}
                        </td>
                        <td className="py-3 text-gray-700">{service.customerCount || 0}</td>
                        <td className="py-3 text-gray-700">
                          {formatCurrency(service.totalRevenue)}
                        </td>
                        <td className="py-3 text-gray-700">
                          {formatCurrency(service.averagePrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Staff Performance */}
          {record.staffPerformance && record.staffPerformance.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h2>
              <div className="space-y-4">
                {record.staffPerformance.map((perf, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaUserTie className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {typeof perf.staff === 'object' ? perf.staff.name : 'Staff Member'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {perf.customersServed || 0} customers served
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(perf.revenue)}
                      </p>
                      {perf.commission > 0 && (
                        <p className="text-sm text-gray-500">
                          Commission: {formatCurrency(perf.commission)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              {record.notes && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaStickyNote className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Notes</span>
                  </div>
                  <p className="text-gray-900 pl-6">{record.notes}</p>
                </div>
              )}
              {record.weather && (
                <div className="flex items-center gap-3">
                  <FaCloudSun className="text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Weather: </span>
                    <span className="text-gray-900">{record.weather}</span>
                  </div>
                </div>
              )}
              {record.specialEvents && record.specialEvents.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Special Events: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {record.specialEvents.map((event, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <AdditionalInfo record={record} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <SidebarInfo record={record} />
        </div>
      </div>
    </div>
  )
}

export default AdminDailyBusinessDetails
