import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaClipboardList,
  FaTags,
  FaDollarSign,
  FaPercent,
  FaCreditCard,
  FaStickyNote,
  FaStar,
  FaSave,
  FaSpinner,
  FaRubleSign,
  FaRupeeSign
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import staffService from '../../../../services/staff/staffService'

const SERVICE_TYPES = [
  { value: 'hair', label: 'Hair' },
  { value: 'facial', label: 'Facial' },
  { value: 'massage', label: 'Massage' },
  { value: 'nail', label: 'Nail' },
  { value: 'spa', label: 'Spa' },
  { value: 'room', label: 'Room' },
  { value: 'food', label: 'Food' },
  { value: 'other', label: 'Other' }
]

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'other', label: 'Other' }
]

const AddStaffTransaction = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceName: '',
    serviceType: 'hair',
    serviceCategory: '',
    basePrice: '',
    discount: 0,
    tax: 0,
    paymentMethod: 'cash',
    notes: '',
    rating: ''
  })
  const [errors, setErrors] = useState({})
  const [finalPrice, setFinalPrice] = useState(0)

  useEffect(() => {
    const base = Number(formData.basePrice) || 0
    const discount = Number(formData.discount) || 0
    const tax = Number(formData.tax) || 0
    setFinalPrice(base - discount + tax)
  }, [formData.basePrice, formData.discount, formData.tax])

  const validateField = (name, value) => {
    let message = ''
    switch (name) {
      case 'customerName':
        if (!value.trim()) message = 'Customer name is required'
        break
      case 'serviceName':
        if (!value.trim()) message = 'Service name is required'
        break
      case 'basePrice': {
        const num = Number(value)
        if (!Number.isFinite(num) || num <= 0) message = 'Base price must be greater than zero'
        break
      }
      case 'discount':
      case 'tax': {
        const num = Number(value)
        if (value !== '' && (!Number.isFinite(num) || num < 0)) message = 'Value must not be negative'
        break
      }
      case 'rating': {
        const num = Number(value)
        if (value !== '' && (!Number.isFinite(num) || num < 1 || num > 5)) message = 'Rating must be between 1 and 5'
        break
      }
      case 'customerEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Enter a valid email address'
        break
      case 'customerPhone':
        if (value && !/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) message = 'Enter a valid 10-digit phone number'
        break
      default:
        break
    }
    setErrors((prev) => ({ ...prev, [name]: message }))
    return !message
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let processed = value

    if (name === 'customerPhone') {
      processed = value.replace(/\D/g, '').slice(0, 10)
    }

    if (['basePrice', 'discount', 'tax', 'rating'].includes(name)) {
      processed = value === '' ? '' : Number(value)
    }

    setFormData((prev) => ({ ...prev, [name]: processed }))
    validateField(name, processed)
  }

  const validateForm = () => {
    const fields = ['customerName', 'serviceName', 'basePrice']
    return fields.every((field) => validateField(field, formData[field]))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) {
      toast.error('Please correct the highlighted fields')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone || undefined,
        customerEmail: formData.customerEmail || undefined,
        serviceName: formData.serviceName.trim(),
        serviceType: formData.serviceType,
        serviceCategory: formData.serviceCategory || undefined,
        basePrice: Number(formData.basePrice),
        discount: Number(formData.discount) || 0,
        tax: Number(formData.tax) || 0,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes?.trim() || undefined,
        rating: formData.rating ? Number(formData.rating) : undefined
      }

      const result = await staffService.createTransaction(payload)
      if (result.success) {
        toast.success('Transaction added successfully')
        navigate('/staff/transactions')
      } else {
        toast.error(result.error || 'Failed to add transaction')
      }
    } catch (err) {
      console.error('Failed to add transaction', err)
      toast.error('Failed to add transaction')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
        >
          <FaArrowLeft />
          Back
        </button>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">Add Transaction</h1>
        <p className="text-sm text-gray-600 mt-1">Record a service you have completed.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                icon={FaUser}
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                error={errors.customerName}
                required
                placeholder="Enter customer name"
              />
              <InputField
                icon={FaPhone}
                label="Phone Number"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                error={errors.customerPhone}
                placeholder="10-digit phone"
              />
              <InputField
                icon={FaEnvelope}
                label="Email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                error={errors.customerEmail}
                placeholder="customer@example.com"
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                icon={FaClipboardList}
                label="Service Name"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                error={errors.serviceName}
                required
                placeholder="e.g., Haircut"
              />
              <SelectField
                icon={FaTags}
                label="Service Type"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                options={SERVICE_TYPES}
              />
              <InputField
                icon={FaTags}
                label="Service Category"
                name="serviceCategory"
                value={formData.serviceCategory}
                onChange={handleChange}
                placeholder="e.g., Classic Haircut"
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Payment</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <InputField
                icon={FaRupeeSign}
                label="Base Price (₹)"
                name="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={handleChange}
                error={errors.basePrice}
                required
              />
              <InputField
                icon={FaRupeeSign}
                label="Discount (₹)"
                name="discount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={handleChange}
                error={errors.discount}
              />
              <InputField
                icon={FaRupeeSign}
                label="Tax (₹)"
                name="tax"
                type="number"
                min="0"
                step="0.01"
                value={formData.tax}
                onChange={handleChange}
                error={errors.tax}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Final Amount (₹)</label>
                <div className="px-3 py-2 border border-green-300 bg-green-50 rounded-lg font-semibold text-green-700">
                  {finalPrice.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Calculated automatically</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <SelectField
                icon={FaCreditCard}
                label="Payment Method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                options={PAYMENT_METHODS}
              />
              <InputField
                icon={FaStar}
                label="Rating (1-5)"
                name="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
                error={errors.rating}
              />
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <div className="relative">
                  <FaStickyNote className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Optional notes"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => navigate('/staff/transactions')}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Transaction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const InputField = ({ icon: Icon, label, error, required, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        {...props}
        className={`w-full pl-10 pr-4 py-2 border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
        } rounded-lg focus:outline-none focus:ring-2`}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)

const SelectField = ({ icon: Icon, label, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <select
        {...props}
        className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
)

export default AddStaffTransaction
