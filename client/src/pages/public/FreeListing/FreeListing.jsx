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

const FreeListing = () => {
  usePageTitle('Free Listing - Booking App')
  const navigate = useNavigate()
  const { sendOtp: sendOtpApi, verifyOtp: verifyOtpApi, createFreeListing: createFreeListingApi } = useFreeListing()
  const [step, setStep] = useState(1) // 1: Registration, 2: OTP Verification
  const [registrationData, setRegistrationData] = useState({
    companyName: '',
    mobileNumber: ''
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)
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
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    // Step 3: Business Details
    category: '',
    tags: '',
    services: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Auto-focus first OTP input when OTP step opens
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        document.getElementById('otp-0')?.focus()
      }, 100)
    }
  }, [step])

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

    try {
      setIsSubmitting(true)
      await sendOtpApi(cleanMobile, registrationData.companyName.trim())

      setStep(2)
      setCountdown(60) // 60 seconds countdown
      toast.success('OTP sent to your mobile number')
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value.replace(/[^0-9]/g, '')
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleOTPVerify = async (e) => {
    e.preventDefault()
    const otpValue = otp.join('')

    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    try {
      setIsVerifying(true)
      const cleanMobile = registrationData.mobileNumber.replace(/[^0-9]/g, '')
      await verifyOtpApi(cleanMobile, otpValue)

      toast.success('OTP verified successfully!')

      // Show listing form modal
      setShowListingForm(true)
      setStep(1) // Reset to step 1 for next time
      setOtp(['', '', '', '', '', ''])

      // Pre-fill form data
      setListingFormData(prev => ({
        ...prev,
        name: registrationData.companyName,
        phone: cleanMobile
      }))
    } catch (error) {
      toast.error(error.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    try {
      const cleanMobile = registrationData.mobileNumber.replace(/[^0-9]/g, '')
      await sendOtpApi(cleanMobile, registrationData.companyName.trim())

      toast.success('OTP resent to your mobile number')
      setOtp(['', '', '', '', '', ''])
      setCountdown(60)
      document.getElementById('otp-0')?.focus()
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP. Please try again.')
    }
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
      formDataToSubmit.append('fullName', registrationData.companyName.trim()) // Using company name as full name
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
      
      // Convert tags string to array
      if (listingFormData.tags) {
        const tagsArray = listingFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        tagsArray.forEach(tag => formDataToSubmit.append('tags', tag))
      }
      
      // Convert services string to array (split by newline)
      if (listingFormData.services) {
        const servicesArray = listingFormData.services.split('\n').map(service => service.trim()).filter(service => service)
        servicesArray.forEach(service => formDataToSubmit.append('services', service))
      }

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
        email: '',
        website: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        category: '',
        tags: '',
        services: ''
      })
      setUploadedDocuments([])
    } catch (error) {
      toast.error(error.message || 'Failed to create listing. Please try again.')
      setIsSubmittingForm(false)
    }
  }

  const businessTypes = [
    'Salon', 'Spa', 'Hotel', 'Restaurant', 'Retail', 'Gym',
    'Clinic', 'Cafe', 'Studio', 'Education', 'Automotive', 'Others'
  ]

  const categories = [
    'Beauty & Wellness', 'Food & Beverage', 'Healthcare',
    'Fitness', 'Retail', 'Education', 'Automotive', 'Others'
  ]

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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-4 bg-white border p-4">
              <div className="flex items-center justify-center gap-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step > 1 ? <FaCheckCircle /> : '1'}
                  </div>
                  <span className="text-sm">Registration</span>
                </div>
                <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step > 2 ? <FaCheckCircle /> : '2'}
                  </div>
                  <span className="text-sm">Verify OTP</span>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            {step === 1 && (
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
                      We'll send a 6-digit OTP to verify your number
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <span>Get Started</span>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500">
                    By continuing, you agree to our Terms & Conditions
                  </p>
                </form>
              </div>
            )}

            {/* OTP Verification Form */}
            {step === 2 && (
              <div className="bg-white border">
                <div className="p-6">
                  <div className="text-center mb-6">
                    <p className="text-gray-600 mb-1">
                      We've sent a 6-digit OTP to
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {registrationData.mobileNumber}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Please check your SMS inbox
                    </p>
                  </div>

                  <form onSubmit={handleOTPVerify} className="space-y-4">
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          onKeyDown={(e) => handleOTPKeyDown(index, e)}
                          className="w-12 h-12 text-center text-xl border focus:outline-none focus:border-primary-500"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying || otp.join('').length !== 6}
                      className="w-full px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isVerifying ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify & Continue</span>
                      )}
                    </button>

                    <div className="text-center space-y-2">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={countdown > 0}
                        className={`text-sm ${countdown > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-primary-600 hover:text-primary-700'
                          }`}
                      >
                        {countdown > 0 ? (
                          <span>Resend OTP in {countdown}s</span>
                        ) : (
                          <span>Didn't receive OTP? Resend</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStep(1)
                          setOtp(['', '', '', '', '', ''])
                          setCountdown(0)
                        }}
                        className="block w-full text-sm text-gray-600 hover:text-primary-600"
                      >
                        ← Change Mobile Number
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
      </div>

      {/* Free Listing Form Modal */}
      <Modal
        isOpen={showListingForm}
        onClose={() => {
          if (!isSubmittingForm) {
            setShowListingForm(false)
            setFormStep(1)
          }
        }}
        title="Complete Your Business Listing"
        size="lg"
        draggable={false}
        closeOnOverlayClick={!isSubmittingForm}
      >
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
                    {businessTypes.map(type => (
                      <option key={type} value={type.toLowerCase()}>{type}</option>
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
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={listingFormData.tags}
                    onChange={handleFormChange}
                    placeholder="e.g., premium, affordable (comma separated)"
                    className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Services (Optional)
                  </label>
                  <textarea
                    name="services"
                    value={listingFormData.services}
                    onChange={handleFormChange}
                    placeholder="List your main services (one per line)"
                    rows={4}
                    className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter one service per line</p>
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
                    <p className="text-gray-900">{listingFormData.category}</p>
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
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          navigate('/search', {
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
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
            <FaCheckCircle className="text-3xl text-green-600" />
          </div>

          {/* Success Message */}
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Listing Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Thank you for choosing our platform. Your business listing has been received.
          </p>

          {/* Simple Note */}
          <div className="bg-gray-50 border p-3 mb-4">
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

          {/* Action Button */}
          <button
            onClick={() => {
              setShowSuccessModal(false)
              navigate('/search', {
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
  )
}

export default FreeListing



