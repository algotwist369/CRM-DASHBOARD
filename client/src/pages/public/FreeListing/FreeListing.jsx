import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const FreeListing = () => {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    user_name: '',
    user_phone: '',
    business_name: '',
    user_email: '',
    business_category: '',
    number_of_outlets: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        user_phone: Number(formData.user_phone),
        number_of_outlets: Number(formData.number_of_outlets)
      }

      const response = await axios.post(`${process.env.VITE_API_BASE_URL}/freelistings`, payload)

      if (response.data.success) {
        toast.success(response.data.message || 'Freelisting created successfully')
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Error creating freelisting:', error)
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className='max-w-7xl mx-auto py-16 px-4 flex flex-col items-center justify-center text-center'>
        <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-2xl'>
          <div className='w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>Thank you for choosing our platform!</h2>
          <p className='text-gray-600 text-lg leading-relaxed'>
            Thank you for choosing our platform to list your business and partner with us.
            We appreciate your interest and trust in our services. Our team will carefully review your application and get in touch with you shortly.
          </p>
          <p className='text-gray-600 text-sm leading-relaxed mt-4'>
             If need any immediate assistance, please contact us at - <span className='text-yellow-900 underline cursor-pointer'>support@spaadvisor.in</span>
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className='mt-8 text-gray-500 hover:text-gray-700 font-medium underline transition'
          >
            Back to Home
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className='max-w-7xl mx-auto py-8 px-4'>
      <h1 className='text-2xl sm:text-3xl font-bold text-center'>Free Listing</h1>
      <p className='text-center text-gray-600'>Get your business listed for free!</p>

      <form
        onSubmit={handleSubmit}
        className='max-w-xl mx-auto mt-8 border border-gray-300 rounded-md p-4 sm:p-8'
      >

        {/* Name + Phone */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label className='block text-gray-700'>Name*</label>
            <input
              type='text'
              name='user_name'
              value={formData.user_name}
              onChange={handleChange}
              placeholder='Enter your name'
              className='w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-0'
              required
            />
          </div>

          <div>
            <label className='block text-gray-700'>Phone*</label>
            <input
              type='text'
              name='user_phone'
              value={formData.user_phone}
              onChange={handleChange}
              placeholder='+91 xxxxxxxxxx'
              className='w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-0'
              required
            />
          </div>
        </div>

        {/* Business + Email */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
          <div>
            <label className='block text-gray-700'>Business Name*</label>
            <input
              type='text'
              name='business_name'
              value={formData.business_name}
              onChange={handleChange}
              placeholder='Enter your business name'
              className='w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-0'
              required
            />
          </div>

          <div>
            <label className='block text-gray-700'>Email (Optional)</label>
            <input
              type='email'
              name='user_email'
              value={formData.user_email}
              onChange={handleChange}
              placeholder='Enter your email'
              className='w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-0'
            />
          </div>
        </div>

        {/* Category + Outlets */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>

          <div>
            <label className='block text-gray-700'>Business Category*</label>
            <select
              name='business_category'
              value={formData.business_category}
              onChange={handleChange}
              className='w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-0'
              required
            >
              <option value='' disabled>Select category</option>
              <option value='spa & wellness'>Spa & Wellness</option>
              <option value='salon'>Salon</option>
              <option value='beauty parlor'>Beauty Parlor</option>
              <option value='other'>Other</option>
            </select>
          </div>

          <div>
            <label className='block text-gray-700'>Number of outlets*</label>
            <input
              type='number'
              name='number_of_outlets'
              value={formData.number_of_outlets}
              onChange={handleChange}
              placeholder='Enter number of outlets'
              min='0'
              onInput={(e) => {
                if (e.target.value < 0) e.target.value = 0
              }}
              className='w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-0'
              required
            />
          </div>

        </div>

        {/* Message */}
        <div className='mt-4'>
          <label className='block text-gray-700'>Full Address*</label>
          <textarea
            name='message'
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            placeholder='Enter your message'
            className='w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-0'
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className='w-full bg-gray-600 hover:bg-gray-700 transition text-white p-2 rounded-md mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </section>
  )
}

export default FreeListing