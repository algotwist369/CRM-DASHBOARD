import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FaArrowLeft,
  FaReceipt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaClipboardList,
  FaTags,
  FaRupeeSign,
  FaPercent,
  FaCreditCard,
  FaStickyNote,
  FaStar,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaTrash
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import staffService from '../../../../services/staff/staffService'

const formatCurrency = (amount) => {
  const numeric = Number(amount || 0)
  return `₹${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatDateTime = (value) => {
  if (!value) return { date: '—', time: '—' }
  const date = new Date(value)
  return {
    date: date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const StaffTransactionDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState(null)

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true)
      const result = await staffService.getTransactionById(id)
      if (result.success) {
        setTransaction(result.data?.data || null)
      } else {
        toast.error(result.error || 'Failed to load transaction')
        navigate('/staff/transactions')
      }
      setLoading(false)
    }

    fetchTransaction()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-16">
        <FaReceipt className="w-10 h-10 text-gray-300 animate-pulse" />
      </div>
    )
  }

  if (!transaction) {
    return null
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this transaction?')
    if (!confirmed) return

    const result = await staffService.deleteTransaction(id)
    if (result.success) {
      toast.success('Transaction deleted successfully')
      navigate('/staff/transactions')
    } else {
      toast.error(result.error || 'Failed to delete transaction')
    }
  }

  const { date, time } = formatDateTime(transaction.transactionDate)

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
        >
          <FaArrowLeft />
          Back
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
            <p className="text-sm text-gray-600">Recorded on {date} at {time}</p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <div className="bg-primary-50 border border-primary-100 text-primary-700 text-sm px-4 py-2 rounded-lg">
              Final Amount: <span className="font-semibold">{formatCurrency(transaction.finalPrice)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/staff/transactions/${id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600"
              >
                <FaEdit className="text-xs" />
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                <FaTrash className="text-xs" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoRow icon={FaUser} label="Name" value={transaction.customerName || '—'} />
            <InfoRow icon={FaPhone} label="Phone" value={transaction.customerPhone || '—'} />
            <InfoRow icon={FaEnvelope} label="Email" value={transaction.customerEmail || '—'} />
          </div>
        </section>

        <section className="space-y-4 mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoRow icon={FaClipboardList} label="Service" value={transaction.serviceName || '—'} />
            <InfoRow icon={FaTags} label="Type" value={transaction.serviceType || '—'} />
            <InfoRow icon={FaTags} label="Category" value={transaction.serviceCategory || '—'} />
          </div>
        </section>

        <section className="space-y-4 mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoRow icon={FaRupeeSign} label="Base Price" value={formatCurrency(transaction.basePrice)} />
            <InfoRow icon={FaPercent} label="Discount" value={formatCurrency(transaction.discount)} />
            <InfoRow icon={FaRupeeSign} label="Tax" value={formatCurrency(transaction.tax)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <InfoRow icon={FaCreditCard} label="Payment Method" value={transaction.paymentMethod || '—'} />
            <InfoRow icon={FaCreditCard} label="Payment Status" value={transaction.paymentStatus || 'completed'} />
            <InfoRow icon={FaStar} label="Rating" value={transaction.rating ? `${transaction.rating}/5` : '—'} />
          </div>
        </section>

        <section className="space-y-4 mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Timing & Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow icon={FaCalendarAlt} label="Transaction Date" value={date} />
            <InfoRow icon={FaClock} label="Transaction Time" value={time} />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <div className="mt-2 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap min-h-[80px]">
              {transaction.notes || 'No additional notes recorded.'}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
    <Icon className="text-gray-400" />
    <div>
      <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-1">{value}</p>
    </div>
  </div>
)

export default StaffTransactionDetails
