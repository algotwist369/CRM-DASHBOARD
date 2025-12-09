import React from 'react'
import { Link } from 'react-router-dom'
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaRocket,
  FaBrain
} from 'react-icons/fa'

const PublicFooter = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'For Businesses', href: '/for-businesses' },
        { name: 'Free Listing', href: '/free-listing' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Advertise', href: '/advertise' },
        { name: 'Contact', href: '/contact' },
        { name: 'Blog', href: '/blog' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Documentation', href: '/docs' },
        { name: 'API Access', href: '/api' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' }
      ]
    },
    {
      title: 'Features',
      links: [
        { name: 'Appointment Booking', href: '/features#booking' },
        { name: 'Customer Management', href: '/features#crm' },
        { name: 'Marketing Campaigns', href: '/features#marketing' },
        { name: 'Analytics & Reports', href: '/features#analytics' },
        { name: 'Payment Integration', href: '/features#payments' }
      ]
    }
  ]

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      icon: FaFacebook
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: FaTwitter
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: FaLinkedin
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      icon: FaInstagram
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com',
      icon: FaYoutube
    }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700  flex items-center justify-center mr-3">
                <FaRocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Booking App</h3>
                <div className="flex items-center gap-2 mt-1">
                  <FaBrain className="text-primary-400 text-xs" />
                  <p className="text-sm text-primary-400 font-semibold">AI Powered CRM Application</p>
                </div>
              </div>
            </div>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Transform your business with our AI-powered CRM platform. Manage appointments, customers,
              marketing campaigns, and analytics all in one place. Free listing available - start growing your business today!
            </p>
            <div className="flex items-center gap-4 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800  flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 transition-all"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}t
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-base font-semibold mb-4 text-white">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-600/20  flex items-center justify-center flex-shrink-0">
                <FaMapMarkerAlt className="text-primary-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Address</p>
                <p className="text-gray-400 text-sm">123 Business Street, Suite 100<br />Mumbai, Maharashtra 400001<br />India</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-600/20  flex items-center justify-center flex-shrink-0">
                <FaPhoneAlt className="text-primary-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Phone</p>
                <p className="text-gray-400 text-sm">+91-XXXXX-XXXXX</p>
                <p className="text-gray-500 text-xs mt-1">24/7 Support Available</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-600/20  flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-primary-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Email</p>
                <p className="text-gray-400 text-sm">support@bookingapp.com</p>
                <p className="text-gray-500 text-xs mt-1">info@bookingapp.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                © {currentYear} Booking App. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-primary-400">
                <FaBrain className="text-xs" />
                <span className="text-xs font-semibold">AI Powered CRM Application</span>
              </div>
            </div>
            <div className="flex items-center flex-wrap justify-center gap-4 md:gap-6">
              <Link to="/privacy" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Cookie Policy
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter

