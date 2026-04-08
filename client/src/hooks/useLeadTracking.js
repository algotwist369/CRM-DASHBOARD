import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackLeadClick } from '../utils/analytics';

 
export const useLeadTracking = (businessId, enabled = true) => {
    const location = useLocation();
    const lastTrackedPath = useRef(null);

    useEffect(() => {
        if (!enabled || !businessId) return;

        // Prevent duplicate tracking for same path (if re-renders happen)
        // using location.href to ensure full URL is captured
        const currentUrl = window.location.href;

        // Simple check to avoid double firing on strict mode or quick re-renders
        // But allowing different query params or hash
        if (lastTrackedPath.current === currentUrl) return;

        // Track 'page_view'
        trackLeadClick(businessId, 'page_view', currentUrl);
        lastTrackedPath.current = currentUrl;

    }, [businessId, enabled, location.pathname, location.search]);
};
