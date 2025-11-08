import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaClipboardCheck, FaHeadset, FaShieldAlt } from 'react-icons/fa'
import { usePageTitle } from '../../../hooks/usePageTitle'

const summaryPoints = [
  {
    icon: FaCalendarAlt,
    title: '30-Minute Strategy Call',
    description: 'See exactly how Booking App fits your workflows across scheduling, marketing, and analytics.'
  },
  {
    icon: FaClipboardCheck,
    title: 'Personalized Action Plan',
    description: 'We map your goals to an implementation timeline, integrations, and adoption steps.'
  },
  {
    icon: FaShieldAlt,
    title: 'Proof of Success',
    description: 'Walk through case studies and live dashboards from businesses like yours.'
  },
  {
    icon: FaHeadset,
    title: 'Dedicated Advisor',
    description: 'Meet your success partner who stays with you from onboarding to scale.'
  }
]

const initialFormState = {
  fullName: '',
  businessName: '',
  email: '',
  phone: '',
  teamSize: '',
  objective: 'scale-bookings',
  message: ''
}

const objectives = [
  { value: 'scale-bookings', label: 'Increase online bookings' },
  { value: 'streamline-ops', label: 'Streamline operations & staffing' },
  { value: 'grow-reviews', label: 'Grow reviews & reputation' },
  { value: 'all-in-one', label: 'All-in-one management' }
]

const heroHighlights = [
  'Live walkthrough tailored to your business',
  'Answers to pricing, onboarding, and ROI questions',
  'No obligation — we succeed when you do'
]

export const BookDemoForm = ({ mode = 'page', onComplete, initialData = {} }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const initialValues = useMemo(() => {
    const fromLocation =
      mode === 'page' && location.state && typeof location.state === 'object'
        ? location.state
        : {}
    return { ...initialFormState, ...initialData, ...fromLocation }
  }, [initialData, location.state, mode])

  const [formValues, setFormValues] = useState(initialValues)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const isSubmitDisabled = useMemo(() => {
    if (status === 'success') return true
    return (
      !formValues.fullName.trim() ||
      !formValues.email.trim() ||
      !formValues.businessName.trim()
    )
  }, [formValues, status])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    if (isSubmitDisabled) {
      setError('Please provide your name, business, and email so we can reach you.')
      return
    }
    setStatus('loading')

    setTimeout(() => {
      setStatus('success')
      if (mode === 'modal') {
        onComplete?.({ ...formValues })
      } else {
        navigate('/contact', {
          replace: false,
          state: { intent: 'book-demo', payload: formValues, message: 'BookDemoFormSubmitted' }
        })
      }
    }, 600)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Request your live walkthrough</h2>
      <p className="text-sm text-gray-600 mb-6">
        Share a few details and we’ll follow up within one business day.
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Alex Johnson"
              value={formValues.fullName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="businessName">
              Business name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              placeholder="Glow & Co. Salon"
              value={formValues.businessName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@business.com"
              value={formValues.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="phone">
              Phone / WhatsApp (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 98xxxxxx90"
              value={formValues.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="teamSize">
              Team size
            </label>
            <input
              id="teamSize"
              name="teamSize"
              type="text"
              placeholder="e.g. 10 staff across 2 branches"
              value={formValues.teamSize}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="objective">
              Primary objective
            </label>
            <select
              id="objective"
              name="objective"
              value={formValues.objective}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              {objectives.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="message">
            Anything else you'd like us to know?
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Share current tools, challenges, or timelines so we tailor the walkthrough."
            rows={4}
            value={formValues.message}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}
        {status === 'success' && mode === 'modal' && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            Thank you! Our team will reach out shortly to confirm your demo.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled || status === 'loading'}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-primary-300 transition-colors"
        >
          {status === 'loading' ? 'Booking your demo…' : 'Schedule my demo'}
        </button>
        <p className="text-xs text-gray-500 text-center">
          We respect your inbox. You’ll only hear from us about your booking.
        </p>
      </form>
    </div>
  )
}

const BookDemo = () => {
  usePageTitle('Book a Demo - Booking App')

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-primary-100 text-primary-700 rounded-full mb-4">
                Book a Demo
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Discover Booking App in <span className="text-primary-600">one focused session</span>
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                We’ll show you how modern salons, clinics, and service brands use Booking App to operate smarter, delight customers, and grow faster.
                Walk away with a clear game plan for your business — no pressure, no jargon.
              </p>
              <ul className="space-y-3 mb-8">
                {heroHighlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary-500"></span>
                    <span className="text-base text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <span>Prefer email?</span>
                <Link to="/contact" className="text-primary-600 font-semibold hover:text-primary-700">
                  Talk to our team
                </Link>
              </div>
            </div>

            <BookDemoForm mode="page" />
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryPoints.map((point) => {
              const Icon = point.icon
              return (
                <div key={point.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-full">
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
                  <p className="text-sm text-gray-200 flex-1">{point.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What happens after I book?</h2>
          <p className="text-lg text-gray-600 mb-10">
            We believe in clarity from the first conversation. Here’s how the process works once you submit the form.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                step: '01',
                title: 'Discovery call',
                description: 'We connect within one business day to confirm goals, current tools, and stakeholders.'
              },
              {
                step: '02',
                title: 'Custom demo',
                description: 'Our advisor walks you through Booking App tailored to your workflows and data.'
              },
              {
                step: '03',
                title: 'Next steps',
                description: 'Receive a proposal with pricing, onboarding plan, and ROI milestones if you’re ready.'
              }
            ].map((item) => (
              <div key={item.step} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold mb-4">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default BookDemo
