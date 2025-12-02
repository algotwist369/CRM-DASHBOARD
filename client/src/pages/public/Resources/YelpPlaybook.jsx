import React from 'react'
import { Link } from 'react-router-dom'
import { FaCheckCircle, FaChartLine, FaBullhorn, FaHeadset, FaRegLightbulb, FaComments, FaFileDownload } from 'react-icons/fa'
import { usePageTitle } from '../../../hooks/usePageTitle'

const YelpPlaybook = () => {
  usePageTitle('Yelp Playbook')

  const pillars = [
    {
      title: 'Capture Authentic Reviews',
      description:
        'Encourage happy customers to share their story shortly after their visit with compliant post-service follow ups.',
      bullets: [
        'Automate email and SMS sequences that respect Yelp cadence limits',
        'Provide simple copy customers can personalize before posting',
        'Prioritize offers that celebrate loyalty instead of offering incentives'
      ]
    },
    {
      title: 'Respond with Empathy and Speed',
      description:
        'Acknowledge praise, resolve issues, and show prospects you are listening by keeping responses timely and helpful.',
      bullets: [
        'Use templated replies as a starting point, then add personal details',
        'Respond publicly first, then invite upset customers to continue privately',
        'Assign ownership so no review waits longer than 24 hours'
      ]
    },
    {
      title: 'Optimize Your Yelp Profile',
      description:
        'Make the most of every profile element to turn browsers into bookings while reinforcing your brand voice.',
      bullets: [
        'Keep categories, services, and hours accurate across seasons',
        'Refresh photos quarterly to highlight top-performing services',
        'Use the “From the Business” section to feature your differentiators'
      ]
    }
  ]

  const checklist = [
    'Enable Booking App’s Yelp connector and confirm multi-location access',
    'Tag review requests by staff and service to monitor performance',
    'Schedule weekly review huddles to celebrate wins and coach responses',
    'Escalate policy violations with evidence using Booking App disputes workspace',
    'Measure rating trends and conversion impact inside the Reviews dashboard',
    'Promote 5-star reviews on your website and social feeds with social proof widgets'
  ]

  const resources = [
    {
      title: 'See Booking App in Action',
      description: 'Watch a walkthrough of real-time review monitoring, response routing, and analytics.',
      href: '/book-demo',
      icon: FaChartLine
    },
    {
      title: 'Compare Plans & Features',
      description: 'Find the reputation package that fits your locations, staff, and growth goals.',
      href: '/pricing',
      icon: FaBullhorn
    },
    {
      title: 'Talk With a Yelp Specialist',
      description: 'Get tailored guidance for your industry, including compliance best practices.',
      href: '/contact',
      icon: FaHeadset
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-white/10 rounded-full mb-4">
            Yelp Playbook
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Win Yelp With Authentic, Compliant Reputation Growth
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-8">
            A practical guide to capturing more 5-star feedback, responding with confidence, and turning Yelp browsers into loyal
            customers using Booking App’s review automation suite.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/book-demo"
              className="inline-flex items-center gap-2 px-6 py-3  bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors"
            >
              <FaRegLightbulb className="w-4 h-4" />
              Request a Strategy Session
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3  border border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <FaFileDownload className="w-4 h-4" />
              Download Pricing Guide
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">3 Pillars of a High-Performing Yelp Program</h2>
            <p className="text-lg text-gray-600">
              Follow these proven pillars to build trust, improve your ranking, and turn five-star experiences into lasting loyalty.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="bg-white border border-gray-200  p-6  hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{pillar.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{pillar.description}</p>
                <ul className="space-y-2">
                  {pillar.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm text-gray-700">
                      <FaCheckCircle className="mt-0.5 w-4 h-4 text-primary-500 flex-shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Weekly Execution Checklist</h2>
          <p className="text-lg text-gray-200 text-center mb-12">
            Operationalize your Yelp strategy with this actionable list. Share it with managers and front-line staff to keep everyone
            aligned.
          </p>
          <div className="bg-white/5 border border-white/10  p-8 sm:p-10">
            <ul className="space-y-4">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
                  <FaCheckCircle className="w-5 h-5 text-primary-300 mt-1 flex-shrink-0" />
                  <span className="text-gray-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Success Looks Like</h2>
            <p className="text-lg text-gray-600">
              Booking App customers who implement this playbook see significant gains across rating, review volume, and conversion.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Average Rating Lift', value: '+0.8★', description: 'within the first 60 days' },
              { label: 'Monthly Yelp Leads', value: '2.4x', description: 'increase in appointment requests' },
              { label: 'Response Time', value: '< 4 hrs', description: 'with automated alerts & routing' }
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 border border-gray-200  p-6 text-center ">
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">{stat.label}</div>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tools & Support</h2>
            <p className="text-lg text-gray-600">
              Put the playbook into practice with help from our team, templates, and automation features.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const Icon = resource.icon
              return (
                <Link
                  key={resource.title}
                  to={resource.href}
                  className="group bg-white border border-gray-200  p-6  hover:border-primary-200 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12  bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  <span className="text-primary-600 font-semibold text-sm">Learn more →</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary-600 text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to launch your Yelp playbook?</h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-8">
            Join thousands of service businesses using Booking App to protect their reputation and convert more customers from Yelp.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/book-demo"
              className="inline-flex items-center gap-2 px-6 py-3  bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors"
            >
              <FaChartLine className="w-4 h-4" />
              Book a Personalized Demo
            </Link>
            <Link
              to="/free-listing"
              className="inline-flex items-center gap-2 px-6 py-3  border border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <FaComments className="w-4 h-4" />
              Start Free Listing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default YelpPlaybook


