import React, { useEffect, useState, useCallback } from 'react'
import apiClient from '../../../services/api/client'
import { endpoints } from '../../../constants/api/endpoints'
import { FaDownload, FaFileCsv, FaFilePdf, FaCalendarAlt, FaSpinner, FaChartLine, FaRupeeSign, FaUsers, FaMoneyBillWave } from 'react-icons/fa'

const PAGE_LIMIT = 20

const AdminReports = () => {
  const [reports, setReports] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(null)
  const [error, setError] = useState(null)

  const fetchReports = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.get(endpoints.reports.list, { params: { page: pageNum, limit: PAGE_LIMIT } })
      const payload = res.data
      const list = payload?.data || []
      setReports(list)
      const p = payload?.pagination?.pages || 1
      setTotalPages(p)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await apiClient.get(endpoints.reports.analytics)
      if (res.data.success) {
        setAnalytics(res.data.data)
      }
    } catch (e) {
      console.error('Failed to load analytics:', e)
    }
  }, [])

  useEffect(() => {
    fetchReports(page)
    fetchAnalytics()
  }, [page, fetchReports, fetchAnalytics])

  const exportReports = async (format = 'csv') => {
    try {
      setExporting(format)
      const res = await apiClient.get(endpoints.reports.export, {
        params: { format, scope: 'admin' },
        responseType: format === 'csv' ? 'blob' : 'arraybuffer'
      })
      const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `admin-reports-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to export reports')
    } finally {
      setExporting(null)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '—'
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const totalIncome = reports.reduce((sum, r) => sum + (r.totalIncome || 0), 0)
  const totalCustomers = reports.reduce((sum, r) => sum + (r.totalCustomers || 0), 0)
  const totalExpenses = reports.reduce((sum, r) => sum + (r.totalExpenses || 0), 0)
  const totalProfit = totalIncome - totalExpenses

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Business Reports</h1>
          <p className="text-sm text-gray-600">View and export daily business records</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportReports('csv')} 
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {exporting === 'csv' ? <FaSpinner className="animate-spin" /> : <FaFileCsv />}
            {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
          </button>
          <button 
            onClick={() => exportReports('pdf')}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {exporting === 'pdf' ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
            {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-700 font-medium mb-1">Total Income</p>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-700 font-medium mb-1">Net Profit</p>
          <p className="text-xl font-bold text-green-900">{formatCurrency(totalProfit)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <p className="text-xs text-purple-700 font-medium mb-1">Customers</p>
          <p className="text-xl font-bold text-purple-900">{totalCustomers}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
          <p className="text-xs text-orange-700 font-medium mb-1">Records</p>
          <p className="text-xl font-bold text-orange-900">{reports.length}</p>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

      {/* Reports Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FaCalendarAlt className="w-12 h-12 mb-3 text-gray-400" />
            <p className="text-lg font-medium">No reports found</p>
            <p className="text-sm">No daily business records have been created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Manager</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Customers</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Income</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Expenses</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Profit</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(r.date || r.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.manager?.username || r.manager?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.totalCustomers || 0}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">{formatCurrency(r.totalIncome)}</td>
                    <td className="px-4 py-3 text-red-600">{formatCurrency(r.totalExpenses)}</td>
                    <td className="px-4 py-3 text-blue-700 font-semibold">{formatCurrency(r.netProfit)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.isCompleted 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg p-4 border">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * PAGE_LIMIT + 1} to {Math.min(page * PAGE_LIMIT, reports.length)} of {reports.length} records
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReports