import leadService from '../services/public/leadService'

/**
 * Helper to track lead clicks safely.
 * @param {string} businessId 
 * @param {string} leadType - 'call' | 'whatsapp' | 'booking'
 * @param {string} pageName - Optional override, defaults to window.location.pathname
 */
export const trackLeadClick = (businessId, leadType, pageName = null) => {
    if (!businessId) {
        console.warn('trackLeadClick: Missing businessId')
        return
    }

    const page = pageName || window.location.href
    leadService.trackClick(businessId, leadType, page)
}
