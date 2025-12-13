import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class LeadService {
    /**
     * Track a lead click (Call, WhatsApp, Booking)
     * Fire-and-forget: we don't return the promise to avoid blocking UI
     * @param {string} businessId
     * @param {string} leadType - 'call' | 'whatsapp' | 'booking'
     * @param {string} page - Current page path
     */
    trackClick(businessId, leadType, page) {
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
                    page
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
