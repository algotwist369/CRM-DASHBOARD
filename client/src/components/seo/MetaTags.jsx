import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * SEO MetaTags Component
 * 
 * Provides comprehensive SEO meta tags for each page
 * Implements best practices including:
 * - Dynamic page titles and descriptions
 * - Canonical URLs to prevent duplicate content
 * - Open Graph tags for social media sharing
 * - Twitter Card tags
 * - Structured data (JSON-LD)
 * - Meta robots directives
 * 
 * @author Senior Full Stack Developer
 * @date 2026-01-02
 */

const MetaTags = ({
    title = 'SpaAdvisor - Find Your Perfect Spa Experience',
    description = 'Discover and book the best spa services in India. Read reviews, compare prices, and find the perfect spa near you.',
    canonical = null,
    noindex = false,
    nofollow = false,
    ogType = 'website',
    ogImage = null,
    twitterCard = 'summary_large_image',
    structuredData = null,
    keywords = '',
}) => {
    const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'https://spaadvisor.in';
    const fullCanonical = canonical || window.location.href;
    const defaultOgImage = `${baseUrl}/images/og-default.jpg`;

    // Build robots directive
    const robotsDirective = [
        noindex ? 'noindex' : 'index',
        nofollow ? 'nofollow' : 'follow',
    ].join(',');

    // Default structured data for organization
    const defaultStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SpaAdvisor',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'India\'s leading spa discovery and booking platform',
        sameAs: [
            'https://www.facebook.com/spaadvisor.in',
            'https://www.instagram.com/spaadvisor.in',
            'https://twitter.com/spaadvisor',
        ],
    };

    const finalStructuredData = structuredData || defaultStructuredData;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Robots */}
            <meta name="robots" content={robotsDirective} />
            <meta name="googlebot" content={robotsDirective} />

            {/* Canonical URL - Critical for preventing duplicate content */}
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage || defaultOgImage} />
            <meta property="og:site_name" content="SpaAdvisor" />

            {/* Twitter */}
            <meta property="twitter:card" content={twitterCard} />
            <meta property="twitter:url" content={fullCanonical} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage || defaultOgImage} />

            {/* Additional SEO Tags */}
            <meta name="language" content="English" />
            <meta name="revisit-after" content="7 days" />
            <meta name="author" content="SpaAdvisor" />

            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify(finalStructuredData)}
            </script>
        </Helmet>
    );
};

MetaTags.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    canonical: PropTypes.string,
    noindex: PropTypes.bool,
    nofollow: PropTypes.bool,
    ogType: PropTypes.string,
    ogImage: PropTypes.string,
    twitterCard: PropTypes.string,
    structuredData: PropTypes.object,
    keywords: PropTypes.string,
};

export default MetaTags;
