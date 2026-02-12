import leadService from '../services/public/leadService'

export const trackLeadClick = (businessId, leadType, pageName = null) => {
    if (!businessId) {
        console.warn('trackLeadClick: Missing businessId')
        return
    }

    const page = pageName || window.location.href

    // Get tracking data from localStorage
    let tracking = null;
    try {
        const stored = localStorage.getItem('crm_traffic_source');
        if (stored) tracking = JSON.parse(stored);
    } catch (e) {
        // Ignore error
    }

    leadService.trackClick(businessId, leadType, page, tracking)
}
