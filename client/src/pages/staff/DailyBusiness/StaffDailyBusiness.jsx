import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { HiOutlineCalendar, HiOutlineRefresh, HiOutlineClipboardList, HiOutlineLightningBolt, HiOutlineCurrencyRupee } from 'react-icons/hi'
import { FaUsers, FaStickyNote, FaCloudSun, FaCalendarDay } from 'react-icons/fa'
import staffService from '../../../services/staff/staffService'

const formatDateInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

const formatDateLabel = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatCurrency = (value) => {
  const amount = Number(value || 0)
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  })
}

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN')

const StaffDailyBusiness = () => {
  const today = formatDateInput(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [recentRecords, setRecentRecords] = useState([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [formData, setFormData] = useState({
    notes: '',
    weather: '',
    specialEvents: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const recordExists = useMemo(() => Boolean(summary?.dailyRecord?._id), [summary])

  const fetchSummary = useCallback(async (dateValue) => {
    if (!dateValue) return
    setSummaryLoading(true)
    const result = await staffService.getDailyBusinessSummary({ date: dateValue })
    if (result.success) {
      setSummary(result.data?.data || null)
    } else {
      setSummary(null)
      if (result.error) {
        toast.error(result.error)
      }
    }
    setSummaryLoading(false)
  }, [])

  const fetchRecentRecords = useCallback(async () => {
    setRecordsLoading(true)
    const result = await staffService.getDailyBusinessRecords({ page: 1, limit: 5 })
    if (result.success) {
      setRecentRecords(result.data?.data || [])
    } else {
      setRecentRecords([])
      if (result.error) {
        toast.error(result.error)
      }
    }
    setRecordsLoading(false)
  }, [])

  useEffect(() => {
    fetchSummary(selectedDate)
  }, [selectedDate, fetchSummary])

  useEffect(() => {
    fetchRecentRecords()
  }, [fetchRecentRecords])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedDate) {
      toast.error('Please select a valid date')
      return
    }

    if (recordExists) {
      toast.error('A daily business record already exists for this date')
      return
    }

    setSubmitting(true)
    const specialEventsArray = formData.specialEvents
      ? formData.specialEvents
          .split(/[\n,]+/)
          .map((item) => item.trim())
          .filter(Boolean)
      : []

    const payload = {
      date: selectedDate,
      notes: formData.notes?.trim() || undefined,
      weather: formData.weather?.trim() || undefined,
      specialEvents: specialEventsArray
    }

    const result = await staffService.createDailyBusiness(payload)

    if (result.success) {
      toast.success('Daily business record added successfully')
      setFormData({ notes: '', weather: '', specialEvents: '' })
      fetchSummary(selectedDate)
      fetchRecentRecords()
    } else if (result.error) {
      toast.error(result.error)
    }

    setSubmitting(false)
  }

  const totals = summary?.totals || { revenue: 0, customers: 0, transactions: 0 }
  const transactions = summary?.transactions || []

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Daily Business</h1>
          <p className="text-sm text-gray-600">
            Review daily performance metrics and submit the business summary for your branch
          </p>
        </div>
      </div>

      {/* Date & Summary Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
              <HiOutlineCalendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Selected Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDateLabel(selectedDate)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="date"
              max={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => fetchSummary(selectedDate)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={summaryLoading}
            >
              <HiOutlineRefresh className={`w-5 h-5 ${summaryLoading ? 'animate-spin' : ''}`} />
              Refresh Summary
            </button>
          </div>
        </div>

        {recordExists && (
          <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800">
            A daily business record already exists for {formatDateLabel(summary?.dailyRecord?.date)}.
            You can review the details below or choose a different date to create a new record.
          </div>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(totals.revenue)}
          icon={HiOutlineCurrencyRupee}
          iconBackground="bg-emerald-100"
          iconColor="text-emerald-600"
          loading={summaryLoading}
        />
        <SummaryCard
          title="Total Customers"
          value={formatNumber(totals.customers)}
          icon={FaUsers}
          iconBackground="bg-blue-100"
          iconColor="text-blue-600"
          loading={summaryLoading}
        />
        <SummaryCard
          title="Completed Transactions"
          value={formatNumber(totals.transactions)}
          icon={HiOutlineClipboardList}
          iconBackground="bg-purple-100"
          iconColor="text-purple-600"
          loading={summaryLoading}
        />
      </div>

      {/* Transactions Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
            <HiOutlineLightningBolt className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Transactions Overview</h2>
        </div>

        {summaryLoading ? (
          <div className="py-8 text-center text-gray-500 text-sm">Loading summary...</div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            No transactions recorded for {formatDateLabel(selectedDate)} yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Staff</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{transaction.customerName || 'Walk-in Customer'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{transaction.serviceName || 'Service'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{transaction.staff?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(transaction.finalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
            <FaStickyNote className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Add Daily Summary</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaCloudSun className="text-primary-500" />
                Weather Notes
              </label>
              <input
                type="text"
                value={formData.weather}
                onChange={(e) => handleInputChange('weather', e.target.value)}
                placeholder="e.g., Sunny with light showers"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarDay className="text-primary-500" />
                Special Events
              </label>
              <textarea
                rows={2}
                value={formData.specialEvents}
                onChange={(e) => handleInputChange('specialEvents', e.target.value)}
                placeholder="Separate events with commas or new lines"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any observations, challenges, or highlights from the day"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-500">
              Transactions and performance metrics are calculated automatically from recorded sales.
            </p>
            <button
              type="submit"
              disabled={submitting || summaryLoading || recordExists}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                submitting || summaryLoading || recordExists
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {submitting ? 'Saving...' : recordExists ? 'Record already exists' : 'Submit Daily Summary'}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Records */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
            <HiOutlineClipboardList className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Daily Records</h2>
        </div>

        {recordsLoading ? (
          <div className="py-8 text-center text-gray-500 text-sm">Loading recent records...</div>
        ) : recentRecords.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">No daily records submitted yet.</div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div key={record._id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">{formatDateLabel(record.date)}</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(record.totalIncome)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{formatNumber(record.totalCustomers)} customers</span>
                    <span>{formatNumber(record.services?.length || 0)} services</span>
                    {record.createdBy && (
                      <span className="text-gray-500">
                        Added by {record.createdBy.name || record.createdBy.username || 'Staff'}
                      </span>
                    )}
                  </div>
                </div>
                {record.notes && (
                  <p className="mt-3 text-sm text-gray-600">{record.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const SummaryCard = ({ title, value, icon: Icon, iconBackground, iconColor, loading }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBackground}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">
          {loading ? <span className="text-sm text-gray-400">Calculating...</span> : value}
        </p>
      </div>
    </div>
  </div>
)

export default StaffDailyBusiness
