import apiClient from './client'
import { endpoints } from '../../constants/api/endpoints'

class LeadService {

    trackClick(businessId, leadType, page, tracking = null) {
        if (!businessId || !leadType) return

        // use native fetch with keepalive: true to ensure request completes even if page unloads/navigates
        // This solves the issue of missing "Booking" clicks which trigger immediate navigation
        try {
            fetch(endpoints.leads.track, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessId,
                    leadType,
                    page,
                    tracking
                }),
                keepalive: true
            }).catch(err => {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Lead tracking failed (fetch):', err)
                }
            })
        } catch (error) {
            console.error('Lead tracking error:', error)
        }
    }
}

export default new LeadService()
