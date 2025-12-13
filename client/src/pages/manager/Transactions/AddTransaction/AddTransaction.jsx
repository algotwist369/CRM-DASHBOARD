import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaClipboardList,
  FaTags,
  FaRupeeSign,
  FaPercent,
  FaCreditCard,
  FaUserTag,
  FaStickyNote,
  FaStar,
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaUnlock,
  FaWalking
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
    finalPrice: '',
    paymentMethod: 'cash',
    source: 'walk-in',
    staff: '',
    notes: '',
    rating: '',
  })
  const [errors, setErrors] = useState({})

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
    // Auto-Calculate final price when components change
    // This allows manual override, but resets if you touch the base numbers (Spreadsheet style)
    const base = parseFloat(formData.basePrice) || 0
    const discount = parseFloat(formData.discount) || 0
    const taxRate = parseFloat(formData.tax) || 0
    const taxAmount = base * (taxRate / 100)
    const final = base - discount + taxAmount

    setFormData(prev => ({ ...prev, finalPrice: final.toFixed(2) }))
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
          error = 'Base price must be positive'
        }
        break
      case 'finalPrice':
        if (!value || isNaN(value) || parseFloat(value) < 0) {
          error = 'Final price must be valid'
        }
        break
      case 'discount':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = 'Invalid discount'
        }
        break
      case 'tax':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = 'Invalid tax rate'
        }
        break
      case 'rating':
        if (value && (isNaN(value) || parseFloat(value) < 1 || parseFloat(value) > 5)) {
          error = '1-5'
        }
        break
      case 'customerEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email'
        }
        break
      case 'customerPhone':
        if (value && !/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) {
          error = 'Invalid phone'
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
    } else if (['basePrice', 'discount', 'tax', 'rating', 'finalPrice'].includes(name)) {
      // Allow empty string for backspacing, parse for calc
      processedValue = value
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }))
    validateField(name, processedValue)
  }

  const validateForm = () => {
    const fields = ['customerName', 'serviceName', 'basePrice', 'finalPrice']
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
      const basePrice = parseFloat(formData.basePrice) || 0
      const discount = parseFloat(formData.discount) || 0
      const taxRate = parseFloat(formData.tax) || 0
      const taxAmount = basePrice * (taxRate / 100) // Calculate Amount from Rate

      const submitData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone || undefined,
        customerEmail: formData.customerEmail || undefined,
        serviceName: formData.serviceName.trim(),
        serviceType: formData.serviceType,
        serviceCategory: formData.serviceCategory || undefined,
        basePrice: basePrice,
        discount: discount,
        tax: taxAmount, // Send Calculated Amount
        finalPrice: parseFloat(formData.finalPrice), // Send the manual/auto price
        paymentMethod: formData.paymentMethod,
        source: formData.source, // Send Source
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Transaction</h1>
        <p className="text-gray-600 text-sm mt-1">Record a new transaction manually</p>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Customer Details</h2>
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
                    className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.customerName ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter customer name"
                  />
                </div>
                {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    maxLength={10}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Link by phone..."
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
                    className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Link by email..."
                  />
                </div>
                {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Service Details</h2>
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
                    className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.serviceName ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Search or type service..."
                  />
                </div>
                {errors.serviceName && <p className="text-red-500 text-xs mt-1">{errors.serviceName}</p>}
              </div>

              {/* Service Type (Unlocked) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    list="service-types"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Select or Type..."
                  />
                  <datalist id="service-types">
                    <option value="hair">Hair</option>
                    <option value="facial">Facial</option>
                    <option value="massage">Massage</option>
                    <option value="nail">Nail</option>
                    <option value="spa">Spa</option>
                    <option value="food">Food</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </datalist>
                </div>
              </div>

              {/* Service Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Men's, Summer Special"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Financials</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.basePrice ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (₹)</label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Tax */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                <div className="relative">
                  <FaPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Final Price (Editable) */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1 flex justify-between">
                  <span>Final Price (₹)</span>
                  <span className="text-xs text-green-600 font-normal flex items-center gap-1">
                    <FaUnlock size={10} /> Editable
                  </span>
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-700" />
                  <input
                    type="number"
                    name="finalPrice"
                    value={formData.finalPrice}
                    onChange={handleChange}
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2 border-2 ${errors.finalPrice ? 'border-red-500' : 'border-green-400'} bg-green-50 rounded-md text-green-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500`}
                    placeholder="0.00"
                  />
                </div>
                {errors.finalPrice && <p className="text-red-500 text-xs mt-1">{errors.finalPrice}</p>}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Final Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Source (ADDED) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <div className="relative">
                  <FaWalking className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
                  >
                    <option value="walk-in">Walk-in</option>
                    <option value="online">Online</option>
                    <option value="phone">Phone</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="wallet">Wallet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Staff */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
                <div className="relative">
                  <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="staff"
                    value={formData.staff}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="1-5"
                  />
                </div>
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
                  rows={2}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Notes..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              <span>Save Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTransaction
