import leadService from '../services/public/leadService'

export const trackLeadClick = (businessId, leadType, pageName = null) => {
    if (!businessId) {
        console.warn('trackLeadClick: Missing businessId')
        return
    }

    const page = pageName || window.location.href
    leadService.trackClick(businessId, leadType, page)
}
