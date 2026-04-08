import React from 'react';
import { Helmet } from 'react-helmet-async';

const StructuredData = ({ type, data }) => {
    let schema = {};

    switch (type) {
        case 'WebSite':
            schema = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "SpaAdvisor",
                "url": "https://spadvisor.com",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://spadvisor.com/spa?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                }
            };
            break;

        case 'LocalBusiness':
            schema = {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "name": data.name,
                "image": data.image,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": data.address,
                    "addressLocality": data.city,
                    "addressRegion": data.state,
                    "postalCode": data.zip,
                    "addressCountry": "IN"
                },
                "geo": data.lat && data.lng ? {
                    "@type": "GeoCoordinates",
                    "latitude": data.lat,
                    "longitude": data.lng
                } : undefined,
                "telephone": data.phone,
                "url": data.url,
                "aggregateRating": data.rating ? {
                    "@type": "AggregateRating",
                    "ratingValue": data.rating,
                    "reviewCount": data.reviewCount || 0
                } : undefined,
                "priceRange": data.priceRange || "₹₹"
            };
            break;

        case 'BreadcrumbList':
            schema = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": data.items.map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": item.name,
                    "item": item.url
                }))
            };
            break;

        case 'ItemList':
            schema = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": data.items.map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "url": item.url,
                    "name": item.name
                }))
            };
            break;

        default:
            return null;
    }

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
};

export default StructuredData;
