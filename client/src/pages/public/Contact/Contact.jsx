import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaCheckCircle
} from 'react-icons/fa'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      // In a real app, you would send this to your backend
      // For now, we'll just simulate a submission
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Thank you for contacting us! We will get back to you soon.')
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })

      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Contact Us
            </h1>
            <p className="text-sm text-primary-100">
              We're here to help! Get in touch with our team
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Contact Information */}
          <div className="space-y-4">
            <div className="bg-white border p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1 text-sm">Email</h3>
                    <a href="mailto:dishaspaadvisor@gmail.com" className="text-primary-600 hover:underline text-sm">
                      dishaspaadvisor@gmail.com
                    </a>
                    <br />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <FaPhoneAlt className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1 text-sm">Phone</h3>
                    <a href="tel:+911234567890" className="text-gray-700 hover:text-primary-600 text-sm">
                      +91 9833365697
                    </a>
                    <br />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1 text-sm">Address</h3>
                    <p className="text-gray-700 text-sm">
                      9th Floor Office no-907, Bhumiraj Costarica, Plot No- 1& 2, Sector 18, Sanpada, Navi Mumbai, Maharashtra 400705<br />
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 hidden">
                  <div className="w-10 h-10 bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1 text-sm">Business Hours</h3>
                    <p className="text-gray-700 text-sm">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="bg-primary-50 p-4 border">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Need Immediate Help?</h3>
              <p className="text-gray-600 text-xs mb-3">
                Our support team is available 24/7 to assist you with any questions or issues.
              </p>
              <a
                href="mailto:dishaspaadvisor@gmail.com"
                className="inline-block w-full text-center px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 text-sm"
              >
                Contact Support
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Send us a Message</h2>

              {submitted ? (
                <div className="text-center py-8">
                  <FaCheckCircle className="mx-auto text-green-600 text-4xl mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 text-sm">
                    Thank you for contacting us. We'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                        placeholder="+91 9833365697"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                        placeholder="What is this regarding?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border focus:outline-none focus:border-primary-500"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-1 text-sm">How do I get started?</h3>
              <p className="text-gray-600 text-xs">
                Simply sign up for an account, create your business profile, and start accepting appointments.
                It takes just a few minutes to get started.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1 text-sm">Is there a free trial?</h3>
              <p className="text-gray-600 text-xs">
                Yes! We offer a free trial period so you can explore all features before committing to a plan.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1 text-sm">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-xs">
                We accept all major credit cards, debit cards, and online payment methods.
                Contact us for enterprise payment options.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1 text-sm">Can I customize the platform?</h3>
              <p className="text-gray-600 text-xs">
                Absolutely! Our platform is highly customizable to fit your business needs and branding requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact

