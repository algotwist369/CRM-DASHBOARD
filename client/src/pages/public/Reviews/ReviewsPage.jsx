import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaGoogle,
  FaFacebook,
  FaYelp,
  FaTripadvisor,
  FaStar,
  FaShieldAlt,
  FaChartLine,
  FaReply,
  FaUsers,
  FaHeadset,
  FaRocket,
  FaBullhorn,
  FaClipboardCheck,
  FaComments,
  FaCheckCircle
} from 'react-icons/fa'
import { usePageTitle } from '../../../hooks/usePageTitle'

const REVIEW_PAGES = {
  'google-my-business-reviews': {
    badge: 'Local SEO',
    title: 'Google My Business Reviews',
    subtitle: 'Own the first impression on Google Search & Maps',
    description:
      'Boost your star rating, surface authentic customer stories, and climb local pack rankings with automated review capture, response templates, and performance insights.',
    primaryCta: { label: 'Start Free Listing', href: '/free-listing' },
    secondaryCta: { label: 'Talk to an Expert', href: '/contact' },
    stats: [
      { label: 'Average rating lift', value: '+1.2★', subtext: 'within 60 days of onboarding' },
      { label: 'Listing views', value: '3.5x', subtext: 'more discovery searches' },
      { label: 'Response time', value: '<6 hrs', subtext: 'with automated alerts' }
    ],
    featureCards: [
      {
        icon: FaGoogle,
        title: 'Instant Google Sync',
        description: 'Connect your Business Profile in seconds and sync reviews, photos, and Q&A in real time.'
      },
      {
        icon: FaReply,
        title: 'Smart Reply Templates',
        description: 'AI-assisted responses tailored to each review help you engage quicker without sounding generic.'
      },
      {
        icon: FaChartLine,
        title: 'Keyword Insights',
        description: 'Surface trending keywords customers use so you can refine services and boost local SEO.'
      },
      {
        icon: FaShieldAlt,
        title: 'Flag Sensitive Feedback',
        description: 'Identify policy-violating or spam reviews and submit takedown requests right from the dashboard.'
      }
    ],
    steps: [
      { title: 'Connect your Google profile', description: 'Secure OAuth connection keeps reviews syncing in real time.' },
      { title: 'Launch automated requests', description: 'Send SMS and WhatsApp review invites after every completed appointment.' },
      { title: 'Monitor & respond centrally', description: 'Reply with branded templates and escalate issues to your team instantly.' },
      { title: 'Track growth', description: 'Watch your rating climb with attribution-ready analytics and weekly reports.' }
    ],
    resources: [
      {
        label: 'Local Search Feature Tour',
        description: 'See how Booking App manages reviews, photos, and keywords that influence Google rankings.',
        href: '/features'
      },
      {
        label: 'Consult with a Local SEO Expert',
        description: 'Get a personalized plan to improve your Business Profile visibility and conversions.',
        href: '/contact'
      }
    ],
    faqs: [
      {
        question: 'Will connecting Booking App overwrite my existing Google reviews?',
        answer: 'Never. We only read data from your Business Profile and post responses you explicitly approve.'
      },
      {
        question: 'Can I automate review requests after every appointment?',
        answer:
          'Yes. Enable smart triggers to send branded SMS, WhatsApp, or email invites once an appointment is completed or paid.'
      },
      {
        question: 'Do you support multiple locations?',
        answer: 'Multi-location businesses can manage all locations in a single dashboard with role-based access controls.'
      }
    ]
  },
  'facebook-reviews': {
    badge: 'Social Proof',
    title: 'Facebook Reviews & Recommendations',
    subtitle: 'Turn every happy client into a shareable story',
    description:
      'Capture recommendations straight from Messenger, respond with personality, and turn positive feedback into boosted campaigns across Facebook and Instagram.',
    primaryCta: { label: 'Connect Facebook Page', href: '/contact' },
    secondaryCta: { label: 'See Customer Stories', href: '/features' },
    stats: [
      { label: 'Recommendation volume', value: '4x', subtext: 'more reviews via Messenger prompts' },
      { label: 'Organic reach', value: '+62%', subtext: 'average lift from shared testimonials' },
      { label: 'Ad ROI', value: '2.1x', subtext: 'increase using social proof creatives' }
    ],
    featureCards: [
      {
        icon: FaFacebook,
        title: 'Messenger Review Flows',
        description: 'Collect recommendations in a conversational flow without forcing customers to leave Facebook.'
      },
      {
        icon: FaBullhorn,
        title: 'Auto-Publish Highlights',
        description: 'Curate your best quotes and auto-publish them as posts or story templates in a click.'
      },
      {
        icon: FaUsers,
        title: 'Team Collaboration',
        description: 'Assign responses, share drafts, and keep tone consistent across all community managers.'
      },
      {
        icon: FaHeadset,
        title: 'Escalation Workflows',
        description: 'Escalate sensitive feedback to support with context, tags, and internal notes.'
      }
    ],
    steps: [
      { title: 'Authorize your Page', description: 'Securely link your Facebook Page to sync reviews and permissions.' },
      { title: 'Launch Messenger asks', description: 'Trigger review requests when clients finish a visit or redeem an offer.' },
      { title: 'Promote top stories', description: 'Auto-generate social posts and ad-ready creatives from rave reviews.' },
      { title: 'Measure sentiment', description: 'Benchmark response time, sentiment trends, and campaign impact.' }
    ],
    resources: [
      {
        label: 'Social Campaign Templates',
        description: 'Explore built-in assets that let you publish Facebook-ready review highlights instantly.',
        href: '/how-it-works'
      },
      {
        label: 'Talk to our Social Team',
        description: 'Book a strategy call to learn how Booking App powers Facebook & Instagram growth.',
        href: '/contact'
      }
    ],
    faqs: [
      {
        question: 'Does Booking App post on Facebook automatically?',
        answer:
          'Only if you schedule it. You always approve content before it goes live, and you can customize every post or story.'
      },
      {
        question: 'Can I separate admin and responder roles?',
        answer:
          'Yes. Role-based permissions let owners approve responses while community managers draft replies and tag issues.'
      },
      {
        question: 'Do you support Instagram reviews?',
        answer: 'Instagram does not support native reviews today, but we help you turn testimonials into Reels and Stories.'
      }
    ]
  },
  'yelp-reviews': {
    badge: 'Reputation',
    title: 'Yelp Reviews Growth',
    subtitle: 'Win the trust of high-intent local customers',
    description:
      'Manage your Yelp presence with proactive review generation, compliance guidance, and analytics that tie Yelp traffic back to booked appointments.',
    primaryCta: { label: 'Request a Demo', href: '/book-demo' },
    secondaryCta: { label: 'See Yelp Playbook', href: '/resources/yelp-playbook' },
    stats: [
      { label: 'New reviews', value: '+78%', subtext: 'growth across service brands' },
      { label: 'Lead conversion', value: '+34%', subtext: 'more bookings from Yelp clicks' },
      { label: 'Moderated spam', value: '92%', subtext: 'success rate disputing policy violations' }
    ],
    featureCards: [
      {
        icon: FaYelp,
        title: 'Yelp-Optimized Requests',
        description: 'Compliant templates to encourage authentic reviews without violating Yelp’s policies.'
      },
      {
        icon: FaShieldAlt,
        title: 'Policy Guardrails',
        description: 'Receive alerts with pre-filled dispute templates whenever questionable feedback appears.'
      },
      {
        icon: FaClipboardCheck,
        title: 'Visit Attribution',
        description: 'Track which reviews drive clicks, calls, and confirmed bookings in your CRM.'
      },
      {
        icon: FaComments,
        title: 'In-app Messaging',
        description: 'Respond to consumer inquiries and reviews from the same shared inbox.'
      }
    ],
    steps: [
      { title: 'Connect Yelp Business', description: 'Authorize access to monitor reviews and engagement metrics.' },
      { title: 'Enable compliant invites', description: 'Use targeted post-service emails that align with Yelp guidelines.' },
      { title: 'Handle responses fast', description: 'Reply with saved templates and escalate disputes to our specialists.' },
      { title: 'Optimize listings', description: 'Identify keyword gaps and add photos that match top-converting searches.' }
    ],
    resources: [
      {
        label: 'See Booking App in Action',
        description: 'Watch a quick demo of how we monitor, respond, and report on Yelp across all locations.',
        href: '/book-demo'
      },
      {
        label: 'Compare Plans & Features',
        description: 'Find the package that matches your locations, staff, and reputation goals.',
        href: '/pricing'
      }
    ],
    faqs: [
      {
        question: 'Will Yelp hide reviews collected through Booking App?',
        answer:
          'No. We follow Yelp’s recommended practices by focusing on great experiences, timed nudges, and compliant messaging.'
      },
      {
        question: 'Do you provide support for disputed reviews?',
        answer:
          'Yes. Our team helps you evaluate violations, gather evidence, and submit disputes with Yelp’s moderation team.'
      },
      {
        question: 'Can I see which staff members drive the best reviews?',
        answer: 'Absolutely. Staff-level reporting ties customer sentiment directly to service providers.'
      }
    ]
  },
  'tripadvisor-reviews': {
    badge: 'Hospitality',
    title: 'TripAdvisor Reputation Management',
    subtitle: 'Delight travelers with unforgettable experiences',
    description:
      'Showcase guest stories, capture post-stay feedback, and climb TripAdvisor rankings with automation built for spas, retreats, and hospitality brands.',
    primaryCta: { label: 'Schedule Strategy Session', href: '/book-demo' },
    secondaryCta: { label: 'Download Hospitality Kit', href: '/resources/tripadvisor-toolkit' },
    stats: [
      { label: 'Ranking improvement', value: 'Top 10%', subtext: 'average jump within 90 days' },
      { label: 'Guest response rate', value: '97%', subtext: 'achieved with scheduled reminders' },
      { label: 'Upsell revenue', value: '+28%', subtext: 'from automated pre-arrival campaigns' }
    ],
    featureCards: [
      {
        icon: FaTripadvisor,
        title: 'Stay Survey Sync',
        description: 'Merge post-stay surveys with TripAdvisor reviews to capture detailed guest stories.'
      },
      {
        icon: FaStar,
        title: 'Experience Highlights',
        description: 'Auto-tag reviews by amenities so you can showcase spa, dining, or tour-specific praise.'
      },
      {
        icon: FaRocket,
        title: 'Rank Boost Automations',
        description: 'Timed requests boost fresh reviews, a key signal in TripAdvisor ranking algorithms.'
      },
      {
        icon: FaHeadset,
        title: 'Guest Recovery Queues',
        description: 'Create service tickets for less-than-perfect stays and track resolutions end-to-end.'
      }
    ],
    steps: [
      { title: 'Connect TripAdvisor account', description: 'Import your reviews, photos, and traveler rankings.' },
      { title: 'Design branded surveys', description: 'Collect stay-specific feedback before pushing to TripAdvisor.' },
      { title: 'Automate recovery flows', description: 'Alert your team instantly and assign tasks to recover guests.' },
      { title: 'Promote success stories', description: 'Embed your best TripAdvisor quotes on landing pages and emails.' }
    ],
    resources: [
      {
        label: 'Hospitality Success Stories',
        description: 'See how leading retreats and spas use Booking App to climb TripAdvisor rankings.',
        href: '/features'
      },
      {
        label: 'Book a Hospitality Consultation',
        description: 'Partner with our specialists to design guest recovery and upsell programs.',
        href: '/book-demo'
      }
    ],
    faqs: [
      {
        question: 'Do you integrate with PMS and booking engines?',
        answer:
          'Yes. Sync reservations from leading PMS providers so you can trigger review requests automatically after checkout.'
      },
      {
        question: 'Can I manage multiple properties?',
        answer: 'You can manage unlimited properties with property-level dashboards and consolidated reporting.'
      },
      {
        question: 'Is there support for international teams?',
        answer: 'Our templates support 20+ languages, and you can localize automations per market.'
      }
    ]
  },
  'reviews-management': {
    badge: '360° Reputation',
    title: 'Unified Reviews Management',
    subtitle: 'One inbox for every review across the web',
    description:
      'Centralize Google, Facebook, Yelp, TripAdvisor, and 40+ niche directories. Automate invites, respond faster, and turn happy customers into your most persuasive marketing asset.',
    primaryCta: { label: 'Book a Demo', href: '/book-demo' },
    secondaryCta: { label: 'View Platform Features', href: '/features' },
    stats: [
      { label: 'Average rating', value: '4.8★', subtext: 'after 90 days on Booking App' },
      { label: 'Review volume', value: '5x', subtext: 'more feedback per location' },
      { label: 'Time saved', value: '18hrs', subtext: 'per month using automation' }
    ],
    featureCards: [
      {
        icon: FaStar,
        title: 'Cross-Platform Monitoring',
        description: 'Track every new review in one real-time feed with sentiment detection and priority scoring.'
      },
      {
        icon: FaBullhorn,
        title: 'Automated Campaigns',
        description: 'Run email, SMS, and WhatsApp review requests triggered by visit status or invoice completion.'
      },
      {
        icon: FaShieldAlt,
        title: 'Compliance Controls',
        description: 'Stay aligned with platform guidelines using rate-limiting, opt-out management, and dispute workflows.'
      },
      {
        icon: FaChartLine,
        title: 'ROI Analytics',
        description: 'Attribute new bookings and revenue to specific reviews, campaigns, and staff members.'
      }
    ],
    steps: [
      { title: 'Connect review sources', description: 'Link Google, Facebook, Yelp, TripAdvisor, and niche sites in minutes.' },
      { title: 'Automate invitations', description: 'Launch branded requests aligned with your customer journey.' },
      { title: 'Manage responses', description: 'Assign ownership, approve replies, and collaborate with your team.' },
      { title: 'Amplify social proof', description: 'Publish widgets, landing pages, and ads featuring top-rated feedback.' }
    ],
    resources: [
      {
        label: 'Platform Overview',
        description: 'Tour the full Booking App suite for capturing, managing, and promoting reviews everywhere.',
        href: '/features'
      },
      {
        label: 'Talk with an Advisor',
        description: 'Get personalized recommendations for rolling out review automation across your business.',
        href: '/contact'
      }
    ],
    faqs: [
      {
        question: 'Which review platforms do you integrate with?',
        answer:
          'We cover Google, Facebook, Yelp, TripAdvisor, Trustpilot, Booksy, Fresha, and 40+ industry directories. New sources are added monthly.'
      },
      {
        question: 'Can I control who sends review requests?',
        answer:
          'Yes. Set automated triggers for specific services, staff, or locations and limit volume to stay compliant with each platform.'
      },
      {
        question: 'Is there an API?',
        answer:
          'Developers can push events, trigger workflows, and fetch review analytics through our REST API and webhooks.'
      }
    ]
  }
}

const DEFAULT_VARIANT = 'reviews-management'

const ReviewsPage = ({ variant = DEFAULT_VARIANT }) => {
  const config = useMemo(() => REVIEW_PAGES[variant] ?? REVIEW_PAGES[DEFAULT_VARIANT], [variant])
  const navigate = useNavigate()
  usePageTitle(`${config.title} - Booking App`)

  const [formValues, setFormValues] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    platform: 'Google',
    reviewTarget: '1000',
    notes: ''
  })
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [submissionState, setSubmissionState] = useState({ status: 'idle', message: '' })

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!agreeToTerms) {
      setSubmissionState({ status: 'error', message: 'कृपया सेवा शर्तों को स्वीकार करें।' })
      return
    }
    setSubmissionState({ status: 'success', message: 'धन्यवाद! हमारी टीम 24 घंटे के अंदर आपसे सम्पर्क करेगी।' })
    setTimeout(() => {
      navigate('/contact', { state: { intent: 'reviews-service', payload: formValues } })
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/10 rounded-full mb-4">
              {config.badge}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">{config.title}</h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-6">{config.subtitle}</p>
            <p className="text-base sm:text-lg text-primary-50 mb-8">{config.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={config.primaryCta.href}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors"
              >
                {config.primaryCta.label}
              </Link>
              <Link
                to={config.secondaryCta.href}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white text-white font-semibold hover:bg-white/10 transition-colors"
              >
                {config.secondaryCta.label}
              </Link>
              <a
                href="#business-details"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                Share Your Business Details
              </a>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 backdrop-blur">
            <h2 className="text-lg font-semibold mb-4">Why it matters</h2>
            <div className="space-y-4">
              {config.stats.map((stat) => (
                <div key={stat.label} className="flex items-start gap-4">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div>
                    <p className="text-sm font-semibold text-primary-50 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-sm text-primary-100">{stat.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Authentic Review Growth Program</h2>
              <p className="text-lg text-gray-600 mb-4">
                Booking App helps your business collect verified, authentic, and long-lasting reviews. We focus on elevating your brand
                credibility so you rank higher across search, social, and marketplace platforms.
              </p>
              <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 sm:p-8 mb-6">
                <h3 className="text-xl font-semibold text-primary-900 mb-3">Plan highlights</h3>
                <ul className="space-y-3 text-sm sm:text-base text-primary-900">
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-600" />
                    <span>
                      <strong>1000 authentic reviews</strong> - average service fee starts from ₹45,000* (₹45 per review).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-600" />
                    <span>Only <strong>10% upfront payment</strong> (₹4,500) required at onboarding.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-600" />
                    <span>The remaining 90% is billed only for reviews that stay live on Google, Facebook, Yelp, etc.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-600" />
                    <span>Reviews from real customers, with follow-up verification and content guidelines enforced.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs sm:text-sm text-primary-800">
                    <FaCheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                    <span>* Pricing varies by location, platform, and industry.</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Our specialists partner with you at every stage - strategy, campaign launch, review validation, and ongoing tracking.
                Whether you want more Google leads, stronger social proof, or higher Yelp/TripAdvisor rankings, we deliver end-to-end
                support.
              </p>
              <div className="bg-gray-900 text-white rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl font-semibold mb-3">Payment Security & Transparency</h3>
                <ul className="space-y-3 text-sm sm:text-base">
                  <li className="flex items-start gap-3">
                    <FaShieldAlt className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary-300" />
                    <span>Upfront invoices and agreements for every payment stage.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaChartLine className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary-300" />
                    <span>Track every review's status in your real-time dashboard.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaComments className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary-300" />
                    <span>Payments auto-adjust if a review is removed by the platform.</span>
                  </li>
                </ul>
              </div>
            </div>
            <div id="business-details">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Share Your Business Details</h3>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700" htmlFor="businessName">
                      Business name
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      value={formValues.businessName}
                      onChange={handleInputChange}
                      placeholder="e.g. Urban Glow Salon"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700" htmlFor="contactPerson">
                        Contact person
                      </label>
                      <input
                        id="contactPerson"
                        name="contactPerson"
                        type="text"
                        required
                        value={formValues.contactPerson}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700" htmlFor="phone">
                        Mobile / WhatsApp
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formValues.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98xxxxxx90"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formValues.email}
                      onChange={handleInputChange}
                      placeholder="you@business.com"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700" htmlFor="website">
                      Website / Google Business link
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={formValues.website}
                      onChange={handleInputChange}
                      placeholder="https://g.page/yourbusiness"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700" htmlFor="platform">
                        Primary platform
                      </label>
                      <select
                        id="platform"
                        name="platform"
                        value={formValues.platform}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      >
                        <option value="Google">Google</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Yelp">Yelp</option>
                        <option value="TripAdvisor">TripAdvisor</option>
                        <option value="Multi-Platform">All platforms</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700" htmlFor="reviewTarget">
                        Target review count
                      </label>
                      <input
                        id="reviewTarget"
                        name="reviewTarget"
                        type="number"
                        min="100"
                        step="50"
                        value={formValues.reviewTarget}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700" htmlFor="notes">
                      Additional context
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={formValues.notes}
                      onChange={handleInputChange}
                      placeholder="Share your current rating, target locations, or any specific instructions."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(event) => setAgreeToTerms(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      I agree that Booking App will collect a 10% advance before launching the review campaign. The remaining payment is
                      due only for reviews that stay live on Google/Facebook/Yelp. All reviews come from real customers and comply with
                      each platform's policies.
                    </label>
                  </div>
                  {submissionState.message && (
                    <div
                      className={`rounded-lg px-4 py-3 text-sm font-medium ${
                        submissionState.status === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {submissionState.message}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submissionState.status === 'success'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {submissionState.status === 'success' ? 'Request submitted' : 'Schedule a free consultation'}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Your information stays secure with us. We never share it with third parties.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Features built for reputation leaders</h2>
            <p className="text-lg text-gray-600">
              Everything you need to capture authentic feedback, respond at speed, and showcase the voice of your happiest customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {config.featureCards.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-gray-200">
              Launch a proven reputation workflow in days—not months. Follow these four steps to activate your customer voice.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {config.steps.map((step, index) => (
              <div key={step.title} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col h-full">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white font-semibold mb-4">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-200 flex-1">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Resources & playbooks</h2>
            <p className="text-lg text-gray-600">
              Get proven frameworks, templates, and scripts our top-performing brands use to win with reviews.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {config.resources.map((resource) => (
              <Link
                key={resource.label}
                to={resource.href}
                className="group block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-primary-200 hover:shadow-lg transition-all"
              >
                <div className="mb-3 inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-primary-50 text-primary-600">
                  Guide
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600">{resource.label}</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4">{resource.description}</p>
                <span className="text-primary-600 font-semibold text-sm">View resource →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-4">
            {config.faqs.map((faq) => (
              <details key={faq.question} className="group border border-gray-200 bg-white rounded-xl shadow-sm">
                <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between gap-4">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">{faq.question}</span>
                  <span className="text-primary-600 transition-transform group-open:rotate-180">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm sm:text-base leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-600 text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to grow with authentic reviews?</h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-8">
            Join thousands of high-performing businesses using Booking App to build trust, drive conversions, and win loyal customers.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to={config.primaryCta.href}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors"
            >
              {config.primaryCta.label}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ReviewsPage


