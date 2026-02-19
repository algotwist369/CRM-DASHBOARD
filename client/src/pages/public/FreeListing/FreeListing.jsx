import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaSpinner,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaFileUpload,
  FaFile,
  FaTimesCircle
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { Modal } from '../../../components'
import { useFreeListing } from '../../../hooks/public/useFreeListing'
import publicService from '../../../services/public/publicService'
import { AVAILABLE_BUSINESS_TYPES } from '../../../constants/business/businessTypes'

const FreeListing = () => {
  usePageTitle('Free Listing - Spa Advisor')
  const navigate = useNavigate()
  const { createFreeListing: createFreeListingApi } = useFreeListing()

  const [registrationData, setRegistrationData] = useState({
    companyName: '',
    mobileNumber: ''
  })

  // FORCE UPDATE LOG - CHECK FOR THIS
  useEffect(() => {
    console.log('🚀 [FreeListing] VERSION 2.0 - OTP REMOVED - INLINE FLOW ACTIVE')
  }, [])

  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await publicService.getBusinessCategories()
        if (result.success && result.data) {
          // Ensure we extract the array if it's wrapped in an object or just use data if it's the array
          const categoriesList = Array.isArray(result.data) ? result.data : (result.data.categories || [])
          setCategories(categoriesList)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        toast.error('Failed to load categories')
      }
    }
    fetchCategories()
  }, [])



  const [showListingForm, setShowListingForm] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState([])
  const [listingFormData, setListingFormData] = useState({
    // Step 1: Basic Information
    type: '',
    name: '',
    branch: '',
    description: '',
    // Step 2: Contact Details
    fullName: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    // Step 3: Business Details
    category: ''
  })
  const [formErrors, setFormErrors] = useState({})





  const handleRegistrationSubmit = async (e) => {
    e.preventDefault()

    if (!registrationData.companyName.trim()) {
      toast.error('Please enter company name')
      return
    }

    if (!registrationData.mobileNumber.trim()) {
      toast.error('Please enter mobile number')
      return
    }

    // Validate mobile number format
    const mobileRegex = /^[0-9]{10,15}$/
    const cleanMobile = registrationData.mobileNumber.replace(/[^0-9]/g, '')

    if (!mobileRegex.test(cleanMobile)) {
      toast.error('Please enter a valid mobile number (10-15 digits)')
      return
    }

    setListingFormData(prev => ({
      ...prev,
      name: registrationData.companyName
    }))
    setShowListingForm(true)
  }



  const validateFormStep = (step) => {
    const errors = {}

    if (step === 1) {
      if (!listingFormData.type) errors.type = 'Business type is required'
      if (!listingFormData.name || listingFormData.name.trim().length < 3) {
        errors.name = 'Business name must be at least 3 characters'
      }
    }

    if (step === 2) {
      if (!listingFormData.fullName || listingFormData.fullName.trim().length < 3) {
        errors.fullName = 'Full name must be at least 3 characters'
      }
      if (!listingFormData.email) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(listingFormData.email)) {
        errors.email = 'Invalid email format'
      }
      if (!listingFormData.address || listingFormData.address.trim().length < 10) {
        errors.address = 'Address must be at least 10 characters'
      }
      if (!listingFormData.city) errors.city = 'City is required'
      if (!listingFormData.state) errors.state = 'State is required'
      if (!listingFormData.zipCode) errors.zipCode = 'Zip code is required'
    }

    if (step === 3) {
      if (!listingFormData.category) errors.category = 'Category is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setListingFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleNextStep = () => {
    if (validateFormStep(formStep)) {
      setFormStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handlePrevStep = () => {
    setFormStep(prev => Math.max(prev - 1, 1))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }))
    setUploadedDocuments(prev => [...prev, ...newFiles])
  }

  const handleRemoveDocument = (id) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!validateFormStep(formStep)) {
      return
    }

    try {
      setIsSubmittingForm(true)

      // Prepare form data with files
      const formDataToSubmit = new FormData()
      const cleanMobile = registrationData.mobileNumber.replace(/[^0-9]/g, '')

      // Map frontend fields to backend model fields
      formDataToSubmit.append('phoneNumber', cleanMobile)
      formDataToSubmit.append('companyName', registrationData.companyName.trim())
      formDataToSubmit.append('fullName', listingFormData.fullName.trim())
      formDataToSubmit.append('businessName', listingFormData.name.trim())
      formDataToSubmit.append('businessType', listingFormData.type)
      formDataToSubmit.append('email', listingFormData.email.trim())
      formDataToSubmit.append('website', listingFormData.website || 'https://example.com') // Required field, provide default if empty
      formDataToSubmit.append('branch', listingFormData.branch || 'Main Branch') // Required field, provide default if empty
      formDataToSubmit.append('description', listingFormData.description || '') // Required field
      formDataToSubmit.append('address', listingFormData.address.trim())
      formDataToSubmit.append('city', listingFormData.city.trim())
      formDataToSubmit.append('state', listingFormData.state.trim())
      formDataToSubmit.append('country', listingFormData.country || 'India')
      formDataToSubmit.append('zipCode', listingFormData.zipCode.trim())
      formDataToSubmit.append('category', listingFormData.category)

      // Append documents
      uploadedDocuments.forEach((doc) => {
        formDataToSubmit.append('documents', doc.file)
      })

      await createFreeListingApi(formDataToSubmit)

      // Close form modal and show success modal
      setShowListingForm(false)
      setShowSuccessModal(true)
      setFormStep(1)
      setIsSubmittingForm(false)

      // Reset form data
      setListingFormData({
        type: '',
        name: '',
        branch: '',
        description: '',
        fullName: '',
        email: '',
        website: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        category: ''
      })
      setUploadedDocuments([])
    } catch (error) {
      toast.error(error.message || 'Failed to create listing. Please try again.')
      setIsSubmittingForm(false)
    }
  }





  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              List Your Business for Free
            </h1>
            <p className="text-gray-600 text-sm">
              Join thousands of businesses already using our platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {!showListingForm ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              {/* Progress Steps */}


              <div className="bg-white border">
                <form onSubmit={handleRegistrationSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Company / Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={registrationData.companyName}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter company name"
                      required
                      className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={registrationData.mobileNumber}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                      placeholder="Enter 10-digit mobile number"
                      required
                      className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      We'll guide you through the setup process
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={false}
                    className="w-full px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>Continue</span>
                  </button>
                  <p className="text-center text-xs text-gray-500">
                    By continuing, you agree to our Terms & Conditions
                  </p>
                </form>
              </div>
            </div>


            {/* Right Column - Benefits */}
            <div className="lg:col-span-1">
              <div className="bg-white border p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Why Choose Us?
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">100% Free Forever</h4>
                      <p className="text-xs text-gray-600">No hidden charges or fees</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Quick Setup</h4>
                      <p className="text-xs text-gray-600">Get started in minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Unlimited Bookings</h4>
                      <p className="text-xs text-gray-600">Accept unlimited appointments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">24/7 Support</h4>
                      <p className="text-xs text-gray-600">Always here to help</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Detailed Listing Form - Inline */
          <div className="max-w-3xl mx-auto bg-white border p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Business Listing</h2>
              <p className="text-gray-600">Please provide more details to help customers find you.</p>
            </div>


            <div className="space-y-4">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <React.Fragment key={step}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${formStep >= step
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                        }`}>
                        {formStep > step ? <FaCheckCircle /> : step}
                      </div>
                      <span className={`text-xs hidden sm:block ${formStep >= step ? 'text-primary-600' : 'text-gray-500'}`}>
                        {step === 1 && 'Basic'}
                        {step === 2 && 'Contact'}
                        {step === 3 && 'Details'}
                        {step === 4 && 'Review'}
                      </span>
                    </div>
                    {step < 4 && (
                      <div className={`flex-1 h-0.5 mx-2 ${formStep > step ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <form onSubmit={formStep === 4 ? handleFormSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
                {/* Step 1: Basic Information */}
                {formStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Basic Information
                    </h3>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Business Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={listingFormData.type}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2 border focus:outline-none focus:border-primary-500 ${formErrors.type ? 'border-red-500' : ''}`}
                        required
                      >
                        <option value="">Select business type</option>
                        {AVAILABLE_BUSINESS_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      {formErrors.type && <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={listingFormData.name}
                        onChange={handleFormChange}
                        placeholder="Enter your business name"
                        className={`w-full px-4 py-2 border focus:outline-none focus:border-primary-500 ${formErrors.name ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Branch (Optional)
                      </label>
                      <input
                        type="text"
                        name="branch"
                        value={listingFormData.branch}
                        onChange={handleFormChange}
                        placeholder="e.g., Main Branch"
                        className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={listingFormData.description}
                        onChange={handleFormChange}
                        placeholder="Describe your business..."
                        rows={4}
                        className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Details */}
                {formStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Contact Details
                    </h3>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={listingFormData.fullName}
                        onChange={handleFormChange}
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-2 border focus:outline-none focus:border-primary-500 ${formErrors.fullName ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={listingFormData.email}
                        onChange={handleFormChange}
                        placeholder="business@example.com"
                        className={`w-full px-4 py-2 border focus:outline-none focus:border-primary-500 ${formErrors.email ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Website (Optional)
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={listingFormData.website}
                        onChange={handleFormChange}
                        placeholder="https://www.example.com"
                        className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={listingFormData.address}
                        onChange={handleFormChange}
                        placeholder="Enter complete address"
                        rows={3}
                        className={`w-full px-4 py-2 border focus:outline-none focus:border-primary-500 ${formErrors.address ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={listingFormData.city}
                          onChange={handleFormChange}
                          placeholder="City"
                          className={`w-full px-4 py-2 border focus:outline-none focus:border-primary-500 ${formErrors.city ? 'border-red-500' : ''}`}
                          required
                        />
                        {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={listingFormData.state}
                          onChange={handleFormChange}
                          placeholder="State"
                          className={`w-full px-4 py-2 border focus:outline-none focus:border-primary-500 ${formErrors.state ? 'border-red-500' : ''}`}
                          required
                        />
                        {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Zip Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={listingFormData.zipCode}
                        onChange={handleFormChange}
                        placeholder="Zip Code"
                        className={`w-full px-4 py-2 border focus:outline-none focus:border-primary-500 ${formErrors.zipCode ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.zipCode && <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>}
                    </div>
                  </div>
                )}

                {/* Step 3: Business Details */}
                {formStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Business Details
                    </h3>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={listingFormData.category}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2 border focus:outline-none focus:border-primary-500 ${formErrors.category ? 'border-red-500' : ''}`}
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option
                            key={typeof cat === 'object' ? (cat._id || cat.id || cat.name) : cat}
                            value={typeof cat === 'object' ? (cat.name || cat._id) : cat}
                          >
                            {typeof cat === 'object' ? cat.name : cat}
                          </option>
                        ))}
                      </select>
                      {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                    </div>



                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Upload business documents eg. GST, PAN, Aadhar, etc. (Optional)
                      </label>
                      <div className="border border-dashed p-4 text-center">
                        <input
                          type="file"
                          id="document-upload"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="document-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <FaFileUpload className="text-2xl text-primary-600" />
                          <span className="text-sm text-gray-700">
                            Click to upload documents
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
                          </span>
                        </label>
                      </div>

                      {/* Uploaded Documents List */}
                      {uploadedDocuments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm text-gray-700">
                            Uploaded Documents ({uploadedDocuments.length})
                          </p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {uploadedDocuments.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between bg-gray-50 border p-2"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <FaFile className="text-primary-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 truncate">
                                      {doc.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(doc.size)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDocument(doc.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  aria-label="Remove document"
                                >
                                  <FaTimesCircle />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {formStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Review Your Information
                    </h3>

                    <div className="bg-gray-50 border p-4 space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Business Type:</span>
                        <p className="text-gray-900 capitalize">{listingFormData.type || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Business Name:</span>
                        <p className="text-gray-900">{listingFormData.name}</p>
                      </div>
                      {listingFormData.branch && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Branch:</span>
                          <p className="text-gray-900">{listingFormData.branch}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-600">Full Name:</span>
                        <p className="text-gray-900">{listingFormData.fullName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{listingFormData.email}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                        <p className="text-gray-900">{registrationData.mobileNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Address:</span>
                        <p className="text-gray-900">{listingFormData.address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">City:</span>
                          <p className="text-gray-900">{listingFormData.city}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">State:</span>
                          <p className="text-gray-900">{listingFormData.state}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Category:</span>
                        <p className="text-gray-900">
                          {typeof listingFormData.category === 'object'
                            ? (listingFormData.category.name || listingFormData.category)
                            : listingFormData.category}
                        </p>
                      </div>
                      {uploadedDocuments.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Documents:</span>
                          <p className="text-gray-900">{uploadedDocuments.length} file(s) uploaded</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-primary-50 border p-3">
                      <p className="text-sm text-gray-700">
                        <FaCheckCircle className="inline text-primary-600 mr-2" />
                        By submitting, you agree to our Terms & Conditions and Privacy Policy
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={formStep === 1 || isSubmittingForm}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaArrowLeft />
                    <span>Previous</span>
                  </button>

                  {formStep < 4 ? (
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white hover:bg-primary-700"
                    >
                      <span>Next</span>
                      <FaArrowRight />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmittingForm}
                      className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingForm ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Listing</span>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
            navigate('/spa', {
              state: {
                companyName: registrationData.companyName,
                mobileNumber: registrationData.mobileNumber
              }
            })
          }}
          title=""
          size="md"
          draggable={false}
          showCloseButton={false}
          closeOnOverlayClick={false}
        >
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
              <FaCheckCircle className="text-3xl text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Listing Submitted Successfully!
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Thank you for choosing our platform. Your business listing has been received.
            </p>
            <div className="bg-gray-50 border p-3 mb-4 text-left">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                What's Next?
              </h3>
              <p className="text-xs text-gray-700 mb-2">
                Our team will review your listing and connect with you within <span className="font-semibold text-primary-600">24 hours</span>.
              </p>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-primary-600 mt-0.5" />
                  <span>Verify your business details</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-primary-600 mt-0.5" />
                  <span>Complete your profile setup</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-primary-600 mt-0.5" />
                  <span>Activate your listing</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false)
                navigate('/spa', {
                  state: {
                    companyName: registrationData.companyName,
                    mobileNumber: registrationData.mobileNumber
                  }
                })
              }}
              className="w-full px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center gap-2"
            >
              <span>Continue to Dashboard</span>
              <FaArrowRight />
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default FreeListing




