
const redirectMiddleware = (req, res, next) => {
    const { path, query, originalUrl } = req;

    // Remove query string for pattern matching
    const cleanPath = originalUrl.split('?')[0];

    let redirectUrl = null;
    let reason = null;
    let statusCode = 301; // Permanent redirect by default

    if (cleanPath.includes('/search/result') || cleanPath.includes('/search/search/result')) {
        const searchQuery = query.searchSpas || query.q || '';

        if (searchQuery) {
            // Redirect to new search format with clean query parameter
            redirectUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
            reason = `Old search pattern: ${cleanPath} → new search format`;
        } else {
            // No search query, redirect to main search page
            redirectUrl = '/search';
            reason = 'Old search pattern without query → main search';
        }
    }


    const spaIdMatch = cleanPath.match(/^\/spa\/(\d+)(#!)?$/);
    if (spaIdMatch) {
        const spaId = spaIdMatch[1];

        // Strategy: Redirect to search with ID parameter
        // The frontend can then lookup and redirect to proper business page
        redirectUrl = `/search?legacyId=${spaId}`;
        reason = `Legacy spa detail page (ID: ${spaId}) → search`;

        console.log(`[SEO REDIRECT] Old spa URL detected: /spa/${spaId}. Frontend should handle legacy ID lookup.`);
    }

    // ================================================================
    // 3. OLD SPA DETAIL PAGES WITH HASH FRAGMENTS
    // Examples: /spa/25#!, /spa/35#!, etc.
    // Note: Hash fragments are client-side only, but we log them
    // ================================================================

    if (cleanPath.match(/^\/spa\/\d+$/) && originalUrl.includes('#!')) {
        console.log(`[SEO WARN] Hash fragment detected in URL: ${originalUrl}. Client-side handling needed.`);
    }

    // ================================================================
    // 4. JOB/CAREER PAGES
    // Examples: 
    // - /job-details?position=Spa Manager
    // - /apply?position=Spa Therapist
    // ================================================================

    if (cleanPath === '/job-details' || cleanPath === '/job-details#!') {
        const position = query.position;
        if (position) {
            const slug = position.toLowerCase().replace(/\s+/g, '-');
            redirectUrl = `/careers/${slug}`;
            reason = `Old job details page (${position}) → careers`;
        } else {
            redirectUrl = '/careers';
            reason = 'Old job details page without position → careers';
        }
    }

    if (cleanPath === '/apply' || cleanPath === '/apply#!') {
        const position = query.position;
        if (position) {
            const slug = position.toLowerCase().replace(/\s+/g, '-');
            redirectUrl = `/careers/${slug}/apply`;
            reason = `Old job application (${position}) → careers apply`;
        } else {
            redirectUrl = '/careers';
            reason = 'Old apply page without position → careers';
        }
    }

    // ================================================================
    // 5. SOCIAL MEDIA SHORTCUT REDIRECTS
    // Example: /facebook → actual Facebook page
    // ================================================================

    if (cleanPath === '/facebook' || cleanPath === '/facebook#!') {
        redirectUrl = process.env.FACEBOOK_URL || 'https://www.facebook.com/spaadvisor.in';
        reason = 'Social media shortcut → Facebook page';
    }

    if (cleanPath === '/instagram' || cleanPath === '/instagram#!') {
        redirectUrl = process.env.INSTAGRAM_URL || 'https://www.instagram.com/spaadvisor.in';
        reason = 'Social media shortcut → Instagram page';
    }

    if (cleanPath === '/twitter' || cleanPath === '/twitter#!') {
        redirectUrl = process.env.TWITTER_URL || 'https://twitter.com/spaadvisor';
        reason = 'Social media shortcut → Twitter page';
    }

    // ================================================================
    // 6. FREE LISTING PAGES
    // Examples: /free-listing, /free-listing#!
    // ================================================================

    if (cleanPath === '/free-listing' || cleanPath === '/free-listing#!') {
        redirectUrl = process.env.FREE_LISTING_REDIRECT || '/business-register';
        reason = 'Old free listing page → business registration';
    }

    // ================================================================
    // 7. TRAILING SLASH NORMALIZATION
    // Remove trailing slashes except for root (/)
    // Helps prevent duplicate content issues in SEO
    // ================================================================

    if (!redirectUrl && cleanPath !== '/' && cleanPath.endsWith('/') && !cleanPath.startsWith('/api/')) {
        redirectUrl = cleanPath.slice(0, -1);
        reason = 'Trailing slash normalization';

        // Preserve query string if present
        if (Object.keys(query).length > 0) {
            const queryString = new URLSearchParams(query).toString();
            redirectUrl += `?${queryString}`;
        }
    }

    // ================================================================
    // 8. DUPLICATE SEARCH QUERY PARAMETERS
    // Clean up messy URLs from old search patterns
    // ================================================================

    if (cleanPath === '/search' && query.area === 'detectedCity' && query.searchSpas) {
        // Remove the 'area=detectedCity' parameter
        redirectUrl = `/search?q=${encodeURIComponent(query.searchSpas)}`;
        reason = 'Clean up search parameters';
    }

    // ================================================================
    // 9. MESSY SEARCH PARAMETERS
    // Example: /search?category=spa&q=Navi Mumbai
    // Clean up unnecessary category parameter if it's just "spa"
    // ================================================================

    if (cleanPath === '/search' && query.category === 'spa' && query.q) {
        redirectUrl = `/search?q=${encodeURIComponent(query.q)}`;
        reason = 'Clean up search parameters (remove category=spa)';
    }

    // ================================================================
    // 10. OLD LOCATION SEARCH PATTERN
    // Example: /spas?location=Bandra
    // ================================================================

    if (cleanPath === '/spas' && query.location) {
        redirectUrl = `/search?q=${encodeURIComponent(query.location)}`;
        reason = 'Old location search pattern → search';
    }

    // ================================================================
    // 11. LEGACY STATIC PAGES
    // Examples: /services, /popular-spas
    // ================================================================

    if (cleanPath === '/services' || cleanPath === '/services#!') {
        redirectUrl = '/search';
        reason = 'Legacy services page → search';
    }

    if (cleanPath === '/popular-spas' || cleanPath === '/popular-spas#!') {
        redirectUrl = '/search?sort=popular';
        reason = 'Legacy popular spas page → search';
    }

    // ================================================================
    // 12. ROOT HASH FRAGMENTS & OTHERS
    // Example: /#!, /contact#!
    // ================================================================

    if (cleanPath === '/contact' && (originalUrl.includes('#!') || originalUrl.endsWith('#'))) {
        redirectUrl = '/contact';
        reason = 'Remove hash from contact page';
    }



    // ================================================================
    // 13. LEGACY SPAS SUBPATHS
    // Example: /spas/spa-berry-vadodara/6810...
    // Redirect to /spa-berry-vadodara (assuming slug is valid)
    // ================================================================

    const spasMatch = cleanPath.match(/^\/spas\/([^\/]+)(\/.*)?$/);
    if (spasMatch) {
        const slug = spasMatch[1];
        // Redirect to /slug (business link)
        redirectUrl = `/${slug}`;
        reason = 'Legacy /spas/slug structure → /slug';
    }

    // ================================================================
    // 14. LEGACY SPAS ROOT
    // Example: /spas (without location param)
    // ================================================================

    if (cleanPath === '/spas' && !query.location) {
        redirectUrl = '/search';
        reason = 'Legacy /spas page → search';
    }

    // ================================================================
    // EXECUTE REDIRECT
    // ================================================================


    if (redirectUrl) {
        // Enhanced logging for monitoring and debugging
        const logEntry = {
            timestamp: new Date().toISOString(),
            from: originalUrl,
            to: redirectUrl,
            reason: reason,
            userAgent: req.get('user-agent'),
            ipAddress: req.ip || req.connection.remoteAddress,
            statusCode: statusCode
        };

        console.log(`[${statusCode} REDIRECT]`, JSON.stringify(logEntry, null, 2));

        // Track redirect in analytics (if you have analytics setup)
        // trackEvent('seo_redirect', { from: originalUrl, to: redirectUrl });

        // Return proper HTTP redirect
        return res.status(statusCode).redirect(redirectUrl);
    }

    // No redirect needed, continue to next middleware
    next();
};

module.exports = redirectMiddleware;
