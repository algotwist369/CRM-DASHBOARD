import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    canonical,
    keywords,
    image,
    type = 'website'
}) => {
    const siteTitle = 'Spa Advisor';
    const metaDescription = description || "Discover and book the best spas, salons, and wellness centers near you. Read reviews, check prices, and book appointments online.";
    const metaImage = image || "https://spaadvisor.in/og-image.jpg"; // Fallback image
    const siteUrl = "https://spaadvisor.in";
    const canonicalUrl = canonical ? (canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`) : siteUrl + window.location.pathname;

    // Handle title: if a full title is provided (contains | or -), use it; otherwise append site name.
    const fullTitle = title 
        ? (title.includes('|') || title.includes('-') ? title : `${title} | ${siteTitle}`) 
        : siteTitle;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={keywords || "spa, salon, massage, wellness, booking, reviews, spa advisor"} />
            <link rel="canonical" href={canonicalUrl} />
            <meta name="robots" content="index, follow" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
