import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaCalendarAlt,
  FaSyncAlt,
  FaFilter
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'
import normalizeAppointment from '../../../../utils/appointment/normalizeAppointment'
import AppointmentCalendarView from '../../../../components/appointment/AppointmentCalendar/AppointmentCalendar'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
  { value: 'rescheduled', label: 'Rescheduled' }
]

const deriveStats = (appointments = []) => {
  if (!appointments.length) {
    return {
      total: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0
    }
  }

  const now = new Date()

  return appointments.reduce(
    (stats, appointment) => {
      const date = appointment.appointmentDateObj || new Date(appointment.appointmentDate)
      const status = (appointment.status || '').toLowerCase()

      stats.total += 1

      if (status === 'completed') {
        stats.completed += 1
      } else if (status === 'cancelled' || status === 'no_show') {
        stats.cancelled += 1
      } else if (date && date >= now) {
        stats.upcoming += 1
      }

      return stats
    },
    {
      total: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0
    }
  )
}

const AppointmentCalendar = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [calendarView, setCalendarView] = useState('month')

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const result = await managerService.getAppointments({
        limit: 500,
        sortBy: 'appointmentDate',
        sortOrder: 'asc'
      })

      if (result.success) {
        const rawAppointments = result.data?.data || result.data || []
        const normalized = rawAppointments.map(normalizeAppointment)
        setAppointments(normalized)
      } else {
        toast.error(result.error || 'Failed to load appointments')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const filteredAppointments = useMemo(() => {
    if (!statusFilter) return appointments
    return appointments.filter((appointment) => appointment.status === statusFilter)
  }, [appointments, statusFilter])

  const calendarAppointments = useMemo(
    () =>
      filteredAppointments.map((appointment) => ({
        ...appointment,
        id: appointment._id,
        appointmentDate: appointment.appointmentDateISO || appointment.appointmentDate,
        appointmentTime: appointment.startTime || appointment.appointmentTime,
        serviceName: appointment.serviceName,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        staffName: appointment.staffName,
        duration: appointment.duration || appointment.services?.[0]?.duration || 0
      })),
    [filteredAppointments]
  )

  const stats = useMemo(() => deriveStats(filteredAppointments), [filteredAppointments])

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date)
    setCalendarView('day')
  }, [])

  const handleAppointmentClick = useCallback(
    (appointment) => {
      if (!appointment || !appointment._id) return
      navigate(`/manager/appointments/${appointment._id}`)
    },
    [navigate]
  )

  const handleRefresh = useCallback(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaCalendarAlt className="text-primary-600" />
            Appointment Calendar
          </h1>
          <p className="text-gray-600 mt-1">
            Visualise all appointments by day, week, or month.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs uppercase text-gray-500">Total Appointments</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs uppercase text-blue-500">Upcoming</p>
          <p className="mt-1 text-2xl font-semibold text-blue-700">{stats.upcoming}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-xs uppercase text-green-500">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-green-700">{stats.completed}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-xs uppercase text-red-500">Cancelled / No Show</p>
          <p className="mt-1 text-2xl font-semibold text-red-700">{stats.cancelled}</p>
        </div>
      </div>

      {loading && appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-300 rounded-xl bg-white">
          <FaCalendarAlt className="text-primary-500 text-4xl mb-4 animate-pulse" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      ) : (
        <AppointmentCalendarView
          view={calendarView}
          appointments={calendarAppointments}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onAppointmentClick={handleAppointmentClick}
          className="border border-gray-200"
        />
      )}
    </div>
  )
}

export default AppointmentCalendar