import React from 'react'
import { FaCalendarAlt, FaArrowRight } from 'react-icons/fa'
import Modal from '../../common/Modal/Modal'

const BookingPromptModal = ({ isOpen, onClose, onBookNow, businessName }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      draggable={false}
      showCloseButton={false}
    >
      <div className="relative overflow-hidden z-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50" />
        <div className="relative p-5 space-y-5">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Ready to book your appointment?
              </h2>
              <p className="text-xs text-gray-500">
                Secure your slot now and get the best available time.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onBookNow) onBookNow()
              onClose()
            }}
            className="group w-full flex items-center justify-between gap-3 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transform transition-all duration-200 active:scale-95"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/40">
              <FaCalendarAlt
                className="text-lg"
                style={{ animation: 'shakeZoom 1.6s ease-in-out infinite' }}
              />
            </span>
            <div className="flex-1 text-left">
              <div className="text-sm leading-tight">
                Book Appointment Now
              </div>
              <div className="text-[11px] text-primary-100/90">
                Choose services, staff & time
              </div>
            </div>
            <FaArrowRight className="text-sm opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default BookingPromptModal

