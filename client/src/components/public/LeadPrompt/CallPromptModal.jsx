import React from 'react'
import { FaPhoneAlt, FaArrowRight } from 'react-icons/fa'
import Modal from '../../common/Modal/Modal'

const CallPromptModal = ({ isOpen, onClose, phone, onCall }) => {
  const telHref = phone ? `tel:${phone}` : null

  const handleCallClick = () => {
    if (!telHref) return
    if (onCall) onCall()
  }

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
                Talk to us in one tap
              </h2>
              <p className="text-xs text-gray-500">
                Get instant details, offers and slot availability over a quick call.
              </p>
            </div>
          </div>

          {telHref ? (
            <a
              href={telHref}
              onClick={handleCallClick}
              className="group w-full flex items-center justify-between gap-3 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transform transition-all duration-200 active:scale-95"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/40">
                <FaPhoneAlt
                  className="text-lg"
                  style={{ animation: 'shakeZoom 1.6s ease-in-out infinite' }}
                />
              </span>
              <div className="flex-1 text-left">
                <div className="text-sm leading-tight">
                  Call now for more info
                </div>
                {phone && (
                  <div className="text-[11px] text-primary-100/90">
                    Calling {phone}
                  </div>
                )}
              </div>
            </a>
          ) : (
            <div className="w-full flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FaPhoneAlt className="text-lg" />
              </div>
              <div className="text-sm font-medium">Phone number not available</div>
              <div className="text-xs text-gray-400">
                You can still send an enquiry or book online.
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default CallPromptModal
