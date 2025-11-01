import React, { useEffect, useState } from 'react'
import apiClient from '../../../services/api/client'
import { endpoints } from '../../../constants/api/endpoints'
import { useNavigate } from 'react-router-dom'

const AdminSettings = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await apiClient.get(endpoints.admin.dashboard)
        const data = res?.data?.data || res?.data
        setProfile(data?.admin || null)
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load admin profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-semibold mb-4">Admin Settings</h1>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="text-gray-800 font-medium">{profile?.name || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Company</div>
              <div className="text-gray-800 font-medium">{profile?.companyName || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-gray-800 font-medium">{profile?.email || '—'}</div>
            </div>
            <div className="pt-2 flex gap-2">
              <button onClick={() => navigate('/admin/businesses/create')} className="px-3 py-2 bg-gray-800 text-white rounded-lg">Create Business</button>
              <button onClick={() => navigate('/admin/managers/create')} className="px-3 py-2 bg-gray-700 text-white rounded-lg">Create Manager</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSettings