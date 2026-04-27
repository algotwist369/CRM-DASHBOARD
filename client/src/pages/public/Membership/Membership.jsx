import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { 
  FaCalendarCheck, 
  FaRegCreditCard, 
  FaHeadset, 
  FaGift, 
  FaWallet,
  FaCrown,
  FaGem,
  FaStar,
  FaMedal,
  FaAward,
  FaEnvelope
} from 'react-icons/fa'

const Membership = () => {
  usePageTitle('Elite Spa Memberships - Spaadvisor')
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },[])

  const PURCHASE_URL = "https://membership.spaadvisor.in/login"

  const plans = [
    { 
      name: 'GOLD MEMBERSHIP', 
      price: '5,000', 
      duration: '365 days', 
      credit: '6,000', 
      label: 'PLAN 1',
      validity: 'Valid for 365 days',
      icon: <FaMedal className="text-amber-600" />,
      accent: 'border-amber-200',
      bg: 'bg-amber-50/30'
    },
    { 
      name: 'PLATINUM MEMBERSHIP', 
      price: '15,000', 
      duration: '365 days', 
      credit: '18,000', 
      label: 'Premium',
      validity: 'Valid for 365 days',
      icon: <FaAward className="text-slate-400" />,
      accent: 'border-slate-200',
      bg: 'bg-slate-50/30'
    },
    { 
      name: 'DIAMOND MEMBERSHIP', 
      price: '25,000', 
      duration: '365 days', 
      credit: '31,000', 
      label: 'Premium',
      validity: 'Valid for 365 days',
      icon: <FaGem className="text-cyan-400" />,
      accent: 'border-cyan-200',
      bg: 'bg-cyan-50/30'
    },
    { 
      name: 'CROWN MEMBERSHIP', 
      price: '55,000', 
      duration: '365 days', 
      credit: '75,000', 
      label: 'Most Popular',
      validity: 'Valid for 365 days',
      icon: <FaCrown className="text-yellow-500" />,
      accent: 'border-yellow-500',
      bg: 'bg-yellow-50/50',
      highlight: true
    },
    { 
      name: 'ACE MEMBERSHIP', 
      price: '100,000', 
      duration: '365 days', 
      credit: '140,000', 
      label: 'Elite',
      validity: 'Valid for 365 days',
      icon: <FaStar className="text-indigo-400" />,
      accent: 'border-indigo-200',
      bg: 'bg-indigo-50/30'
    }
  ]

  const handleBuyClick = () => {
    window.open(PURCHASE_URL, '_blank')
  }

  const benefits = [
    { icon: <FaRegCreditCard />, title: 'Significant Savings' },
    { icon: <FaCalendarCheck />, title: 'Priority Reservations' },
    { icon: <FaWallet />, title: 'Wallet Credit System' },
    { icon: <FaHeadset />, title: 'Concierge Desk' },
    { icon: <FaGift />, title: 'Event Privileges' }
  ]

  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      <Helmet>
        <title>Elite Spa Memberships | Luxury Wellness Plans | Spaadvisor</title>
        <meta name="description" content="Discover Spaadvisor's elite spa memberships. Choose from Gold, Platinum, Diamond, Crown, and Ace plans. Enjoy luxury wellness, priority bookings, and exclusive wallet credits." />
        <meta name="keywords" content="spa membership, luxury spa plans, wellness membership, spa rewards, Spaadvisor membership, Gold membership, Platinum membership, Diamond membership, Crown membership, Ace membership" />
        <meta property="og:title" content="Elite Spa Memberships | Spaadvisor" />
        <meta property="og:description" content="Elevate your wellness journey with Spaadvisor's premium membership plans. Exclusive benefits and significant savings await." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Elite Spa Memberships | Spaadvisor" />
        <meta name="twitter:description" content="Luxury spa memberships designed for your ultimate well-being. Join Spaadvisor today." />
        <link rel="canonical" href="https://spaadvisor.in/spa-membership" />
      </Helmet>

      {/* Hero Section */}
      <div className="relative bg-[#1a2e35] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 border border-white/20 text-[10px] tracking-[0.3em] uppercase text-white/60 mb-8">
              Exclusive Access
            </span>
            <h1 className="text-4xl sm:text-6xl font-light text-white mb-8 tracking-tight leading-[1.1]">
              Elevate Your <br />
              <span className="italic font-serif">Wellness Journey</span>
            </h1>
            <p className="text-lg text-white/60 mb-12 font-light leading-relaxed max-w-xl">
              Spaadvisor memberships are meticulously designed to provide a sanctuary of health and vitality, 
              ensuring every visit is a step toward your ultimate well-being.
            </p>
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => handleBuyClick({ name: 'Our Programs' })}
                className="bg-white text-[#1a2e35] px-10 py-5 text-xs tracking-[0.2em] uppercase font-bold hover:bg-gray-100 transition-colors"
              >
                Explore Memberships
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Grid Section */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white border-t-2 ${plan.accent} p-10 flex flex-col justify-between group transition-all duration-300 hover:border-gray-900 ${plan.highlight ? 'ring-1 ring-yellow-500' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-[8px] tracking-[0.2em] uppercase font-bold py-1 px-3">
                  {plan.label}
                </div>
              )}
              <div>
                <div className="flex justify-between items-start mb-10">
                  <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
                    {plan.icon}
                  </div>
                  {!plan.highlight && plan.label && (
                    <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-gray-400">
                      {plan.label}
                    </span>
                  )}
                </div>
                
                <h3 className="text-sm font-bold text-gray-900 mb-8 tracking-[0.15em] uppercase leading-tight h-10 flex items-center">
                  {plan.name}
                </h3>
                
                <div className="mb-10">
                  <div className="text-3xl font-light text-gray-900 mb-1">₹{plan.price}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest">/ {plan.duration}</div>
                </div>

                <div className={`py-8 px-6 border-y border-gray-50 mb-10 ${plan.bg}`}>
                  <div className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-bold">Wallet Credit</div>
                  <div className="text-2xl font-medium text-[#1a2e35]">₹{plan.credit}</div>
                </div>

                <div className="flex items-center gap-2 mb-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                    {plan.validity}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => handleBuyClick()}
                className={`w-full py-5 text-[10px] tracking-[0.2em] uppercase font-bold transition-colors ${
                  plan.highlight 
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                    : 'bg-[#1a2e35] text-white hover:bg-gray-800'
                }`}
              >
                Purchase Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Benefits Section */}
      <div className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-bold mb-4 block">The Advantage</span>
            <h2 className="text-3xl font-light text-gray-900 tracking-tight">Privileges of Membership</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 border border-gray-100 flex items-center justify-center text-xl text-gray-400 group-hover:text-[#1a2e35] group-hover:border-gray-900 transition-all duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest leading-tight px-4">
                  {benefit.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Minimalist Process Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3">
            <span className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-bold mb-4 block">Onboarding</span>
            <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-8">How to Begin</h2>
            <p className="text-gray-500 font-light leading-relaxed">
              Your path to tranquility is streamlined into five simple steps. Join our community of wellness enthusiasts today.
            </p>
          </div>
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-12">
            {[
              { id: '01', title: 'Select Plan', desc: 'Choose the tier that aligns with your wellness objectives.' },
              { id: '02', title: 'Secure Payment', desc: 'Complete your purchase through our encrypted gateway.' },
              { id: '03', title: 'Book Session', desc: 'Connect with our concierge for priority reservations.' },
              { id: '04', title: 'Get Confirmed', desc: 'Receive your digital membership and plan details instantly.' },
              { id: '05', title: 'Pure Indulgence', desc: 'Visit our sanctuary and experience expert care.' }
            ].map((step, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="text-xs font-bold text-gray-300 tracking-tighter pt-1">{step.id}</div>
                <div>
                  <h3 className="text-[11px] font-bold text-gray-900 mb-2 uppercase tracking-widest">{step.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-light">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Contact Section */}
      <div className="bg-[#1a2e35] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light text-white mb-12 tracking-tight">Need Personal Assistance?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              {/* <a 
                href="tel:9999120413"
                className="group flex items-center gap-4 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-12 h-12 border border-white/20 flex items-center justify-center group-hover:border-white transition-colors">
                  <FaHeadset className="text-lg" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-1 font-bold">Call Support</p>
                  <p className="text-sm font-medium tracking-widest">9999120413</p>
                </div>
              </a> */}

              <a 
                href="mailto:support@spaadvisor.in"
                className="group flex items-center gap-4 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-12 h-12 border border-white/20 flex items-center justify-center group-hover:border-white transition-colors">
                  <FaEnvelope className="text-lg" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-1 font-bold">Email Support</p>
                  <p className="text-sm font-medium tracking-widest lowercase">support@spaadvisor.in</p>
                </div>
              </a>
            </div>

            <div className="hidden sm:block w-px h-12 bg-white/10"></div>
            <button 
              onClick={() => handleBuyClick()}
              className="bg-white text-[#1a2e35] px-12 py-5 text-xs tracking-[0.2em] uppercase font-bold hover:bg-gray-100 transition-colors"
            >
              Get Membership Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Membership
