import React, { useEffect, useState } from 'react'
import apiClient from '../../../services/api/client'
import { endpoints } from '../../../constants/api/endpoints'

const PAGE_LIMIT = 10

const AdminReports = () => {
  const [reports, setReports] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReports = async (pageNum = 1) => {
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
  }

  useEffect(() => {
    fetchReports(page)
  }, [page])

  const exportReports = async (format = 'csv') => {
    try {
      const res = await apiClient.get(endpoints.reports.export, {
        params: { format, scope: 'admin' },
        responseType: format === 'csv' ? 'blob' : 'arraybuffer'
      })
      const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reports.${format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to export reports')
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="flex gap-2">
          <button onClick={() => exportReports('csv')} className="px-3 py-2 bg-gray-800 text-white rounded-lg">Export CSV</button>
          <button onClick={() => exportReports('pdf')} className="px-3 py-2 bg-gray-700 text-white rounded-lg">Export PDF</button>
        </div>
      </div>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Manager</th>
              <th className="px-4 py-2 text-left">Total Income</th>
              <th className="px-4 py-2 text-left">Transactions</th>
            </tr>
          </thead>
          <tbody>
            {(loading ? [] : reports).map((r) => (
              <tr key={r._id} className="border-t">
                <td className="px-4 py-2">{new Date(r.date || r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">{r.manager?.username || '—'}</td>
                <td className="px-4 py-2">{r.totalIncome ?? '—'}</td>
                <td className="px-4 py-2">{Array.isArray(r.transactions) ? r.transactions.length : r.transactionsCount ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-3 text-sm text-gray-500">Loading…</div>}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 bg-gray-100 rounded disabled:opacity-50">Prev</button>
        <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 bg-gray-100 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  )
}

export default AdminReports