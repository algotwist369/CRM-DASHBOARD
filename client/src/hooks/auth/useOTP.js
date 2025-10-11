import { useState, useEffect, useRef } from 'react'

export const useOTP = (length = 6, onComplete) => {
  const [otp, setOtp] = useState(Array(length).fill(''))
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < length - 1) {
      setActiveIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }

    // Check if OTP is complete
    if (newOtp.every(digit => digit !== '') && onComplete) {
      onComplete(newOtp.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        // Move to previous input
        setActiveIndex(index - 1)
        inputRefs.current[index - 1]?.focus()
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const pastedDigits = pastedData.replace(/\D/g, '').slice(0, length)
    
    if (pastedDigits.length > 0) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedDigits.length && i < length; i++) {
        newOtp[i] = pastedDigits[i]
      }
      setOtp(newOtp)
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedDigits.length, length - 1)
      setActiveIndex(nextIndex)
      inputRefs.current[nextIndex]?.focus()
      
      // Check if OTP is complete
      if (newOtp.every(digit => digit !== '') && onComplete) {
        onComplete(newOtp.join(''))
      }
    }
  }

  const clearOtp = () => {
    setOtp(Array(length).fill(''))
    setActiveIndex(0)
    inputRefs.current[0]?.focus()
  }

  const setInputRef = (index, ref) => {
    inputRefs.current[index] = ref
  }

  return {
    otp,
    activeIndex,
    handleChange,
    handleKeyDown,
    handlePaste,
    clearOtp,
    setInputRef,
    otpString: otp.join(''),
    isComplete: otp.every(digit => digit !== '')
  }
}

// OTP Verification Hook
export const useOTPVerification = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)

  const verifyOTP = async (otp, type = 'email') => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp, type })
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        setAttempts(0)
        return { success: true, data: result }
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        if (newAttempts >= 3) {
          setLocked(true)
          setError('Too many failed attempts. Please try again later.')
        } else {
          setError(result.message || 'Invalid OTP')
        }
        
        return { success: false, error: result.message }
      }
    } catch (error) {
      const errorMessage = 'OTP verification failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async (type = 'email') => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        return { success: true, message: 'OTP sent successfully' }
      } else {
        setError(result.message || 'Failed to resend OTP')
        return { success: false, error: result.message }
      }
    } catch (error) {
      const errorMessage = 'Failed to resend OTP'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const clearSuccess = () => {
    setSuccess(false)
  }

  const resetAttempts = () => {
    setAttempts(0)
    setLocked(false)
  }

  return {
    verifyOTP,
    resendOTP,
    loading,
    error,
    success,
    attempts,
    locked,
    clearError,
    clearSuccess,
    resetAttempts
  }
}

export default useOTP
