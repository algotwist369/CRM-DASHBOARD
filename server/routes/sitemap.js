const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// ================== Generate Sitemap ==================
router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://spaadvisor.in'; // Change this to your actual domain

        // 1. Fetch all public active businesses
        // Only select necessary fields for sitemap (slug/businessLink, updatedAt)
        const businesses = await Business.find({
            isActive: true,
            'settings.appointmentSettings.allowOnlineBooking': true
        })
            .select('businessLink updatedAt')
            .lean();

        // 2. Define static routes
        const staticRoutes = [
            '',
            '/search',
            '/login',
            '/register',
            '/business-register'
        ];

        // 3. Build XML content
        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Add static routes
        staticRoutes.forEach(route => {
            xml += `
            <url>
                <loc>${baseUrl}${route}</loc>
                <changefreq>daily</changefreq>
                <priority>0.8</priority>
            </url>`;
        });

        // Add dynamic business routes
        businesses.forEach(business => {
            const lastMod = business.updatedAt
                ? new Date(business.updatedAt).toISOString()
                : new Date().toISOString();

            xml += `
            <url>
                <loc>${baseUrl}/business/${business.businessLink}</loc>
                <lastmod>${lastMod}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.9</priority>
            </url>`;
        });

        xml += '</urlset>';

        // 4. Send response
        res.header('Content-Type', 'application/xml');
        res.send(xml);

    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

module.exports = router;
