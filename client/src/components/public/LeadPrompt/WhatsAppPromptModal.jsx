import React from 'react'
import { FaWhatsapp, FaArrowRight } from 'react-icons/fa'
import Modal from '../../common/Modal/Modal'

const WhatsAppPromptModal = ({ isOpen, onClose, whatsappUrl, onWhatsApp }) => {
  const buildUrlWithMessage = (url) => {
    if (!url) return null
    const hasText = /[?&]text=/.test(url)
    if (hasText) return url
    const sep = url.includes('?') ? '&' : '?'
    const message = encodeURIComponent('Hi, I found your business on SpaAdvisor and would like to inquire about your services.')
    return `${url}${sep}text=${message}`
  }

  const finalUrl = buildUrlWithMessage(whatsappUrl)

  const handleWhatsAppClick = () => {
    if (!finalUrl) return
    if (onWhatsApp) onWhatsApp()
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-50" />
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
                Chat instantly on WhatsApp
              </h2>
              <p className="text-xs text-gray-500">
                Quick responses, current offers, and slot availability in minutes.
              </p>
            </div>
          </div>

          {whatsappUrl ? (
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="group w-full flex items-center justify-between gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transform transition-all duration-200 active:scale-95"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/40">
                <FaWhatsapp
                  className="text-lg"
                  style={{ animation: 'shakeZoom 1.6s ease-in-out infinite' }}
                />
              </span>
              <div className="flex-1 text-left">
                <div className="text-sm leading-tight">
                  Open WhatsApp and start chatting
                </div>
                <div className="text-[11px] text-green-100/90">
                  Fast replies and best deals
                </div>
              </div>
            </a>
          ) : (
            <div className="w-full flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FaWhatsapp className="text-lg" />
              </div>
              <div className="text-sm font-medium">WhatsApp not available</div>
              <div className="text-xs text-gray-400">
                You can send an enquiry or book online.
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default WhatsAppPromptModal
