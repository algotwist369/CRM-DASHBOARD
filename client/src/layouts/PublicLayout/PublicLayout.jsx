import React from 'react'
import { Outlet } from 'react-router-dom'
import { PublicHeader, PublicFooter } from './components'
import { ChatBot } from '../../components'
import { useTrafficSource } from '../../hooks/useTrafficSource'

const PublicLayout = () => {
  useTrafficSource() // Initialize traffic source tracking
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <PublicFooter />

      {/* ChatBot */}
      <ChatBot />
    </div>
  )
}

export default PublicLayout
