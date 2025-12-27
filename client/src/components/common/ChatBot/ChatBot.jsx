import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaUser,
  FaSpinner,
  FaRobot,
  FaArrowLeft,
  FaHome,
  FaSearch,
  FaCalendarCheck,
  FaQuestionCircle
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const ChatBot = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [hasShownNotification, setHasShownNotification] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 Welcome to **Spa Concierge**!\n\nI'm here to make your booking journey smooth and effortless. I can help you find top-rated spas, manage your appointments, or explain our services.\n\nType your query or select an option below:",
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: [
        { text: '🔍 Search Spas', action: 'search_businesses' },
        { text: '📅 Manage Booking', action: 'check_appointment' },
        { text: '💆 View Services', action: 'popular_services' }
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-show notification after 10 seconds
  useEffect(() => {
    if (!hasShownNotification && !isOpen) {
      const timer = setTimeout(() => {
        setShowNotification(true)
        setHasShownNotification(true)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [hasShownNotification, isOpen])

  // Hide notification when chat opens
  useEffect(() => {
    if (isOpen && showNotification) {
      setShowNotification(false)
    }
  }, [isOpen, showNotification])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const quickReplies = [
    { text: '🔍 Find a Spa', action: 'search_businesses' },
    { text: '📝 How to Book', action: 'how_to_book' },
    { text: '📅 Check My Appointment', action: 'check_appointment' },
    { text: '❌ Cancel/Reschedule', action: 'cancel_reschedule' },
    { text: '💆 Popular Services', action: 'popular_services' },
    { text: '📍 Nearby Locations', action: 'search_businesses' },
    { text: '📞 Contact Support', action: 'contact' }
  ]

  const renderMessageText = (text) => {
    if (!text) return null

    let content = text
    const parts = []
    let lastIndex = 0

    const combinedRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g
    let match

    while ((match = combinedRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }

      if (match[1]) {
        // Link Match
        const label = match[1]
        const url = match[2]
        parts.push(
          <button
            key={`link-${match.index}`}
            onClick={() => {
              if (url.startsWith('/')) {
                navigate(url)
                setIsOpen(false)
              } else {
                window.open(url, '_blank', 'noopener,noreferrer')
              }
            }}
            className="text-primary-600 font-bold hover:underline"
          >
            {label}
          </button>
        )
      } else if (match[3]) {
        // Bold Match
        parts.push(<strong key={`bold-${match.index}`} className="font-bold text-gray-900">{match[3]}</strong>)
      }

      lastIndex = combinedRegex.lastIndex
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return (
      <div className="text-sm leading-relaxed text-gray-800">
        {parts.map((p, i) => <span key={i}>{p}</span>)}
      </div>
    )
  }

  const getBotResponse = (message, action = null) => {
    const msg = message.toLowerCase().trim()

    if (action === 'search_businesses' || /\b(search|find|book|nearby|explore)\b/.test(msg)) {
      if (msg.includes('go to') || msg.includes('open') || action === 'search_businesses') {
        return { text: "🔍 **Redirecting** you to our search results... Get ready to find your perfect spa!", redirect: '/search' }
      }
      return {
        text: "🔍 **Finding the perfect spa?**\n\nYou can explore top-rated salons, massages, and wellness centers right here. Search by your city or a specific service.\n\n🔗 [Open Search Page](/search)",
        quickReplies: [
          { text: '📍 Explore Nearby', action: 'search_businesses' },
          { text: '💆 View Services', action: 'popular_services' },
          { text: '📝 Steps to Book', action: 'how_to_book' }
        ]
      }
    }

    if (action === 'popular_services' || /\b(service|treatment|massage|facial|hair|spa|nails|pedicure|manicure)\b/.test(msg)) {
      return {
        text: "💆 **Explore Top Services**\n\nOur partners offer a wide range of treatments including:\n✨ **Massages** (Thai, Swedish, Deep Tissue)\n✨ **Facials** & Skin Care\n✨ **Hair Styling** & Color\n✨ **Nails** & Pedicures\n\nYou can filter results by specific services on our search page.",
        quickReplies: [
          { text: '🔍 Browse All Services', action: 'search_businesses' },
          { text: '📍 Search Nearby', action: 'search_businesses' },
          { text: '🏠 Main Menu', action: 'main_menu' }
        ]
      }
    }

    if (action === 'check_appointment' || /\b(status|my booking|confirmation|track)\b/.test(msg)) {
      if (msg.includes('go to') || msg.includes('open') || action === 'check_appointment') {
        return { text: "📅 **Opening** the appointment tracking page...", redirect: '/check-appointment' }
      }
      return {
        text: "📅 **Checking your booking status?**\n\nEnter your **Confirmation Code** (the one you received via SMS/Email) on our status page to view or modify your booking.\n\n🔗 [Check Status Now](/check-appointment)",
        quickReplies: [
          { text: '📅 Track Booking', action: 'check_appointment' },
          { text: '📞 Lost My Code', action: 'contact' }
        ]
      }
    }

    if (action === 'how_to_book' || /\b(how to|steps|process|tutorial)\b/.test(msg)) {
      return {
        text: "📝 **Booking is effortless:**\n\n1️⃣ **Search** for a spa or salon near you.\n2️⃣ **Select** your desired treatments.\n3️⃣ **Pick** an available time slot.\n4️⃣ **Confirm** with your details.\n\n✅ You'll get an **Instant Code** via SMS to track everything!",
        quickReplies: [
          { text: '🔍 Find a Spa', action: 'search_businesses' },
          { text: '📞 Need Help?', action: 'contact' }
        ]
      }
    }

    if (action === 'cancel_reschedule' || /\b(cancel|change|reschedule|edit)\b/.test(msg)) {
      return {
        text: "❌ **Need to adjust your plans?**\n\nNo problem! Use your confirmation code on the [Check Status](/check-appointment) page to reschedule or cancel your visit.\n\n*Pro Tip: Check the business's policy for any time limits!*",
        quickReplies: [
          { text: '📅 Manage Booking', action: 'check_appointment' },
          { text: '🔍 Go to Main Menu', action: 'main_menu' }
        ]
      }
    }

    if (action === 'contact' || /\b(help|support|contact|talk to human)\b/.test(msg)) {
      return {
        text: "📞 **We're here for you!**\n\nNeed help with a booking? \n✉️ **Email**: dishaspaadvisor@gmail.com\n\nFor questions about a specific appointment, we recommend calling the business directly (number is in your email).",
        quickReplies: [
          { text: '🏠 Main Menu', action: 'main_menu' },
          { text: '🕒 How it Works', action: 'how_to_book' }
        ]
      }
    }

    if (/\b(hi|hello|hey|start|menu)\b/.test(msg) || action === 'main_menu') {
      return {
        text: "👋 **Hello! I'm your Concierge.**\n\nI'm here to make your booking journey smooth and effortless. What would you like to do?",
        quickReplies: [
          { text: '🔍 Search & Find', action: 'search_businesses' },
          { text: '📅 Manage Booking', action: 'check_appointment' },
          { text: '💆 View Services', action: 'popular_services' },
          { text: '❓ How it Works', action: 'how_to_book' }
        ]
      }
    }

    return {
      text: "I'm specialized in your **booking experience**! I can help you find a spa, check status, or explore services.\n\nWhat would you like to do?",
      quickReplies: [
        { text: '🔍 Search Spas', action: 'search_businesses' },
        { text: '📅 Manage Booking', action: 'check_appointment' },
        { text: '� Browse Services', action: 'popular_services' },
        { text: '🏠 Main Menu', action: 'main_menu' }
      ]
    }
  }

  const handleSendMessage = (text = null, action = null) => {
    const messageText = text || inputValue.trim()
    if (!messageText && !action) return

    const userMessage = {
      id: Date.now(),
      text: messageText || quickReplies.find(r => r.action === action)?.text || 'Selected option',
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const botResponse = getBotResponse(messageText, action)
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: botResponse.quickReplies || []
      }
      setMessages(prev => [...prev, botMessage])

      if (botResponse.redirect) {
        setTimeout(() => {
          navigate(botResponse.redirect)
          setIsOpen(false)
        }, 1200)
      }
    }, 400 + Math.random() * 200)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickReply = (action, text) => {
    handleSendMessage(text, action)
  }

  const handleNotificationClick = () => {
    setShowNotification(false)
    setIsOpen(true)
  }

  return (
    <>
      {/* Auto Notification */}
      <AnimatePresence>
        {showNotification && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="hidden md:block fixed bottom-24 right-6 z-50 pointer-events-auto"
          >
            <div className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-primary-100 p-4 rounded-2xl max-w-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-50 shadow-sm flex-shrink-0">
                  <img src="/chatbot_avatar.png" alt="AI Support" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900">Spa Concierge 🕊️</h4>
                    <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    Ready for some relaxation? I can help you **find top-rated spas** and **manage your bookings** in seconds.
                  </p>
                  <button
                    onClick={handleNotificationClick}
                    className="w-full bg-primary-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Let's Book Something!
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed md:bottom-6 bottom-20 right-6 z-50 w-16 h-16 bg-primary-600 text-white rounded-full shadow-2xl transition-all flex items-center justify-center group border-4 border-white"
        >
          <img src="/chatbot_avatar.png" className="w-full h-full object-cover rounded-full p-1" alt="" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed md:bottom-6 bottom-20 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col h-[650px] max-h-[calc(100vh-8rem)] rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-50 shadow-sm">
                  <img src="/chatbot_avatar.png" alt="AI Assistant" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight text-lg">Spa Concierge</h3>
                  <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Ready to Assist
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleQuickReply('main_menu', 'Main Menu')} className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><FaHome /></button>
                <button onClick={() => setIsOpen(false)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><FaTimes /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white scroll-smooth">
              {messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, x: message.sender === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {message.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full border border-gray-100 shadow-sm overflow-hidden flex-shrink-0">
                        <img src="/chatbot_avatar.png" alt="Bot" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col space-y-2">
                      <div className={`px-4 py-3 shadow-sm ${message.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-2xl rounded-tr-none'
                        : 'bg-gray-50 text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'
                        }`}>
                        {message.sender === 'user' ? (
                          <p className="text-sm">{message.text}</p>
                        ) : (
                          renderMessageText(message.text)
                        )}
                      </div>

                      {message.quickReplies && (
                        <div className={`flex flex-wrap gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {message.quickReplies.map((reply, idx) => (
                            <motion.button
                              whileHover={{ scale: 1.02, backgroundColor: '#fdf2f2' }}
                              key={idx}
                              onClick={() => handleQuickReply(reply.action, reply.text)}
                              className="text-xs font-bold text-primary-600 bg-white border border-primary-100 px-4 py-2 rounded-full shadow-sm transition-colors"
                            >
                              {reply.text}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start gap-3">
                  <div className="w-8 h-8 rounded-full border border-gray-100 shadow-sm overflow-hidden flex-shrink-0">
                    <img src="/chatbot_avatar.png" alt="Bot" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-none px-5 py-3 border border-gray-100">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary-400 rounded-full"></motion.div>
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary-400 rounded-full"></motion.div>
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary-400 rounded-full"></motion.div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-gray-100 rounded-b-3xl">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none resize-none max-h-32"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-30 flex items-center justify-center transition-all shadow-lg shadow-primary-200"
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot
