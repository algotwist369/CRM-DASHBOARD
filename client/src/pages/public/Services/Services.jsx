import React from 'react'
import {
  FaCalendarCheck,
  FaUsers,
  FaChartBar,
  FaBell,
  FaCreditCard,
  FaMobileAlt,
  FaLaptop,
  FaShieldAlt,
  FaClock,
  FaSync
} from 'react-icons/fa'

const Services = () => {
  const services = [
    {
      icon: <FaCalendarCheck className="text-4xl" />,
      title: "Appointment Management",
      description: "Complete appointment scheduling system with real-time availability, automated reminders, and easy rescheduling.",
      features: [
        "Online booking system",
        "Calendar integration",
        "Automated confirmations",
        "Waitlist management",
        "Multi-staff scheduling"
      ]
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: "Customer Relationship Management",
      description: "Comprehensive CRM to manage customer data, track interactions, and build lasting relationships.",
      features: [
        "Customer profiles and history",
        "Interaction tracking",
        "Customer segmentation",
        "Loyalty programs",
        "Feedback management"
      ]
    },
    {
      icon: <FaChartBar className="text-4xl" />,
      title: "Business Analytics",
      description: "Powerful analytics and reporting tools to understand your business performance and make data-driven decisions.",
      features: [
        "Revenue analytics",
        "Customer insights",
        "Performance metrics",
        "Custom reports",
        "Trend analysis"
      ]
    },
    {
      icon: <FaBell className="text-4xl" />,
      title: "Marketing & Notifications",
      description: "Engage with customers through targeted notifications, campaigns, and automated marketing messages.",
      features: [
        "Email notifications",
        "SMS alerts",
        "Marketing campaigns",
        "Customer targeting",
        "Automated reminders"
      ]
    },
    {
      icon: <FaCreditCard className="text-4xl" />,
      title: "Transaction Management",
      description: "Handle payments, transactions, and financial records seamlessly with integrated payment processing.",
      features: [
        "Payment tracking",
        "Invoice generation",
        "Revenue reporting",
        "Multi-payment methods",
        "Financial analytics"
      ]
    },
    {
      icon: <FaMobileAlt className="text-4xl" />,
      title: "Mobile Responsive",
      description: "Access your CRM from any device. Our platform works perfectly on desktop, tablet, and mobile devices.",
      features: [
        "Mobile-friendly interface",
        "Cross-platform support",
        "Responsive design",
        "Mobile app ready",
        "Touch-optimized"
      ]
    }
  ]

  const features = [
    {
      icon: <FaLaptop className="text-3xl" />,
      title: "Easy to Use",
      description: "Intuitive interface that requires minimal training"
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime"
    },
    {
      icon: <FaClock className="text-3xl" />,
      title: "Real-Time Updates",
      description: "Live data synchronization across all devices"
    },
    {
      icon: <FaSync className="text-3xl" />,
      title: "Scalable",
      description: "Grows with your business from startup to enterprise"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Services
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900">
            Practical tools for modern service teams
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to schedule work, stay in touch with clients, and understand how your business is performing—without the noise.
          </p>
        </div>
      </div>

      {/* Main Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white  border border-gray-200 p-6 hover:border-gray-300 hover: transition-colors"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-gray-400 mt-1 leading-none">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-900">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits for Your Business</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100  flex items-center justify-center flex-shrink-0 text-gray-800">
                    <FaChartBar className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Increase Revenue</h3>
                    <p className="text-gray-600">Optimize scheduling, reduce no-shows, and maximize business potential</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100  flex items-center justify-center flex-shrink-0 text-gray-800">
                    <FaUsers className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Improve Customer Experience</h3>
                    <p className="text-gray-600">Provide seamless booking experience that keeps customers coming back</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100  flex items-center justify-center flex-shrink-0 text-gray-800">
                    <FaClock className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Save Time</h3>
                    <p className="text-gray-600">Automate repetitive tasks and focus on what matters most</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100  flex items-center justify-center flex-shrink-0 text-gray-800">
                    <FaBell className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Better Communication</h3>
                    <p className="text-gray-600">Keep customers informed with automated reminders and updates</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white   border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Started Today</h3>
              <p className="text-gray-600 mb-6">
                Join thousands of businesses using our platform to manage appointments, customers, and grow their revenue.
              </p>
              <ul className="space-y-3 mb-6">
                {['Free trial available', 'No credit card required', 'Setup in minutes', '24/7 support'].map((point, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="text-gray-400">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/auth/login"
                className="inline-block w-full text-center px-6 py-3 bg-gray-900 text-white  hover:bg-gray-800 transition-colors font-medium"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Services

