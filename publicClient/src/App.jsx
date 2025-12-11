import React from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import VerifiedUserData from './pages/VerifiedUserData'
import ReviewManagementData from './pages/ReviewManagementData'
import FreeListingData from './pages/FreeListingData'
import BookDemoData from './pages/BookDemoData'
import AdertiseData from './pages/AdertiseData'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<VerifiedUserData />} />
        <Route path="/verified-user" element={<VerifiedUserData />} />
        <Route path="/review-management" element={<ReviewManagementData />} />
        <Route path="/free-listing" element={<FreeListingData />} />
        <Route path="/booki-demo" element={<BookDemoData />} />
        <Route path="/advertise-data" element={<AdertiseData />} />
      </Routes>
    </div>
  )
}

export default App