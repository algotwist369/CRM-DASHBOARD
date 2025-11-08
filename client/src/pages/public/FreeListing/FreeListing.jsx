import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaPhone, 
  FaBuilding, 
  FaUsers, 
  FaChartLine, 
  FaShieldAlt,
  FaStar,
  FaClock,
  FaHeadset,
  FaLock,
  FaMobileAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaTag,
  FaList,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
  FaFileUpload,
  FaFile,
  FaCheck,
  FaTimesCircle
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { Modal } from '../../../components'

const FreeListing = () => {
  usePageTitle('Free Listing - Booking App')
  const navigate = useNavigate()
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
      // TODO: Replace with actual API call
      // await apiClient.post('/auth/send-otp', { mobileNumber: cleanMobile })
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setStep(2)
      setCountdown(60) // 60 seconds countdown
      toast.success('OTP sent to your mobile number')
    } catch {
      toast.error('Failed to send OTP. Please try again.')
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
      // TODO: Replace with actual API call
      // await apiClient.post('/auth/verify-otp', { mobileNumber: registrationData.mobileNumber, otp: otpValue })
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('OTP verified successfully!')
      
      // Show listing form modal
      setShowListingForm(true)
      setStep(1) // Reset to step 1 for next time
      setOtp(['', '', '', '', '', ''])
      
      // Pre-fill form data
      setListingFormData(prev => ({
        ...prev,
        name: registrationData.companyName,
        phone: registrationData.mobileNumber.replace(/[^0-9]/g, '')
      }))
    } catch {
      toast.error('Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    try {
      // TODO: Replace with actual API call
      // const cleanMobile = registrationData.mobileNumber.replace(/[^0-9]/g, '')
      // await apiClient.post('/auth/resend-otp', { mobileNumber: cleanMobile })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('OTP resent to your mobile number')
      setOtp(['', '', '', '', '', ''])
      setCountdown(60)
      document.getElementById('otp-0')?.focus()
    } catch {
      toast.error('Failed to resend OTP. Please try again.')
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
      Object.keys(listingFormData).forEach(key => {
        if (listingFormData[key]) {
          formDataToSubmit.append(key, listingFormData[key])
        }
      })
      formDataToSubmit.append('phone', registrationData.mobileNumber.replace(/[^0-9]/g, ''))
      
      // Append documents
      uploadedDocuments.forEach((doc) => {
        formDataToSubmit.append(`documents`, doc.file)
      })

      // TODO: Replace with actual API call
      // await apiClient.post('/business/free-listing', formDataToSubmit, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // })
      await new Promise(resolve => setTimeout(resolve, 2000))
      
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
    } catch {
      toast.error('Failed to create listing. Please try again.')
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
      {/* Hero Section with Stats */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-12">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold">100% FREE • NO CREDIT CARD REQUIRED</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              List Your Business for Free
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto mb-8 font-light">
              Join <span className="font-bold">50,000+</span> businesses already using our platform to grow their customer base
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl sm:text-4xl font-bold mb-2">50K+</div>
              <div className="text-sm sm:text-base text-primary-100">Active Businesses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl sm:text-4xl font-bold mb-2">2M+</div>
              <div className="text-sm sm:text-base text-primary-100">Monthly Bookings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl sm:text-4xl font-bold mb-2">4.8★</div>
              <div className="text-sm sm:text-base text-primary-100">Customer Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl sm:text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm sm:text-base text-primary-100">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 lg:-mt-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= 1 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/50' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > 1 ? <FaCheckCircle className="text-lg" /> : '1'}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:block ${step >= 1 ? 'text-primary-600' : 'text-gray-500'}`}>
                    Registration
                  </span>
                </div>
                <div className={`w-20 h-1 rounded-full transition-all ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= 2 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/50' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > 2 ? <FaCheckCircle className="text-lg" /> : '2'}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:block ${step >= 2 ? 'text-primary-600' : 'text-gray-500'}`}>
                    Verify OTP
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                {/* <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FaBuilding className="text-2xl" />
                    Business Registration
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">Get started in just 2 simple steps</p>
                </div> */}
                
                <form onSubmit={handleRegistrationSubmit} className="p-6 sm:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaBuilding className="inline mr-2 text-primary-600 text-lg" />
                      Company / Business Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={registrationData.companyName}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="e.g., ABC Services Pvt Ltd"
                        required
                        className="w-full px-4 py-3.5 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all"
                        autoFocus
                      />
                      <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaMobileAlt className="inline mr-2 text-primary-600 text-lg" />
                      Mobile Number
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={registrationData.mobileNumber}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                        placeholder="Enter 10-digit mobile number"
                        required
                        className="w-full px-4 py-3.5 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all"
                      />
                      <FaMobileAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="mt-2 flex items-start gap-2 text-xs text-gray-600">
                      <FaShieldAlt className="text-primary-600 mt-0.5 flex-shrink-0" />
                      <span>We'll send a 6-digit OTP to verify your number. Your data is secure with us.</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold text-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Get Started Now</span>
                          <FaCheckCircle />
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                      By continuing, you agree to our Terms & Conditions
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* OTP Verification Form */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                {/* <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FaShieldAlt className="text-2xl" />
                    Verify Mobile Number
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">Enter the OTP sent to your mobile</p>
                </div> */}

                <div className="p-6 sm:p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                      <FaPhone className="text-3xl text-primary-600" />
                    </div>
                    <p className="text-gray-600 mb-2 text-base">
                      We've sent a 6-digit OTP to
                    </p>
                    <p className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                      <FaMobileAlt className="text-primary-600" />
                      {registrationData.mobileNumber}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please check your SMS inbox
                    </p>
                  </div>

                  <form onSubmit={handleOTPVerify} className="space-y-6">
                    <div className="flex justify-center gap-3 sm:gap-4">
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
                          className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl sm:text-3xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                        />
                      ))}
                    </div>

                    <div className="space-y-4 pt-2">
                      <button
                        type="submit"
                        disabled={isVerifying || otp.join('').length !== 6}
                        className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold text-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                      >
                        {isVerifying ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>Verifying OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify & Continue</span>
                            <FaCheckCircle />
                          </>
                        )}
                      </button>
                      
                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={countdown > 0}
                          className={`text-sm font-semibold transition-colors flex items-center justify-center gap-2 mx-auto ${
                            countdown > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-primary-600 hover:text-primary-700'
                          }`}
                        >
                          <FaEnvelope className={countdown > 0 ? 'opacity-50' : ''} />
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
                          className="block w-full text-sm text-gray-600 hover:text-primary-600 font-medium py-2 transition-colors"
                        >
                          ← Change Mobile Number
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Benefits & Trust */}
          <div className="lg:col-span-1 space-y-6">

            {/* Why Choose Us */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                Why Choose Us?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="text-primary-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">100% Free Forever</h4>
                    <p className="text-sm text-gray-600">No hidden charges, no credit card required</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-primary-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Quick Setup</h4>
                    <p className="text-sm text-gray-600">Get started in under 5 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaChartLine className="text-primary-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Unlimited Bookings</h4>
                    <p className="text-sm text-gray-600">Accept unlimited appointments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaHeadset className="text-primary-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">24/7 Support</h4>
                    <p className="text-sm text-gray-600">Dedicated support team always ready</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-lg border border-primary-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaLock className="text-primary-600" />
                Secure & Trusted
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FaShieldAlt className="text-primary-600 flex-shrink-0" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FaUsers className="text-primary-600 flex-shrink-0" />
                  <span>50,000+ Verified Businesses</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FaStar className="text-yellow-500 flex-shrink-0" />
                  <span>4.8/5 Customer Rating</span>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm" />
                ))}
              </div>
              <p className="text-gray-700 text-sm mb-4 italic">
                "Listing our business was super easy and free! We got our first booking within 24 hours. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  R
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Rajesh Kumar</div>
                  <div className="text-xs text-gray-500">Business Owner, Mumbai</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 sm:p-12 text-center text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Grow Your Business?
            </h3>
            <p className="text-lg text-primary-100 mb-6 max-w-2xl mx-auto">
              Join thousands of successful businesses already using our platform
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <FaCheckCircle />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <FaCheckCircle />
                <span>No Monthly Charges</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <FaCheckCircle />
                <span>Cancel Anytime</span>
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
        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    formStep >= step
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {formStep > step ? <FaCheckCircle /> : step}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className={`text-xs font-semibold ${formStep >= step ? 'text-primary-600' : 'text-gray-500'}`}>
                      {step === 1 && 'Basic Info'}
                      {step === 2 && 'Contact'}
                      {step === 3 && 'Details'}
                      {step === 4 && 'Review'}
                    </div>
                  </div>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    formStep > step ? 'bg-primary-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={formStep === 4 ? handleFormSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
            {/* Step 1: Basic Information */}
            {formStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaBuilding className="text-primary-600" />
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={listingFormData.type}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={listingFormData.name}
                      onChange={handleFormChange}
                      placeholder="Enter your business name"
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch (Optional)
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={listingFormData.branch}
                    onChange={handleFormChange}
                    placeholder="e.g., Main Branch, Downtown Branch"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={listingFormData.description}
                    onChange={handleFormChange}
                    placeholder="Describe your business..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {formStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaPhone className="text-primary-600" />
                  Contact Details
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={listingFormData.email}
                      onChange={handleFormChange}
                      placeholder="business@example.com"
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="website"
                      value={listingFormData.website}
                      onChange={handleFormChange}
                      placeholder="https://www.example.com"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      name="address"
                      value={listingFormData.address}
                      onChange={handleFormChange}
                      placeholder="Enter complete address"
                      rows={3}
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <FaMapMarkerAlt className="absolute left-4 top-3 text-gray-400" />
                  </div>
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={listingFormData.city}
                      onChange={handleFormChange}
                      placeholder="City"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={listingFormData.state}
                      onChange={handleFormChange}
                      placeholder="State"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formErrors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={listingFormData.zipCode}
                    onChange={handleFormChange}
                    placeholder="Zip Code"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.zipCode && <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Business Details */}
            {formStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaTag className="text-primary-600" />
                  Business Details
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={listingFormData.category}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={listingFormData.tags}
                    onChange={handleFormChange}
                    placeholder="e.g., premium, affordable, eco-friendly (comma separated)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Services (Optional)
                  </label>
                  <textarea
                    name="services"
                    value={listingFormData.services}
                    onChange={handleFormChange}
                    placeholder="List your main services (one per line)"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter one service per line</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
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
                      <FaFileUpload className="text-4xl text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Click to upload documents
                      </span>
                      <span className="text-xs text-gray-500">
                        PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
                      </span>
                    </label>
                  </div>

                  {/* Uploaded Documents List */}
                  {uploadedDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        Uploaded Documents ({uploadedDocuments.length})
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {uploadedDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FaFile className="text-primary-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
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
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
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
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaCheckCircle className="text-primary-600" />
                  Review Your Information
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Business Type:</span>
                    <p className="text-gray-900 capitalize">{listingFormData.type || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Business Name:</span>
                    <p className="text-gray-900">{listingFormData.name}</p>
                  </div>
                  {listingFormData.branch && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Branch:</span>
                      <p className="text-gray-900">{listingFormData.branch}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Email:</span>
                    <p className="text-gray-900">{listingFormData.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Phone:</span>
                    <p className="text-gray-900">{registrationData.mobileNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Address:</span>
                    <p className="text-gray-900">{listingFormData.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-600">City:</span>
                      <p className="text-gray-900">{listingFormData.city}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600">State:</span>
                      <p className="text-gray-900">{listingFormData.state}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Category:</span>
                    <p className="text-gray-900">{listingFormData.category}</p>
                  </div>
                  {uploadedDocuments.length > 0 && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Documents:</span>
                      <p className="text-gray-900">{uploadedDocuments.length} file(s) uploaded</p>
                    </div>
                  )}
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <FaCheckCircle className="inline text-primary-600 mr-2" />
                    By submitting, you agree to our Terms & Conditions and Privacy Policy
                  </p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={formStep === 1 || isSubmittingForm}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaArrowLeft />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {formStep < 4 ? (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <span>Next</span>
                    <FaArrowRight />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmittingForm}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {isSubmittingForm ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Listing</span>
                        <FaCheckCircle />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          navigate('/register', { 
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
        <div className="text-center py-6">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <FaCheckCircle className="text-5xl text-green-600" />
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Listing Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for choosing our platform. Your business listing has been received.
          </p>

          {/* Professional Note */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <FaHeadset className="text-white text-xl" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What's Next?
                </h3>
                <p className="text-gray-700 mb-3">
                  Our dedicated team will review your listing and connect with you within <span className="font-bold text-primary-600">24 hours</span> to:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Verify your business details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Complete your profile setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Activate your listing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Need immediate assistance?
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-primary-600">
                <FaPhone />
                <span className="font-semibold">+91-XXXXX-XXXXX</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2 text-primary-600">
                <FaEnvelope />
                <span className="font-semibold">support@bookingapp.com</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setShowSuccessModal(false)
              navigate('/register', { 
                state: { 
                  companyName: registrationData.companyName, 
                  mobileNumber: registrationData.mobileNumber 
                } 
              })
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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

