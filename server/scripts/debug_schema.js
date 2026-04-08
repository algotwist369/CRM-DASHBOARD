const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Review = require('../models/Review');
const Business = require('../models/Business');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // 1. Inspect Schema Paths
        console.log('Schema Paths:');
        const paths = Object.keys(Review.schema.paths);
        console.log(paths.filter(p => p.includes('guest')));

        // 2. Try to create one review manually
        const business = await Business.findOne({ type: 'spa' });
        if (!business) throw new Error('No spa business found');

        const reviewData = {
            business: business._id,
            customer: new mongoose.Types.ObjectId(),
            guestName: "Debug Name",
            guestEmail: "debug@test.com",
            rating: 5,
            review: "Debug review text",
            status: 'approved',
            isPublished: true
        };

        console.log('Attempting to create review with insertMany:', reviewData);

        const newReviews = await Review.insertMany([reviewData]);
        const newReview = newReviews[0];
        console.log('Created Review Document via insertMany:', newReview.toObject());
        console.log('guestName in doc:', newReview.guestName);

        // Clean up
        await Review.deleteOne({ _id: newReview._id });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

debug();
