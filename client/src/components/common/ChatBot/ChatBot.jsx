import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaUser,
  FaSpinner,
  FaRobot
} from 'react-icons/fa'

const ChatBot = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [hasShownNotification, setHasShownNotification] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 Welcome to SpaAdvisor!\n\nI'm your AI assistant. I can help you with:\n\n• Free business listing\n• Online appointment booking\n• Features & pricing\n• Customer management (CRM)\n• Reviews management\n• Marketing campaigns\n• Analytics & reports\n• And much more!\n\nHow can I assist you today?",
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
    { text: 'Online Appointment Booking', action: 'appointment_booking' },
    { text: 'Features & Services', action: 'features' },
    { text: 'Pricing Plans', action: 'pricing' },
    { text: 'Reviews Management', action: 'reviews_management' },
    { text: 'Customer Management (CRM)', action: 'customer_management' },
    { text: 'Marketing & Campaigns', action: 'marketing' },
    { text: 'Analytics & Reports', action: 'analytics' },
    { text: 'Contact Support', action: 'contact' }
  ]

  const getBotResponse = (message, action = null) => {
    const lowerMessage = message.toLowerCase()

    // How to Book - Check this FIRST before general booking check
    if (action === 'how_to_book' || lowerMessage.includes('how to book') || lowerMessage.includes('how do i book') || lowerMessage.includes('steps to book') || lowerMessage.includes('booking process')) {
      return {
        text: "📝 How to Book an Appointment:\n\n1️⃣ Search → Visit /search or homepage\n2️⃣ Select Business → Click business card\n3️⃣ Choose Service → Add to cart\n4️⃣ Pick Staff → Select preferred (optional)\n5️⃣ Select Time → Choose available slot\n6️⃣ Enter Details → Name, email, phone\n7️⃣ Confirm → Get confirmation code\n\n✅ Instant confirmations + SMS reminders!\n\n🔗 Start booking: /search",
        quickReplies: [
          { text: 'Search businesses', action: 'search_businesses' },
          { text: 'Check appointment status', action: 'check_appointment' },
          { text: 'Booking features', action: 'appointment_booking' }
        ]
      }
    }

    // Business Listing
    if (action === 'business_listing' || lowerMessage.includes('list') || lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('free listing')) {
      return {
        text: "🚀 Free Business Listing - 100% FREE Forever!\n\n✨ Quick Setup:\n1. Enter company name & mobile\n2. Verify OTP\n3. Complete profile\n4. Upload docs (optional)\n5. Get activated in 24hrs\n\n💼 Perfect for: Spas • Salons • Hotels • Gyms\n\n🎯 Benefits:\n✅ Accept bookings 24/7\n✅ Manage customers & staff\n✅ Reviews management\n✅ Analytics & reports\n✅ Marketing campaigns\n\n🔗 Get started: /free-listing",
        quickReplies: [
          { text: 'Start listing now', action: 'start_listing' },
          { text: 'What documents needed?', action: 'documents' },
          { text: 'Benefits of listing', action: 'listing_benefits' }
        ]
      }
    }

    // Appointment Booking - General features (but NOT "how to book" which is handled above)
    // Only match if it's NOT asking "how to book" - that's handled in the check above
    if (action === 'appointment_booking' || 
        (lowerMessage.includes('book') && !lowerMessage.includes('how to') && !lowerMessage.includes('how do')) || 
        (lowerMessage.includes('appointment') && !lowerMessage.includes('how to') && !lowerMessage.includes('how do')) || 
        (lowerMessage.includes('schedule') && !lowerMessage.includes('how')) || 
        (lowerMessage.includes('booking') && !lowerMessage.includes('how to') && !lowerMessage.includes('how do'))) {
      return {
        text: "📅 Online Appointment Booking System\n\n✨ Key Features:\n• 24/7 booking availability\n• Location-based search\n• Real-time calendar\n• Multi-staff scheduling\n• Automated SMS/Email reminders\n• Easy reschedule & cancel\n\n🎯 For Customers:\nSearch → Select → Book → Get reminders!\n\n🎯 For Businesses:\nAccept bookings 24/7 • Reduce no-shows • Track history\n\n🔗 Search businesses: /search\n🔗 Check appointment: /check-appointment",
        quickReplies: [
          { text: 'How to book an appointment?', action: 'how_to_book' },
          { text: 'For businesses', action: 'booking_for_business' },
          { text: 'Reminders & notifications', action: 'reminders' }
        ]
      }
    }

    // Features
    if (action === 'features' || lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('capabilities')) {
      return {
        text: "🌟 Complete Business Management Platform\n\n📊 Core Features:\n\n1️⃣ Appointments → 24/7 booking • Real-time calendar • Auto reminders\n2️⃣ CRM → Customer database • Segmentation • Loyalty programs\n3️⃣ Staff → Multi-staff • Role-based access • Performance tracking\n4️⃣ Reviews → Google • Facebook • Yelp • TripAdvisor management\n5️⃣ Marketing → Email/SMS campaigns • Automation • Analytics\n6️⃣ Analytics → Revenue • Customer insights • Custom reports\n7️⃣ More → Invoices • Expenses • Inventory • Payments\n\n🔗 View all features: /features\n🔗 Get started free: /free-listing",
        quickReplies: [
          { text: 'Appointment features', action: 'appointment_booking' },
          { text: 'Reviews management', action: 'reviews_management' },
          { text: 'CRM features', action: 'customer_management' },
          { text: 'Marketing features', action: 'marketing' },
          { text: 'Analytics features', action: 'analytics' }
        ]
      }
    }

    // Pricing
    if (action === 'pricing' || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('plan')) {
      return {
        text: "💰 Simple & Transparent Pricing\n\n🎁 Starter: FREE Forever\n• 50 appointments/month • Basic CRM • Email support\n\n💼 Professional: $29/month\n• Unlimited appointments • Advanced CRM • Marketing\n• Reviews management • Analytics • API access\n\n🏢 Enterprise: Custom\n• Everything + Dedicated manager • 24/7 support\n• Custom integrations • Multi-location\n\n✅ No setup fees • Cancel anytime • 30-day guarantee\n\n🔗 View pricing: /pricing\n🔗 Start free: /free-listing\n🔗 Book demo: /book-demo",
        quickReplies: [
          { text: 'Start free listing', action: 'start_listing' },
          { text: 'View pricing page', action: 'view_pricing' },
          { text: 'Book a demo', action: 'book_demo' }
        ]
      }
    }

    // Customer Management
    if (action === 'customer_management' || lowerMessage.includes('customer') || lowerMessage.includes('crm') || lowerMessage.includes('client')) {
      return {
        text: "👥 Complete CRM System\n\n✨ Key Features:\n• Customer Database → Profiles • History • Notes\n• Segmentation → Group by behavior • Target campaigns\n• Analytics → CLV • Retention • Spending patterns\n• Loyalty Programs → Points • Rewards • Memberships\n• Insights → Behavior tracking • Engagement metrics\n• History → Appointments • Transactions • Reviews\n\n🎯 Perfect for spas, salons, hotels, gyms!\n\n🔗 Get started: /free-listing",
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
        text: "📢 Marketing & Campaign Management\n\n🎯 Campaign Types:\nPromotional • Seasonal • Loyalty • Birthday • Referral • Review requests\n\n📧 Channels:\nEmail • SMS • Push notifications • Auto reminders\n\n🤖 Automation:\nDrip campaigns • Trigger-based • Scheduled • Event-triggered\n\n📊 Analytics:\nOpen rates • Click rates • Conversion • ROI tracking\n\n🎨 Templates:\nPre-built • Custom • Personalized • Multi-channel\n\n🚀 Grow your business with targeted campaigns!\n\n🔗 Get started: /free-listing",
        quickReplies: [
          { text: 'Campaign templates', action: 'templates' },
          { text: 'Campaign analytics', action: 'campaign_analytics' },
          { text: 'Automated campaigns', action: 'automated_campaigns' }
        ]
      }
    }

    // Analytics
    if (action === 'analytics' || lowerMessage.includes('analytics') || lowerMessage.includes('report') || lowerMessage.includes('statistics') || lowerMessage.includes('insights')) {
      return {
        text: "📊 Business Intelligence & Analytics\n\n📈 Key Metrics:\n• Revenue → Daily/weekly/monthly • Service-wise • Staff performance\n• Appointments → Trends • No-shows • Peak hours • Conversion\n• Customers → CLV • Retention • Segmentation • Behavior\n• Staff → Performance • Booking rates • Revenue per staff\n• Daily Records → Operations • Closure • Performance\n• Reports → Custom • Export PDF/Excel • Scheduled\n\n📱 Real-time Dashboard:\nLive metrics • Charts • Insights • Trends • Comparisons\n\n🎯 Make data-driven decisions!\n\n🔗 Get started: /free-listing",
        quickReplies: [
          { text: 'Revenue analytics', action: 'revenue_analytics' },
          { text: 'Customer insights', action: 'customer_analytics' },
          { text: 'Daily business records', action: 'daily_business' }
        ]
      }
    }

    // Reviews Management
    if (action === 'reviews_management' || lowerMessage.includes('review') || lowerMessage.includes('rating') || lowerMessage.includes('feedback')) {
      return {
        text: "⭐ Unified Reviews Management\n\n🌟 Platforms:\n• Google My Business → Boost SEO • Improve rankings\n• Facebook → Build social proof • Quick responses\n• Yelp → Improve ratings • Professional replies\n• TripAdvisor → Enhance reputation • Traveler engagement\n\n✨ Features:\n• Unified inbox • Auto review requests • Response templates\n• Analytics • Performance tracking • Sentiment analysis\n\n📊 Benefits:\n↑ Review volume • ↑ Ratings • Faster responses • Better reputation\n\n🔗 Google Reviews: /google-my-business-reviews\n🔗 Facebook: /facebook-reviews\n🔗 Yelp: /yelp-reviews\n🔗 TripAdvisor: /tripadvisor-reviews\n🔗 All Reviews: /reviews-management",
        quickReplies: [
          { text: 'Google My Business', action: 'gmb_reviews' },
          { text: 'Facebook Reviews', action: 'facebook_reviews' },
          { text: 'Yelp Reviews', action: 'yelp_reviews' },
          { text: 'TripAdvisor Reviews', action: 'tripadvisor_reviews' }
        ]
      }
    }

    // Google My Business Reviews
    if (action === 'gmb_reviews' || lowerMessage.includes('google') || lowerMessage.includes('gmb')) {
      return {
        text: "🔍 Google My Business Reviews\n\n✨ Features:\n• Unified GMB management • Auto review requests\n• Response templates • Analytics • Local SEO\n\n📈 Benefits:\n↑ Star ratings • ↑ Listing views • Faster responses\n\n🔗 Visit: /google-my-business-reviews",
        quickReplies: [
          { text: 'All reviews platforms', action: 'reviews_management' },
          { text: 'View reviews page', action: 'view_gmb_reviews' }
        ]
      }
    }

    // Facebook Reviews
    if (action === 'facebook_reviews' || lowerMessage.includes('facebook')) {
      return {
        text: "📘 Facebook Reviews Management\n\n✨ Features:\n• Centralized management • Quick responses • Analytics\n• Social proof building\n\n🔗 Visit: /facebook-reviews",
        quickReplies: [
          { text: 'All reviews platforms', action: 'reviews_management' },
          { text: 'View reviews page', action: 'view_facebook_reviews' }
        ]
      }
    }

    // Yelp Reviews
    if (action === 'yelp_reviews' || lowerMessage.includes('yelp')) {
      return {
        text: "⭐ Yelp Reviews Management\n\n✨ Features:\n• Review management • Improve ratings\n• Professional responses • Insights\n\n🔗 Visit: /yelp-reviews",
        quickReplies: [
          { text: 'All reviews platforms', action: 'reviews_management' },
          { text: 'View reviews page', action: 'view_yelp_reviews' }
        ]
      }
    }

    // TripAdvisor Reviews
    if (action === 'tripadvisor_reviews' || lowerMessage.includes('tripadvisor') || lowerMessage.includes('trip advisor')) {
      return {
        text: "✈️ TripAdvisor Reviews Management\n\n✨ Features:\n• Manage reviews • Enhance reputation\n• Respond to travelers • Analytics\n\n🔗 Visit: /tripadvisor-reviews",
        quickReplies: [
          { text: 'All reviews platforms', action: 'reviews_management' },
          { text: 'View reviews page', action: 'view_tripadvisor_reviews' }
        ]
      }
    }

    // Contact/Support
    if (action === 'contact' || lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return {
        text: "📞 We're Here to Help!\n\n🕐 Support: 24/7 Available\n\n📱 Contact:\n• Email: dishaspaadvisor@gmail.com\n• Live Chat: Right here! 😊\n• Book Demo: /book-demo\n\n💬 We Help With:\nTechnical support • Setup • Features • Billing • Integrations\n\n⏱️ Response:\nLive Chat: Instant • Email: 24hrs • Demo: Schedule anytime\n\n🔗 Contact page: /contact\n🔗 Book demo: /book-demo",
        quickReplies: [
          { text: 'Technical support', action: 'technical' },
          { text: 'Setup help', action: 'setup_help' },
          { text: 'Visit contact page', action: 'visit_contact' },
          { text: 'Book a demo', action: 'book_demo' }
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
        text: "🚀 Get Your Business Listed - FREE!\n\n📋 Quick Steps:\n1. Enter company name & mobile\n2. Verify OTP\n3. Complete profile\n4. Upload docs (optional)\n5. Get activated in 24hrs\n\n✅ You'll Need:\nCompany name • Mobile • Email • Address • Category • Services\n\n💡 Benefits:\n✅ 100% FREE forever\n✅ Accept bookings 24/7\n✅ Manage customers & staff\n✅ Reviews management\n✅ Analytics & reports\n\n🔗 Start now: /free-listing\n\nNeed help? Just ask! 😊",
        quickReplies: [
          { text: 'Registration help', action: 'registration_help' },
          { text: 'What documents needed?', action: 'documents' },
          { text: 'Benefits of listing', action: 'listing_benefits' }
        ]
      }
    }

    // Documents
    if (action === 'documents' || lowerMessage.includes('document') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      return {
        text: "📄 Document Upload for Free Listing (Optional)\n\n📋 Documents You Can Upload:\n• Business registration certificate\n• Business license documents\n• GST certificate\n• PAN card\n• Trade license\n• Other business verification documents\n\n✅ Supported File Formats:\n• PDF files (.pdf)\n• Word documents (.doc, .docx)\n• Image files (.jpg, .jpeg, .png)\n• Maximum file size: 10MB per file\n\n💡 Benefits of Uploading Documents:\n• Faster verification & approval\n• Build customer trust\n• Complete business profile\n• Enhanced credibility\n• Quicker team activation\n\n⚠️ Note: Documents are optional but highly recommended for faster approval and better business credibility!\n\nYou can always add documents later from your business dashboard.",
        quickReplies: [
          { text: 'Back to listing info', action: 'business_listing' },
          { text: 'Start listing now', action: 'start_listing' }
        ]
      }
    }

    // Listing Benefits
    if (action === 'listing_benefits' || lowerMessage.includes('benefit') || lowerMessage.includes('advantage') || lowerMessage.includes('why list')) {
      return {
        text: "✨ Benefits of Listing Your Business on SpaAdvisor:\n\n🚀 Growth & Visibility:\n• Get discovered by customers searching for services\n• Location-based search visibility\n• Professional business profile\n• Online presence & credibility\n\n📅 Booking Management:\n• Accept online bookings 24/7\n• Reduce phone call bookings\n• Automated appointment reminders\n• Calendar management\n• Multi-staff scheduling\n\n👥 Customer Management:\n• Complete CRM system\n• Customer database & history\n• Customer segmentation\n• Loyalty programs\n• Customer insights\n\n⭐ Reviews & Reputation:\n• Manage reviews from Google, Facebook, Yelp, TripAdvisor\n• Automated review requests\n• Improve online reputation\n• Build customer trust\n\n📊 Business Intelligence:\n• Revenue analytics\n• Performance reports\n• Customer insights\n• Staff analytics\n• Daily business records\n\n💰 Cost Effective:\n• 100% FREE forever plan available\n• No setup fees\n• Transparent pricing\n• Cancel anytime\n\nPerfect for spas, salons, hotels, gyms, and service businesses!",
        quickReplies: [
          { text: 'Start listing now', action: 'start_listing' },
          { text: 'View pricing', action: 'pricing' },
          { text: 'Book a demo', action: 'book_demo' }
        ]
      }
    }

    // Book Demo
    if (action === 'book_demo' || lowerMessage.includes('demo') || lowerMessage.includes('schedule demo')) {
      return {
        text: "📅 Book a Demo\n\n🎯 What You'll Get:\n• 30-min strategy call\n• Live walkthrough\n• Personalized plan\n• Success stories\n• Dedicated advisor\n\n✨ Perfect for: Spas • Salons • Hotels • Gyms\n\n🔗 Book now: /book-demo",
        quickReplies: [
          { text: 'Book demo now', action: 'view_book_demo' },
          { text: 'Learn more', action: 'features' }
        ]
      }
    }

    // Check Appointment
    if (action === 'check_appointment' || lowerMessage.includes('check appointment') || lowerMessage.includes('appointment status')) {
      return {
        text: "🔍 Check Appointment Status\n\n✅ You Can:\n• View details • Service & staff info\n• Reschedule • Cancel • Contact business\n\n🔗 Check now: /check-appointment\n\nEnter your confirmation code to view your appointment!",
        quickReplies: [
          { text: 'Check appointment', action: 'view_check_appointment' },
          { text: 'Contact support', action: 'contact' }
        ]
      }
    }

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage === '') {
      return {
        text: "Hello! 👋 Welcome to SpaAdvisor!\n\nI'm your AI assistant. I can help with:\n\n✅ Free business listing\n✅ Online appointment booking\n✅ Reviews management\n✅ CRM & Marketing\n✅ Analytics & Reports\n\n🚀 Complete platform for spas, salons, hotels, gyms!\n\n🔗 Get started free: /free-listing\n🔗 Search businesses: /search\n🔗 View features: /features\n\nWhat would you like to know?",
        quickReplies: quickReplies.slice(0, 5)
      }
    }

    // Thank you
    if (lowerMessage.includes('thank')) {
      return {
        text: "You're very welcome! 😊\n\nI'm here to help you with SpaAdvisor anytime. Is there anything else you'd like to know?\n\nRemember:\n• Free listing: /free-listing\n• Book demo: /book-demo\n• Contact: /contact\n• Features: /features\n• Pricing: /pricing",
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
      setTimeout(() => navigate('/search'), 500)
      return {
        text: "Taking you to search businesses... 🔍",
        quickReplies: []
      }
    }

    if (action === 'view_book_demo') {
      setTimeout(() => navigate('/book-demo'), 500)
      return {
        text: "Taking you to book a demo... 📅",
        quickReplies: []
      }
    }

    if (action === 'view_check_appointment') {
      setTimeout(() => navigate('/check-appointment'), 500)
      return {
        text: "Taking you to check appointment... 🔍",
        quickReplies: []
      }
    }

    if (action === 'view_gmb_reviews') {
      setTimeout(() => navigate('/google-my-business-reviews'), 500)
      return {
        text: "Taking you to Google My Business Reviews... 🔍",
        quickReplies: []
      }
    }

    if (action === 'view_facebook_reviews') {
      setTimeout(() => navigate('/facebook-reviews'), 500)
      return {
        text: "Taking you to Facebook Reviews... 📘",
        quickReplies: []
      }
    }

    if (action === 'view_yelp_reviews') {
      setTimeout(() => navigate('/yelp-reviews'), 500)
      return {
        text: "Taking you to Yelp Reviews... ⭐",
        quickReplies: []
      }
    }

    if (action === 'view_tripadvisor_reviews') {
      setTimeout(() => navigate('/tripadvisor-reviews'), 500)
      return {
        text: "Taking you to TripAdvisor Reviews... ✈️",
        quickReplies: []
      }
    }

    // Default response
    return {
      text: `I understand you're asking about: "${message}"\n\nI can help with SpaAdvisor:\n\n• Free listing • Online booking • Reviews management\n• CRM • Marketing • Analytics • Pricing\n• Staff • Daily records • Expenses • Loyalty\n\n🚀 Perfect for spas, salons, hotels, gyms!\n\n🔗 Quick links:\n/free-listing • /search • /features • /pricing • /contact\n\nSelect a topic above or ask a specific question!`,
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
        <div className="hidden md:block fixed bottom-24 right-6 z-50 animate-slide-up">
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
                  I'm SpaAdvisor, your AI assistant! I can help you with free business listing, online appointments, reviews management, features, pricing, and more.
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
          className="fixed md:bottom-6 bottom-20 right-6 z-50 w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
          aria-label="Open chat"
        >
          {/* <FaRobot  className="text-2xl" /> */}
          <img src="https://reductress.com/wp-content/uploads/2019/06/petite-woman-1-820x500.jpg" className="w-full h-full object-cover rounded-full p-[2px]" alt="" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed md:bottom-6 bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white  shadow-2xl flex flex-col h-[600px] max-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30">
                <img src="/chatbot_avatar.png" alt="AI Assistant" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg">SpaAdvisor Assistant</h3>
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
