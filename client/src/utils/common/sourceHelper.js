import {
    FaInstagram,
    FaFacebook,
    FaGoogle,
    FaStore,
    FaYoutube,
    FaLinkedin,
    FaWhatsapp,
    FaLink,
    FaGlobe,
    FaCircle
} from 'react-icons/fa';

/**
 * Helper utility to format and style lead traffic sources (UTM/Referrer)
 */

export const getPlatformStyle = (platform = '') => {
    const p = platform.toLowerCase();

    // Google Mapping
    if (p.includes('google') || p.includes('gmb')) {
        if (p.includes('business') || p.includes('gmb') || p.includes('profile')) {
            return {
                name: 'Google Business Profile',
                icon: FaStore,
                bg: 'bg-blue-700',
                text: 'text-blue-800',
                hover: 'hover:bg-blue-50',
                border: 'border-blue-200',
                pill: 'bg-blue-100'
            };
        }
        return {
            name: 'Google Search',
            icon: FaGoogle,
            bg: 'bg-orange-600',
            text: 'text-orange-800',
            hover: 'hover:bg-orange-50',
            border: 'border-orange-200',
            pill: 'bg-red-100'
        };
    }

    // Facebook Mapping
    if (p.includes('facebook') || p === 'fb') {
        return {
            name: 'Facebook',
            icon: FaFacebook,
            bg: 'bg-blue-600',
            text: 'text-blue-800',
            hover: 'hover:bg-blue-50',
            border: 'border-blue-200',
            pill: 'bg-blue-100'
        };
    }

    // Instagram Mapping
    if (p.includes('instagram') || p === 'ig') {
        return {
            name: 'Instagram',
            icon: FaInstagram,
            bg: 'bg-pink-600',
            text: 'text-pink-800',
            hover: 'hover:bg-pink-50',
            border: 'border-pink-200',
            pill: 'bg-pink-100'
        };
    }

    // YouTube Mapping
    if (p.includes('youtube')) {
        return {
            name: 'YouTube',
            icon: FaYoutube,
            bg: 'bg-red-600',
            text: 'text-red-800',
            hover: 'hover:bg-red-50',
            border: 'border-red-200',
            pill: 'bg-red-100'
        };
    }

    // LinkedIn Mapping
    if (p.includes('linkedin')) {
        return {
            name: 'LinkedIn',
            icon: FaLinkedin,
            bg: 'bg-blue-800',
            text: 'text-blue-900',
            hover: 'hover:bg-blue-50',
            border: 'border-blue-200',
            pill: 'bg-blue-100'
        };
    }

    // WhatsApp Mapping
    if (p.includes('whatsapp') || p === 'wa') {
        return {
            name: 'WhatsApp',
            icon: FaWhatsapp,
            bg: 'bg-green-600',
            text: 'text-green-800',
            hover: 'hover:bg-green-50',
            border: 'border-green-200',
            pill: 'bg-green-100'
        };
    }

    // Direct Mapping
    if (p.includes('direct') || p.includes('unknown') || !p) {
        return {
            name: 'Direct / Bookmarked',
            icon: FaLink,
            bg: 'bg-gray-600',
            text: 'text-gray-800',
            hover: 'hover:bg-gray-50',
            border: 'border-gray-200',
            pill: 'bg-gray-100'
        };
    }

    // Website Referral Mapping (if has dot but not matched above)
    if (p.includes('.') || p.includes('/')) {
        return {
            name: platform,
            icon: FaGlobe,
            bg: 'bg-teal-600',
            text: 'text-teal-800',
            hover: 'hover:bg-teal-50',
            border: 'border-teal-200',
            pill: 'bg-teal-100'
        };
    }

    // Default
    return {
        name: platform,
        icon: FaCircle,
        bg: 'bg-green-600',
        text: 'text-green-800',
        hover: 'hover:bg-green-50',
        border: 'border-green-200',
        pill: 'bg-green-100'
    };
};

