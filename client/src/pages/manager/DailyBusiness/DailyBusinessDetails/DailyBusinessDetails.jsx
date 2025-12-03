import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaDollarSign,
  FaUsers,
  FaStickyNote,
  FaCloudSun,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaUserTie,
  FaClipboardList,
  FaChartBar
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import managerService from '../../../../services/manager/managerService'

const DailyBusinessDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true)
        const res = await managerService.getDailyBusinessRecords({ limit: 1000 })
        if (res.success) {
          const records = res.data?.data || []
          const foundRecord = records.find(r => r._id === id || r.id === id)
          if (foundRecord) {
            setRecord(foundRecord)
          } else {
            toast.error('Daily business record not found')
            navigate('/manager/daily-business')
          }
        } else {
          toast.error('Failed to load daily business record')
          navigate('/manager/daily-business')
        }
      } catch (error) {
        toast.error('Failed to load daily business record')
        navigate('/manager/daily-business')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRecord()
    }
  }, [id, navigate])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this daily business record? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      const res = await managerService.deleteDailyBusiness(id)
      if (res.success) {
        toast.success('Daily business record deleted successfully')
        navigate('/manager/daily-business')
      } else {
        toast.error(res.error || 'Failed to delete record')
      }
    } catch (error) {
      toast.error('Failed to delete record')
    } finally {
      setDeleting(false)
    }
  }

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

  if (!record) {
    return null
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Business Record</h1>
            <p className="text-gray-600 mt-1">{formatDate(record.date)}</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/manager/daily-business/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
            >
              <FaEdit />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white  hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrash />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white   border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <FaDollarSign className="text-green-600 text-2xl" />
                <div>
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(record.totalIncome)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white   border border-gray-200 p-5">
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
            <div className="bg-white   border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <FaChartBar className="text-purple-600 text-2xl" />
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
          <div className="bg-white   border border-gray-200 p-6">
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
            <div className="bg-white   border border-gray-200 p-6">
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
            <div className="bg-white   border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h2>
              <div className="space-y-4">
                {record.staffPerformance.map((perf, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 ">
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
          <div className="bg-white   border border-gray-200 p-6">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white   border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Completion Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <FaCheckCircle className={record.isCompleted ? 'text-green-600' : 'text-yellow-600'} />
                  <span className={`font-medium ${
                    record.isCompleted ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {record.isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
              {record.completedAt && (
                <div>
                  <p className="text-sm text-gray-500">Completed At</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatDate(record.completedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Business Info */}
          {record.business && (
            <div className="bg-white   border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Business</h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{record.business.name}</p>
                {record.business.type && (
                  <p className="text-sm text-gray-500 capitalize">{record.business.type}</p>
                )}
                {record.business.branch && (
                  <p className="text-sm text-gray-500">{record.business.branch}</p>
                )}
              </div>
            </div>
          )}

          {/* Metrics */}
          {record.metrics && (
            <div className="bg-white   border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Metrics</h3>
              <div className="space-y-3">
                {record.metrics.walkInCustomers !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Walk-in Customers</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {record.metrics.walkInCustomers || 0}
                    </p>
                  </div>
                )}
                {record.metrics.appointmentCustomers !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Appointment Customers</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {record.metrics.appointmentCustomers || 0}
                    </p>
                  </div>
                )}
                {record.metrics.repeatCustomers !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Repeat Customers</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {record.metrics.repeatCustomers || 0}
                    </p>
                  </div>
                )}
                {record.metrics.newCustomers !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">New Customers</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {record.metrics.newCustomers || 0}
                    </p>
                  </div>
                )}
                {record.metrics.customerSatisfaction !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Customer Satisfaction</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {record.metrics.customerSatisfaction?.toFixed(1) || '0'} / 5.0
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

export default DailyBusinessDetails
