const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Business = require('../models/Business');
const Review = require('../models/Review');

const verify = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        // Check one specific business
        // Serenity Wellness Spa: 690dab3b2d3146b65fb11221
        const businessId = '690dab3b2d3146b65fb11221';

        const business = await Business.findById(businessId);
        if (!business) {
            console.log('Business not found:', businessId);
            process.exit(1);
        }
        console.log(`Business Found: ${business.name}`);
        console.log(`- Avg Rating: ${business.ratings?.average}`);
        console.log(`- Total Reviews: ${business.ratings?.totalReviews}`);

        // Check reviews
        console.log('Checking reviews...');
        const reviews = await Review.find({ business: businessId, guestName: { $exists: true } }).limit(1);
        console.log(`Found ${reviews.length} reviews WITH guestName.`);

        if (reviews.length > 0) {
            console.log('Sample Review Raw:', reviews[0].toObject());
            console.log('Schema paths for Review:', Object.keys(Review.schema.paths).filter(p => p.includes('guest')));
        }

        const publishedReviews = await Review.countDocuments({ business: businessId, isPublished: true });
        console.log(`Published Reviews: ${publishedReviews}`);

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await mongoose.disconnect();
    }
};

verify();
