import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaUser,
  FaSpinner,
} from 'react-icons/fa'

const ChatBot = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [hasShownNotification, setHasShownNotification] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 I'm your AI assistant. I can help you with:\n\n• Free business listing\n• Appointment booking\n• Features & pricing\n• Customer management\n• Marketing campaigns\n• And much more!\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
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
      }, 10000) // 10 seconds

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
    { text: 'Free Business Listing', action: 'business_listing' },
    { text: 'Appointment Booking', action: 'appointment_booking' },
    { text: 'Features & Services', action: 'features' },
    { text: 'Pricing Plans', action: 'pricing' },
    { text: 'Customer Management', action: 'customer_management' },
    { text: 'Marketing & Campaigns', action: 'marketing' },
    { text: 'Analytics & Reports', action: 'analytics' },
    { text: 'Contact Support', action: 'contact' }
  ]

  const getBotResponse = (message, action = null) => {
    const lowerMessage = message.toLowerCase()

    // Business Listing
    if (action === 'business_listing' || lowerMessage.includes('list') || lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('free listing')) {
      return {
        text: "🚀 Free Business Listing - Get Started in Minutes!\n\n✅ 100% FREE - No charges ever\n✅ Quick 2-step registration\n✅ OTP verification\n✅ Complete business profile\n✅ Document upload (optional)\n✅ Team connects within 24 hours\n\n📋 Process:\n1. Click 'Free Listing' in header\n2. Enter company name & mobile\n3. Verify OTP\n4. Fill business details form\n5. Upload documents (optional)\n6. Submit & wait for activation\n\nReady to list your business?",
        quickReplies: [
          { text: 'Start listing now', action: 'start_listing' },
          { text: 'What documents needed?', action: 'documents' },
          { text: 'Benefits of listing', action: 'listing_benefits' }
        ]
      }
    }

    // Appointment Booking
    if (action === 'appointment_booking' || lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('booking')) {
      return {
        text: "📅 Online Appointment Booking System\n\n✨ Features:\n• 24/7 online booking\n• Real-time availability\n• Multi-staff scheduling\n• Service selection\n• Time slot booking\n• Customer information capture\n• Automated confirmations\n• SMS & Email reminders\n• Reschedule & cancel options\n\n🎯 For Customers:\n• Search businesses\n• Select services\n• Choose staff & time\n• Book instantly\n• Get reminders\n\n🎯 For Businesses:\n• Accept bookings 24/7\n• Reduce no-shows\n• Manage calendar\n• Track appointments\n\nWant to know more?",
        quickReplies: [
          { text: 'How to book?', action: 'how_to_book' },
          { text: 'For businesses', action: 'booking_for_business' },
          { text: 'Reminders & notifications', action: 'reminders' }
        ]
      }
    }

    // Features
    if (action === 'features' || lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('capabilities')) {
      return {
        text: "🌟 Complete Business Management Platform\n\n📊 Core Features:\n\n1️⃣ Appointment Management\n• Online booking 24/7\n• Calendar integration\n• Multi-staff scheduling\n• Automated reminders\n• Waitlist management\n\n2️⃣ Customer Management (CRM)\n• Customer database\n• History tracking\n• Segmentation\n• Loyalty programs\n• Customer insights\n\n3️⃣ Staff Management\n• Add multiple staff\n• Role-based access\n• Schedule management\n• Performance tracking\n\n4️⃣ Marketing & Campaigns\n• Email campaigns\n• SMS marketing\n• Automated campaigns\n• Customer targeting\n• Promotional offers\n\n5️⃣ Analytics & Reports\n• Revenue analytics\n• Customer insights\n• Performance metrics\n• Custom reports\n• Trend analysis\n\n6️⃣ Payment Integration\n• Online payments\n• Multiple gateways\n• Invoice generation\n• Transaction tracking\n\n7️⃣ Notifications\n• Email notifications\n• SMS alerts\n• Push notifications\n• Automated reminders\n\nWhich feature interests you?",
        quickReplies: [
          { text: 'Appointment features', action: 'appointment_booking' },
          { text: 'CRM features', action: 'customer_management' },
          { text: 'Marketing features', action: 'marketing' },
          { text: 'Analytics features', action: 'analytics' }
        ]
      }
    }

    // Pricing
    if (action === 'pricing' || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('plan')) {
      return {
        text: "💰 Transparent Pricing - 100% FREE!\n\n🎁 Free Forever Plan:\n✅ Unlimited appointments\n✅ Unlimited customers\n✅ Staff management\n✅ Basic analytics\n✅ Email support\n✅ Mobile app access\n✅ Online booking\n✅ Automated reminders\n\n💼 Professional Plan: $29/month\n✅ Everything in Free\n✅ Advanced analytics\n✅ Priority support\n✅ Payment integration\n✅ Custom branding\n✅ API access\n\n🏢 Enterprise Plan: Custom\n✅ Everything in Professional\n✅ Dedicated manager\n✅ 24/7 phone support\n✅ Custom integrations\n✅ Multi-location\n✅ Advanced security\n\n💡 No setup fees, no hidden costs!\n\nWhich plan suits you?",
        quickReplies: [
          { text: 'Start free listing', action: 'start_listing' },
          { text: 'View pricing page', action: 'view_pricing' },
          { text: 'Compare plans', action: 'compare_plans' }
        ]
      }
    }

    // Customer Management
    if (action === 'customer_management' || lowerMessage.includes('customer') || lowerMessage.includes('crm') || lowerMessage.includes('client')) {
      return {
        text: "👥 Customer Relationship Management (CRM)\n\n📋 Features:\n\n• Customer Database\n  - Complete profiles\n  - Contact information\n  - Preferences & history\n\n• Customer Segmentation\n  - Group by behavior\n  - Target campaigns\n  - Personalized offers\n\n• Customer Analytics\n  - Lifetime value\n  - Visit frequency\n  - Spending patterns\n  - Churn analysis\n\n• Loyalty Programs\n  - Points system\n  - Rewards management\n  - Subscription plans\n\n• Customer Insights\n  - Behavior tracking\n  - Engagement metrics\n  - Satisfaction scores\n\n• Interaction History\n  - Appointment history\n  - Transaction records\n  - Communication logs\n\nWant details on any specific feature?",
        quickReplies: [
          { text: 'Loyalty programs', action: 'loyalty' },
          { text: 'Customer analytics', action: 'customer_analytics' },
          { text: 'Segmentation', action: 'segmentation' }
        ]
      }
    }

    // Marketing
    if (action === 'marketing' || lowerMessage.includes('marketing') || lowerMessage.includes('campaign') || lowerMessage.includes('promote') || lowerMessage.includes('advertise')) {
      return {
        text: "📢 Marketing & Campaign Management\n\n🎯 Campaign Types:\n• Promotional campaigns\n• Seasonal offers\n• Loyalty programs\n• Birthday campaigns\n• Referral programs\n• Feedback requests\n• Reactivation campaigns\n\n📧 Channels:\n• Email marketing\n• SMS campaigns\n• WhatsApp messages\n• Push notifications\n• In-app notifications\n\n🤖 Automated Campaigns:\n• Drip campaigns\n• Trigger-based\n• Scheduled campaigns\n• Event-triggered\n\n📊 Campaign Analytics:\n• Open rates\n• Click rates\n• Conversion tracking\n• ROI analysis\n• A/B testing\n\n🎨 Templates:\n• Pre-built templates\n• Custom templates\n• Personalization\n• Dynamic content\n\nNeed help with campaigns?",
        quickReplies: [
          { text: 'Create campaign', action: 'create_campaign' },
          { text: 'Campaign templates', action: 'templates' },
          { text: 'Campaign analytics', action: 'campaign_analytics' }
        ]
      }
    }

    // Analytics
    if (action === 'analytics' || lowerMessage.includes('analytics') || lowerMessage.includes('report') || lowerMessage.includes('statistics') || lowerMessage.includes('insights')) {
      return {
        text: "📊 Analytics & Business Intelligence\n\n📈 Key Metrics:\n\n• Revenue Analytics\n  - Daily/weekly/monthly\n  - Service-wise revenue\n  - Staff performance\n  - Trend analysis\n\n• Appointment Analytics\n  - Booking trends\n  - No-show rates\n  - Peak hours\n  - Service popularity\n\n• Customer Analytics\n  - Customer lifetime value\n  - Retention rates\n  - New vs returning\n  - Customer segments\n\n• Staff Analytics\n  - Performance metrics\n  - Booking rates\n  - Revenue per staff\n  - Availability\n\n• Business Reports\n  - Custom reports\n  - Export options\n  - Scheduled reports\n  - Dashboard widgets\n\n📱 Real-time Dashboard:\n• Live metrics\n• Visual charts\n• Quick insights\n• Trend indicators\n\nWant to see sample reports?",
        quickReplies: [
          { text: 'Revenue analytics', action: 'revenue_analytics' },
          { text: 'Customer insights', action: 'customer_analytics' },
          { text: 'Custom reports', action: 'custom_reports' }
        ]
      }
    }

    // Contact/Support
    if (action === 'contact' || lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return {
        text: "📞 We're Here to Help!\n\n🕐 Support Hours: 24/7\n\n📱 Contact Options:\n• Phone: +91-XXXXX-XXXXX\n• Email: support@bookingapp.com\n• Live Chat: Right here! 😊\n• Contact Page: /contact\n\n💬 Support Channels:\n• Technical support\n• Business setup help\n• Feature guidance\n• Billing inquiries\n• General questions\n\n⏱️ Response Times:\n• Chat: Instant\n• Email: Within 24 hours\n• Phone: Immediate\n\n🎯 Common Support Topics:\n• Account setup\n• Feature tutorials\n• Troubleshooting\n• Billing questions\n• Integration help\n\nHow can we assist you?",
        quickReplies: [
          { text: 'Technical support', action: 'technical' },
          { text: 'Setup help', action: 'setup_help' },
          { text: 'Visit contact page', action: 'visit_contact' }
        ]
      }
    }

    // How to Book
    if (action === 'how_to_book' || lowerMessage.includes('how to book') || lowerMessage.includes('book appointment')) {
      return {
        text: "📝 How to Book an Appointment:\n\nStep 1: Search Business\n• Use search bar on homepage\n• Filter by location, category\n• Browse business listings\n\nStep 2: Select Business\n• Click on business card\n• View business details\n• Check services & reviews\n\nStep 3: Choose Service\n• Select service(s)\n• View pricing & duration\n• Add to booking\n\nStep 4: Select Staff (Optional)\n• Choose preferred staff\n• Or let business assign\n\nStep 5: Pick Time Slot\n• View available slots\n• Select date & time\n• Confirm selection\n\nStep 6: Enter Details\n• Customer information\n• Contact details\n• Special requests\n\nStep 7: Confirm Booking\n• Review details\n• Confirm appointment\n• Get confirmation code\n\n✅ You'll receive:\n• Confirmation email\n• SMS reminder\n• Calendar invite\n\nReady to book?",
        quickReplies: [
          { text: 'Search businesses', action: 'search_businesses' },
          { text: 'Booking tips', action: 'booking_tips' }
        ]
      }
    }

    // Loyalty Programs
    if (action === 'loyalty' || lowerMessage.includes('loyalty') || lowerMessage.includes('reward') || lowerMessage.includes('points')) {
      return {
        text: "🎁 Loyalty & Rewards Program\n\n⭐ Features:\n\n• Points System\n  - Earn on appointments\n  - Redeem for services\n  - Points expiry management\n\n• Reward Plans\n  - Tiered rewards\n  - Custom plans\n  - Subscription rewards\n\n• Customer Benefits\n  - Exclusive offers\n  - Birthday rewards\n  - Referral bonuses\n  - Anniversary gifts\n\n• Analytics\n  - Points tracking\n  - Redemption rates\n  - Customer engagement\n\n• Automation\n  - Auto points calculation\n  - Reward notifications\n  - Expiry reminders\n\n💡 Benefits:\n• Increase retention\n• Boost referrals\n• Customer engagement\n• Repeat bookings\n\nWant to set up loyalty program?",
        quickReplies: [
          { text: 'How it works', action: 'loyalty_how' },
          { text: 'Set up program', action: 'setup_loyalty' }
        ]
      }
    }

    // Start Listing
    if (action === 'start_listing') {
      return {
        text: "🚀 Great! Let's get you started!\n\nClick the 'Free Listing' button in the header, or visit /free-listing\n\nI'll guide you through:\n• Registration process\n• OTP verification\n• Business details form\n• Document upload\n\nNeed help during registration? Just ask! 😊",
        quickReplies: [
          { text: 'Registration help', action: 'registration_help' },
          { text: 'What info needed?', action: 'listing_info' }
        ]
      }
    }

    // Documents
    if (action === 'documents' || lowerMessage.includes('document') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      return {
        text: "📄 Document Upload (Optional)\n\nYou can upload:\n• Business registration\n• License documents\n• GST certificate\n• PAN card\n• Other business docs\n\n📋 Supported Formats:\n• PDF, DOC, DOCX\n• JPG, PNG images\n• Max 10MB per file\n\n✅ Benefits:\n• Faster verification\n• Trust building\n• Complete profile\n\nNote: Documents are optional but recommended for faster approval!",
        quickReplies: [
          { text: 'Back to listing', action: 'business_listing' }
        ]
      }
    }

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage === '') {
      return {
        text: "Hello! 👋 Welcome!\n\nI'm your AI assistant. I can help with:\n\n✅ Free business listing\n✅ Appointment booking\n✅ Features & services\n✅ Pricing information\n✅ Customer management\n✅ Marketing campaigns\n✅ Analytics & reports\n✅ Technical support\n\nWhat would you like to know?",
        quickReplies: quickReplies.slice(0, 4)
      }
    }

    // Thank you
    if (lowerMessage.includes('thank')) {
      return {
        text: "You're very welcome! 😊\n\nIs there anything else I can help you with today?",
        quickReplies: quickReplies.slice(0, 4)
      }
    }

    // Navigation actions
    if (action === 'view_pricing') {
      setTimeout(() => navigate('/pricing'), 500)
      return {
        text: "Taking you to the pricing page... 💰",
        quickReplies: []
      }
    }

    if (action === 'visit_contact') {
      setTimeout(() => navigate('/contact'), 500)
      return {
        text: "Taking you to the contact page... 📞",
        quickReplies: []
      }
    }

    if (action === 'search_businesses') {
      setTimeout(() => navigate('/'), 500)
      return {
        text: "Taking you to the homepage to search businesses... 🔍",
        quickReplies: []
      }
    }

    // Default response
    return {
      text: `I understand you're asking about: "${message}"\n\nI can help you with:\n\n• Free business listing\n• Appointment booking system\n• Customer management (CRM)\n• Marketing campaigns\n• Analytics & reports\n• Pricing & plans\n• Staff management\n• Payment integration\n• Loyalty programs\n• Technical support\n\nPlease select a topic or ask a specific question!`,
      quickReplies: quickReplies
    }
  }

  const handleSendMessage = (text = null, action = null) => {
    const messageText = text || inputValue.trim()
    if (!messageText && !action) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageText || quickReplies.find(r => r.action === action)?.text || 'Selected option',
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Show typing indicator
    setIsTyping(true)

    // Simulate bot response delay
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
      {showNotification && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-slide-up">
          <div className="bg-white  shadow-2xl border-2 border-primary-200 p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary-100">
                <img src="/chatbot_avatar.png" alt="AI Support" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-gray-900 text-sm">Need Help? 🤔</h4>
                  <button
                    onClick={() => setShowNotification(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  I'm SpaAdvisor, your AI assistant! I can help you with business listing, appointments, features, and more.
                </p>
                <button
                  onClick={handleNotificationClick}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-semibold py-2 px-4  hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2"
                >
                  <FaComments />
                  <span>Chat with SpaAdvisor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
          aria-label="Open chat"
        >
          <FaComments className="text-2xl" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white  shadow-2xl flex flex-col h-[600px] max-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30">
                <img src="/chatbot_avatar.png" alt="AI Assistant" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-xs text-primary-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${message.sender === 'user' ? 'bg-primary-600' : 'border border-gray-200'
                    }`}>
                    {message.sender === 'user' ? (
                      <FaUser className="text-white text-sm" />
                    ) : (
                      <img src="/chatbot_avatar.png" alt="Bot" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className={` px-4 py-2 ${message.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-white text-gray-900 rounded-tl-sm '
                      }`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                    {message.quickReplies && message.quickReplies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.quickReplies.map((reply, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickReply(reply.action, reply.text)}
                            className="text-xs bg-white border border-primary-200 text-primary-600 px-3 py-1.5 rounded-full hover:bg-primary-50 transition-colors"
                          >
                            {reply.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                    <img src="/chatbot_avatar.png" alt="Bot" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white  rounded-tl-sm px-4 py-3 ">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full px-4 py-2.5 pr-12 border-2 border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none max-h-32"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="w-11 h-11 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Send message"
              >
                {isTyping ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default ChatBot
