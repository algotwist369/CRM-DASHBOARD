const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Business = require('../models/Business');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BASE_URL = process.env.CLIENT_URL || 'https://spaadvisor.in';
const OUTPUT_DIR = path.join(__dirname, '../../client/public/seo');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const STATIC_ROUTES = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/features', priority: 0.8, changefreq: 'weekly' },
    { url: '/pricing', priority: 0.8, changefreq: 'weekly' },
    { url: '/how-it-works', priority: 0.7, changefreq: 'monthly' },
    { url: '/for-businesses', priority: 0.8, changefreq: 'monthly' },
    { url: '/advertise', priority: 0.7, changefreq: 'monthly' },
    { url: '/careers', priority: 0.6, changefreq: 'monthly' },
    { url: '/search', priority: 0.9, changefreq: 'daily' },
    { url: '/contact', priority: 0.7, changefreq: 'monthly' },
    { url: '/free-listing', priority: 0.8, changefreq: 'monthly' },
    { url: '/book-demo', priority: 0.8, changefreq: 'monthly' },
    { url: '/google-my-business-reviews', priority: 0.7, changefreq: 'weekly' },
    { url: '/facebook-reviews', priority: 0.7, changefreq: 'weekly' },
    { url: '/yelp-reviews', priority: 0.7, changefreq: 'weekly' },
    { url: '/tripadvisor-reviews', priority: 0.7, changefreq: 'weekly' },
    { url: '/reviews-management', priority: 0.7, changefreq: 'weekly' },
    { url: '/resources/yelp-playbook', priority: 0.6, changefreq: 'monthly' },
    { url: '/check-appointment', priority: 0.5, changefreq: 'never' }
];

const generateSitemap = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/crm-dashboard");
        console.log('✅ Connected to Database.');

        console.log('🔍 Fetching active businesses...');
        // Only fetch active businesses with a businessLink
        const businesses = await Business.find(
            { isActive: true, businessLink: { $exists: true, $ne: '' } },
            { businessLink: 1, updatedAt: 1 }
        ).lean();

        console.log(`📊 Found ${businesses.length} active businesses.`);

        const urls = [];

        // Add Static Routes
        STATIC_ROUTES.forEach(route => {
            urls.push({
                loc: `${BASE_URL}${route.url}`,
                lastmod: new Date().toISOString(), // Default to now, or could verify file stats
                changefreq: route.changefreq,
                priority: route.priority
            });
        });

        // Add Dynamic Business Routes
        businesses.forEach(biz => {
            urls.push({
                loc: `${BASE_URL}/${biz.businessLink}`,
                lastmod: biz.updatedAt ? new Date(biz.updatedAt).toISOString() : new Date().toISOString(),
                changefreq: 'weekly',
                priority: 0.9
            });
        });

        // --- SMART SEARCH URLs ---
        console.log('🌍 Generating smart search URLs...');

        // 1. Fetch distinct cities and types
        const cities = await Business.distinct('city', { isActive: true });
        const types = await Business.distinct('type', { isActive: true });

        // Filter valid cities (remove null/empty) and trim
        const validCities = cities
            .filter(c => c && typeof c === 'string' && c.trim().length > 0)
            .map(c => c.trim());

        const validTypes = types
            .filter(t => t && typeof t === 'string' && t.trim().length > 0)
            .map(t => t.trim());

        console.log(`📍 Found ${validCities.length} cities and ${validTypes.length} business types.`);

        // 2. "Near Me" Queries (High Priority)
        const nearMeQueries = [
            'best spa near me',
            'luxury spa near me',
            'salon near me',
            'best massage near me'
        ];

        nearMeQueries.forEach(query => {
            urls.push({
                loc: `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
                lastmod: new Date().toISOString(),
                changefreq: 'weekly',
                priority: 0.8
            });
        });

        // 3. Location + Type Combinations
        // Pattern: "Best [Type] in [City]" and Category Filters
        validCities.forEach(city => {
            // Generic City Search
            urls.push({
                loc: `${BASE_URL}/search?q=${encodeURIComponent(city)}`,
                lastmod: new Date().toISOString(),
                changefreq: 'weekly',
                priority: 0.8
            });

            validTypes.forEach(type => {
                // Query: "Best Spa in Mumbai"
                const query = `Best ${type} in ${city}`;
                urls.push({
                    loc: `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
                    lastmod: new Date().toISOString(),
                    changefreq: 'weekly',
                    priority: 0.8
                });

                // Category Filter + City: /search?category=spa&q=Mumbai
                urls.push({
                    loc: `${BASE_URL}/search?category=${encodeURIComponent(type.toLowerCase())}&q=${encodeURIComponent(city)}`,
                    lastmod: new Date().toISOString(),
                    changefreq: 'weekly',
                    priority: 0.8
                });
            });
        });


        // Helper to escape XML special chars
        const escapeXml = (unsafe) => {
            return unsafe.replace(/[<>&'"]/g, (c) => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                }
            });
        };

        // 1. Generate XML
        console.log('📝 Generating sitemap.xml...');
        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemapXml);

        // 2. Generate JSON
        console.log('📝 Generating sitemap.json...');
        fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.json'), JSON.stringify(urls, null, 2));

        // 3. Generate TXT
        console.log('📝 Generating sitemap.txt...');
        const sitemapTxt = urls.map(url => url.loc).join('\n');
        fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.txt'), sitemapTxt);

        console.log(`✅ Sitemap generation complete! Files saved to: ${OUTPUT_DIR}`);

        // Report
        console.log('\n--- SEO Report ---');
        console.log(`Total URLs: ${urls.length}`);
        console.log(`Static Pages: ${STATIC_ROUTES.length}`);
        console.log(`Dynamic Pages: ${businesses.length}`);
        console.log('------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
};

generateSitemap();
