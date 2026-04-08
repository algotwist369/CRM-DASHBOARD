import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaArrowLeft, FaSpinner, FaCalendarAlt } from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Setup the localizer by providing the moment (or globalize, or Luxon) instance
const localizer = momentLocalizer(moment)

const AppointmentCalendar = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // month, week, day, agenda

  // Calculate start and end dates for the current view to fetch data
  const { startDate, endDate } = useMemo(() => {
    let start, end
    const date = moment(currentDate)

    if (view === 'month') {
      start = date.clone().startOf('month').subtract(7, 'days').toDate() // Buffer
      end = date.clone().endOf('month').add(7, 'days').toDate()
    } else if (view === 'week') {
      start = date.clone().startOf('week').toDate()
      end = date.clone().endOf('week').toDate()
    } else if (view === 'day') {
      start = date.clone().startOf('day').toDate()
      end = date.clone().endOf('day').toDate()
    } else {
      // Agenda - generic 30 day range or similar
      start = date.clone().subtract(15, 'days').toDate()
      end = date.clone().add(15, 'days').toDate()
    }

    return { startDate: start.toISOString(), endDate: end.toISOString() }
  }, [currentDate, view])

  const fetchAppointments = useCallback(async () => {
    if (!startDate || !endDate) return

    try {
      setLoading(true)
      const params = {
        startDate,
        endDate,
        limit: 1000 // Fetch reasonably large number for calendar
      }

      const result = await managerService.getAppointments(params)

      if (result.success) {
        // Backend returns: { success: true, data: appointments[], ... }
        // Service wraps it: { success: true, data: { success: true, data: appointments[], ... } }
        // So we need result.data.data
        const appointments = result.data?.data || []

        // Transform data for react-big-calendar
        const formattedEvents = appointments.map(appt => ({
          id: appt._id || appt.id,
          title: `${appt.customer?.firstName || 'Customer'} - ${appt.service?.name || 'Service'}`,
          start: new Date(appt.appointmentDate || appt.createdAt), // Ideally combine date + startTime
          end: new Date(new Date(appt.appointmentDate).getTime() + (appt.duration || 60) * 60000), // Approx end time if not stored
          resource: appt,
          status: appt.status
        }))

        // Enhance start/end times if stored separately as strings (common in some setups)
        // If your backend returns full ISO strings for start/end, the above map logic might need adjustment.
        // Assuming backend sends 'startTime' like "14:30"
        const enhancedEvents = appointments.map(appt => {
          let start = new Date(appt.appointmentDate)
          let end = new Date(appt.appointmentDate)

          if (appt.startTime) {
            const [hours, minutes] = appt.startTime.split(':')
            start.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          }

          if (appt.endTime) {
            const [hours, minutes] = appt.endTime.split(':')
            end.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          } else {
            // Default to duration or 1 hour
            end = new Date(start.getTime() + (appt.duration || 60) * 60000)
          }

          return {
            id: appt._id || appt.id,
            title: `${appt.customer?.firstName || 'Unknown'} ${appt.customer?.lastName || ''} - ${appt.service?.name || 'Service'}`,
            start,
            end,
            resource: appt,
            status: appt.status
          }
        })

        setEvents(enhancedEvents)
      } else {
        toast.error('Failed to load appointments')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error loading calendar')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleSelectEvent = useCallback((event) => {
    navigate(`/manager/appointments/${event.id}`)
  }, [navigate])

  const eventStyleGetter = useCallback((event) => {
    let backgroundColor = '#3174ad' // default blue

    switch (event.status) {
      case 'confirmed':
        backgroundColor = '#10B981' // green
        break
      case 'completed':
        backgroundColor = '#6B7280' // gray
        break
      case 'cancelled':
        backgroundColor = '#EF4444' // red
        break
      case 'no-show':
        backgroundColor = '#F59E0B' // orange
        break
      case 'pending':
        backgroundColor = '#3B82F6' // blue
        break
      default:
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }, [])

  return (
    <div className="p-2 sm:p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow p-2 sm:p-4 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/manager/appointments')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              title="Back to List"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaCalendarAlt className="text-primary-600" />
              Appointment Calendar
            </h1>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 self-end sm:self-auto">
              <FaSpinner className="animate-spin" />
              Loading...
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="flex-1 min-h-0">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            date={currentDate}
            onNavigate={date => setCurrentDate(date)}
            view={view}
            onView={v => setView(v)}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            popup
            tooltipAccessor={event => `${event.title} (${event.status})`}
            views={['month', 'week', 'day', 'agenda']}
          />
        </div>
      </div>
    </div>
  )
}

export default AppointmentCalendar