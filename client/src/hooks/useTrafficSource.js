import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'crm_traffic_source';

export const useTrafficSource = () => {
    const location = useLocation();

    useEffect(() => {
        try {
            // First-Touch Attribution with specific Source Upgrading
            const existingRaw = localStorage.getItem(STORAGE_KEY);
            let existingSource = null;
            try {
                if (existingRaw) existingSource = JSON.parse(existingRaw);
            } catch (e) { }

            const searchParams = new URLSearchParams(location.search);
            const utmSource = searchParams.get('utm_source');
            const utmMedium = searchParams.get('utm_medium');
            const utmCampaign = searchParams.get('utm_campaign');
            const utmTerm = searchParams.get('utm_term');
            const utmContent = searchParams.get('utm_content');

            const referrer = document.referrer;

            // If we have an existing specific source (from UTMs), don't overwrite
            // But if we have 'direct' or 'referral', allow UTMs to "upgrade" it
            const isGeneric = !existingSource || existingSource.source === 'direct' || existingSource.source === 'referral';
            if (existingSource && !isGeneric && !utmSource) return;

            let sourceData = null;

            // 1. Priority: UTM Parameters
            if (utmSource) {
                let source = utmSource;
                const medium = utmMedium || 'unknown';

                // Specific Google Business Profile (GBP) detection from UTMs
                if (utmSource === 'google' && (medium.includes('gmb') || medium.includes('business') || medium.includes('profile'))) {
                    source = 'google_business_profile';
                }

                sourceData = {
                    source: source,
                    medium: medium,
                    campaign: utmCampaign,
                    term: utmTerm,
                    content: utmContent,
                    referrer: referrer,
                    landingPage: window.location.href,
                    firstVisitAt: existingSource?.firstVisitAt || new Date().toISOString()
                };
            }
            // 2. Fallback: Referrer (Organic/Social/Direct)
            else if (referrer && !referrer.includes(window.location.hostname)) {
                let inferredSource = 'referral';
                let inferredMedium = 'referral';

                // Simple heuristics for common platforms
                if (referrer.includes('google')) {
                    inferredSource = 'google';
                    inferredMedium = 'organic';
                    // Detect if coming from Google Maps/Business
                    if (referrer.includes('google.com/maps') || referrer.includes('business.google.com')) {
                        inferredSource = 'google_business_profile';
                    }
                }
                else if (referrer.includes('facebook')) { inferredSource = 'facebook'; inferredMedium = 'social'; }
                else if (referrer.includes('instagram')) { inferredSource = 'instagram'; inferredMedium = 'social'; }
                else if (referrer.includes('linkedin')) { inferredSource = 'linkedin'; inferredMedium = 'social'; }
                else if (referrer.includes('twitter') || referrer.includes('t.co')) { inferredSource = 'twitter'; inferredMedium = 'social'; }
                else if (referrer.includes('whatsapp')) { inferredSource = 'whatsapp'; inferredMedium = 'social'; }
                else if (referrer.includes('youtube')) { inferredSource = 'youtube'; inferredMedium = 'social'; }

                sourceData = {
                    source: inferredSource,
                    medium: inferredMedium,
                    referrer: referrer,
                    landingPage: window.location.href,
                    firstVisitAt: existingSource?.firstVisitAt || new Date().toISOString()
                };
            }
            // 3. Fallback: Direct (if no referrer and no UTM)
            else {
                // Optionally track direct traffic, but often better to just leave null until a known source appears
                // Or explicit "direct"
                sourceData = {
                    source: 'direct',
                    medium: 'none',
                    landingPage: window.location.href,
                    firstVisitAt: new Date().toISOString()
                };
            }

            if (sourceData) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sourceData));
            }

        } catch (error) {
            console.error('Error tracking traffic source:', error);
        }
    }, [location]);

    // Helper to get stored source
    const getTrafficSource = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    };

    return { getTrafficSource };
};
