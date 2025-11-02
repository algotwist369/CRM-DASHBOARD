import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaClipboardList,
  FaTags,
  FaDollarSign,
  FaPercent,
  FaCreditCard,
  FaUserTag,
  FaStickyNote,
  FaStar,
  FaArrowLeft,
  FaSave,
  FaSpinner
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import managerService from '../../../../services/manager/managerService'

const AddTransaction = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [staffList, setStaffList] = useState([])
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
    staff: '',
    notes: '',
    rating: '',
  })
  const [errors, setErrors] = useState({})
  const [calculatedPrice, setCalculatedPrice] = useState(0)

  useEffect(() => {
    // Fetch staff list for dropdown
    const fetchStaff = async () => {
      try {
        const res = await managerService.getStaff({ limit: 100 })
        if (res.success) {
          setStaffList(res.data?.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch staff:', error)
      }
    }
    fetchStaff()
  }, [])

  useEffect(() => {
    // Calculate final price
    const base = parseFloat(formData.basePrice) || 0
    const discount = parseFloat(formData.discount) || 0
    const tax = parseFloat(formData.tax) || 0
    const final = base - discount + tax
    setCalculatedPrice(final)
  }, [formData.basePrice, formData.discount, formData.tax])

  const validateField = (name, value) => {
    let error = ''
    switch (name) {
      case 'customerName':
        if (!value.trim()) error = 'Customer name is required'
        break
      case 'serviceName':
        if (!value.trim()) error = 'Service name is required'
        break
      case 'basePrice':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          error = 'Base price must be a valid positive number'
        }
        break
      case 'discount':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = 'Discount must be a valid positive number'
        }
        break
      case 'tax':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = 'Tax must be a valid positive number'
        }
        break
      case 'rating':
        if (value && (isNaN(value) || parseFloat(value) < 1 || parseFloat(value) > 5)) {
          error = 'Rating must be between 1 and 5'
        }
        break
      case 'customerEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Enter a valid email address'
        }
        break
      case 'customerPhone':
        if (value && !/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) {
          error = 'Enter a valid 10-digit phone number'
        }
        break
      default:
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return !error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let processedValue = value

    if (name === 'customerPhone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10)
    } else if (name === 'basePrice' || name === 'discount' || name === 'tax' || name === 'rating') {
      processedValue = value === '' ? '' : parseFloat(value) || 0
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }))
    validateField(name, processedValue)
  }

  const validateForm = () => {
    const fields = ['customerName', 'serviceName', 'basePrice']
    let isValid = true
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false
      }
    })
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    try {
      const submitData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone || undefined,
        customerEmail: formData.customerEmail || undefined,
        serviceName: formData.serviceName.trim(),
        serviceType: formData.serviceType,
        serviceCategory: formData.serviceCategory || undefined,
        basePrice: parseFloat(formData.basePrice),
        discount: parseFloat(formData.discount) || 0,
        tax: parseFloat(formData.tax) || 0,
        paymentMethod: formData.paymentMethod,
        staff: formData.staff || undefined,
        notes: formData.notes || undefined,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
      }

      const res = await managerService.addTransaction(submitData)
      if (res.success) {
        toast.success('Transaction added successfully!')
        navigate('/manager/transactions')
      } else {
        toast.error(res.error || 'Failed to add transaction')
      }
    } catch (error) {
      toast.error('Failed to add transaction')
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Transaction</h1>
        <p className="text-gray-600 mt-1">Record a new transaction</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.customerName ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter customer name"
                  />
                </div>
                {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    maxLength={10}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter email (optional)"
                  />
                </div>
                {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaClipboardList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.serviceName ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="e.g., Haircut, Facial Treatment"
                  />
                </div>
                {errors.serviceName && <p className="text-red-500 text-xs mt-1">{errors.serviceName}</p>}
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="hair">Hair</option>
                    <option value="facial">Facial</option>
                    <option value="massage">Massage</option>
                    <option value="nail">Nail</option>
                    <option value="spa">Spa</option>
                    <option value="room">Room</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Service Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Category</label>
                <div className="relative">
                  <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Hair Cut, Facial Treatment"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.basePrice ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="0.00"
                  />
                </div>
                {errors.basePrice && <p className="text-red-500 text-xs mt-1">{errors.basePrice}</p>}
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (₹)</label>
                <div className="relative">
                  <FaPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.discount ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="0.00"
                  />
                </div>
                {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
              </div>

              {/* Tax */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax (₹)</label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.tax ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="0.00"
                  />
                </div>
                {errors.tax && <p className="text-red-500 text-xs mt-1">{errors.tax}</p>}
              </div>

              {/* Final Price (calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Final Price (₹)</label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                  <input
                    type="text"
                    value={calculatedPrice.toFixed(2)}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 border border-green-300 bg-green-50 rounded-lg font-semibold text-green-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Calculated automatically</p>
              </div>
            </div>
          </div>

          {/* Payment & Additional Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment & Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="wallet">Wallet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Staff */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
                <div className="relative">
                  <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="staff"
                    value={formData.staff}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="">Select staff (optional)</option>
                    {staffList.map((staff) => (
                      <option key={staff._id || staff.id} value={staff._id || staff.id}>
                        {staff.name} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="relative">
                  <FaStar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="1"
                    max="5"
                    step="0.1"
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.rating ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="1-5"
                  />
                </div>
                {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <div className="relative">
                <FaStickyNote className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add any additional notes (optional)"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Add Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTransaction
