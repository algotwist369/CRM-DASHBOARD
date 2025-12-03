import React from 'react'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { FaCheck, FaRocket } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Pricing = () => {
  usePageTitle('Pricing - Booking App')

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for small businesses getting started',
      features: [
        'Up to 50 appointments/month',
        'Basic customer management',
        'Email support',
        'Mobile app access',
        'Basic reporting'
      ],
      popular: false,
      cta: 'Get Started Free'
    },
    {
      name: 'Professional',
      price: '$29',
      period: 'per month',
      description: 'Ideal for growing businesses',
      features: [
        'Unlimited appointments',
        'Advanced customer management',
        'Priority support',
        'Automated reminders',
        'Advanced analytics',
        'Payment integration',
        'Custom branding'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom integrations',
        'Advanced security',
        'Multi-location support',
        'API access',
        'Custom training'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto">
              Choose the perfect plan for your business
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 -mt-10 sm:-mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white  shadow-lg border-2 p-6 sm:p-8 relative ${
                plan.popular
                  ? 'border-primary-600 scale-105 sm:scale-110'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <FaRocket className="text-xs" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period !== 'forever' && plan.period !== 'pricing' && (
                    <span className="text-gray-600 text-lg">/{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <FaCheck className="text-primary-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.name === 'Enterprise' ? '/contact' : '/register'}
                className={`block w-full text-center px-6 py-3  font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white   border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h3>
              <p className="text-gray-600 text-sm">
                No setup fees for any plan. You only pay the monthly subscription fee.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, debit cards, and PayPal. Enterprise customers can pay via invoice.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing

