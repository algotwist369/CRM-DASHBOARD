import React from 'react'
import { Link } from 'react-router-dom'

const PublicFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">

        {/* Left */}
        <p className="text-sm text-gray-500 text-center sm:text-left">
          © {currentYear} SpaAdvisor. All rights reserved.
        </p>

        {/* Right */}
        <div className="flex items-center gap-4 text-sm">
          {/* <Link to="/privacy" className="text-gray-500 hover:text-gray-900">
            Privacy
          </Link>
          <Link to="/terms" className="text-gray-500 hover:text-gray-900">
            Terms
          </Link> */}
          {/* <Link to="/contact" className="text-gray-500 hover:text-gray-900">
            Contact
          </Link> */}

          support - dishaspaadvisor@gmail.com
        </div>

      </div>
    </footer>
  )
}

export default PublicFooter
