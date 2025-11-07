import React from 'react'
import { Navigate } from 'react-router-dom'

// Redirect to business settings - managers don't need businessId in URL
const ManagerSettings = () => {
  return <Navigate to="/manager/business-settings" replace />
}

export default ManagerSettings