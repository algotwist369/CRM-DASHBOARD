const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Review = require('../models/Review');

const INDIAN_NAMES = [
    "Aarav", "Vihaan", "Aditya", "Arjun", "Sai", "Reyansh", "Aryan", "Krishna", "Ishaan", "Shaurya",
    "Ayaan", "Ansh", "Dhruv", "Kabir", "Rudra", "Atharva", "Aarush", "Vivaan", "Advik", "Kartik",
    "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Anika", "Navya", "Angel", "Shruti", "Riya",
    "Myra", "Saanvi", "Aaryahi", "Ahana", "Prisha", "Anvi", "Siya", "Kiara", "Ira", "Amaira",
    "Rahul", "Priya", "Amit", "Sneha", "Rohit", "Neha", "Vikas", "Pooja", "Sandeep", "Anjali",
    "Raj", "Meera", "Karan", "Kavita", "Suresh", "Sunita", "Manoj", "Divya", "Ankit", "Preeti"
];

const LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Malhotra", "Singh", "Kumar", "Patel", "Mehta", "Shah", "Reddy",
    "Nair", "Iyer", "Rao", "Joshi", "Desai", "Jain", "Agarwal", "Chopra", "Khanna", "Saxena"
];

const POSITIVE_ADJECTIVES = ["Amazing", "Excellent", "Best", "Wonderful", "Great", "Fantastic", "Superb", "Top-notch", "Relaxing", "Professional"];
const SERVICES = ["massage", "facial", "spa treatment", "body scrub", "deep tissue massage", "aromatherapy", "hair spa", "pedicure"];

const REVIEW_TEMPLATES = [
    "Had an {adj} experience at this spa. The {service} was incredibly relaxing. Highly recommend!",
    "One of the best spas in the city. The staff is professional and the ambience is perfect for relaxation.",
    "Totally worth the money. I tried the {service} and it was {adj}. Will visit again soon.",
    "Very clean and hygienic place. The therapists are skilled and know what they are doing.",
    "A hidden gem! If you are looking for a {adj} {service}, this is the place to be.",
    "Relaxing atmosphere and friendly staff. My {service} session was just what I needed after a long week.",
    "Great service and affordable prices. The {service} is a must-try here.",
    "I have visited many spas, but this one stands out. The attention to detail is {adj}.",
    "Perfect place to unwind. Me and my friend went for a {service} and we both loved it.",
    "Highly professional therapists. The {service} was very therapeutic and relaxing.",
    "Best experience ever! The {service} was so soothing. Can't wait for my next appointment.",
    "Lovely ambience and great hospitality. Specifically loved the {service}.",
    "If you want a {adj} spa day, book an appointment here. You won't regret it.",
    "Cleanliness and hygiene are top priority here, which I loved. The {service} was excellent.",
    "Good value for money. The staff is polite and the services are {adj}."
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateReview = (businessId) => {
    const firstName = getRandomElement(INDIAN_NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;

    // 80% chance of 5 stars, 20% chance of 4 stars
    const rating = Math.random() < 0.8 ? 5 : 4;

    const adj = getRandomElement(POSITIVE_ADJECTIVES);
    const service = getRandomElement(SERVICES);
    const template = getRandomElement(REVIEW_TEMPLATES);

    const reviewText = template.replace("{adj}", adj.toLowerCase()).replace("{service}", service);

    // Random date within last 1 years
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7200)); // 7200 hours = 300 days

    return {
        business: businessId,
        // customer is not required when guestName is provided (schema validation)
        guestName: fullName,
        guestEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 600)}@gmail.com`,
        rating: rating,
        review: reviewText,
        title: `${adj} Experience`,
        ratings: {
            service: rating,
            staff: rating,
            cleanliness: rating,
            ambience: rating,
            valueForMoney: rating
        },
        status: 'approved',
        isPublished: true,
        source: Math.random() > 0.5 ? 'google' : 'website',
        createdAt: date,
        updatedAt: date
    };
};

const updateBusinessStats = async (businessId) => {
    const result = await Review.aggregate([
        { $match: { business: businessId, isPublished: true, status: 'approved' } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
            }
        }
    ]);

    if (result.length > 0) {
        const stats = result[0];
        await Business.findByIdAndUpdate(businessId, {
            'ratings.average': parseFloat(stats.averageRating.toFixed(1)),
            'ratings.totalReviews': stats.totalReviews,
            'ratings.fiveStars': stats.fiveStars,
            'ratings.fourStars': stats.fourStars,
            'ratings.threeStars': stats.threeStars,
            'ratings.twoStars': stats.twoStars,
            'ratings.oneStar': stats.oneStar,
            'stats.averageRating': parseFloat(stats.averageRating.toFixed(1))
        });
        console.log(`Updated stats for business ${businessId}: ${stats.totalReviews} reviews, ${stats.averageRating.toFixed(1)} avg`);
    }
};

const seedReviews = async (businessId = null, zeroReviewsMode = false, businessType = null) => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        let businesses = [];

        // If business ID is provided, find only that business
        if (businessId) {
            // Validate if it's a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(businessId)) {
                console.error(`❌ Error: Invalid business ID format: ${businessId}`);
                console.log('💡 Business ID must be a valid MongoDB ObjectId (24 character hex string)');
                process.exit(1);
            }

            const business = await Business.findById(businessId);
            if (!business) {
                console.error(`❌ Error: Business not found with ID: ${businessId}`);
                process.exit(1);
            }
            businesses = [business];
            console.log(`✅ Found business: ${business.name} (${business.type})`);
        } else if (zeroReviewsMode) {
            // Find businesses with 0 reviews
            const query = {};
            if (businessType) {
                query.type = businessType;
            }

            // Get all businesses matching the query
            const allBusinesses = await Business.find(query);
            console.log(`🔍 Checking ${allBusinesses.length} businesses for zero reviews...`);

            // Filter businesses that have 0 published reviews
            for (const business of allBusinesses) {
                const reviewCount = await Review.countDocuments({
                    business: business._id,
                    isPublished: true,
                    status: 'approved'
                });

                if (reviewCount === 0) {
                    businesses.push(business);
                }
            }

            console.log(`✅ Found ${businesses.length} businesses with 0 reviews${businessType ? ` (type: ${businessType})` : ''}`);
        } else {
            // If no business ID provided, get all spa businesses (original behavior)
            businesses = await Business.find({ type: 'spa' });
            console.log(`Found ${businesses.length} spa businesses.`);
        }

        if (businesses.length === 0) {
            console.log('⚠️  No businesses found to add reviews to.');
            process.exit(0);
        }

        for (const business of businesses) {
            // Cleanup previous SEO reviews for this business (matched by title pattern)
            const deleteResult = await Review.deleteMany({
                business: business._id,
                title: { $regex: /Experience$/ },
                source: { $in: ['google', 'website'] }
            });
            console.log(`🧹 Cleaned up ${deleteResult.deletedCount} previous SEO reviews for ${business.name}`);

            const reviewCount = Math.floor(Math.random() * (950 - 700 + 1)) + 700; // Random between 700 and 950
            console.log(`\n📝 Generating ${reviewCount} Indian reviews for ${business.name}...`);

            const reviews = [];
            for (let i = 0; i < reviewCount; i++) {
                reviews.push(generateReview(business._id));
            }

            // Debug: Log first review to check guestName
            if (reviews.length > 0) {
                console.log('📋 Sample Generated Review:', {
                    guestName: reviews[0].guestName,
                    rating: reviews[0].rating,
                    title: reviews[0].title,
                    source: reviews[0].source
                });
            }

            // Insert in chunks
            await Review.insertMany(reviews);
            console.log(`✅ Successfully inserted ${reviews.length} reviews`);

            // Update business ratings
            await updateBusinessStats(business._id);
        }

        console.log('\n🎉 All done! SEO reviews added successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
        process.exit(1);
    }
};

// Get arguments from command line
// Usage examples:
//   node add_seo_reviews.js                          - Add reviews to all spa businesses
//   node add_seo_reviews.js <businessId>             - Add reviews to specific business
//   node add_seo_reviews.js --zero-reviews           - Add reviews to all businesses with 0 reviews
//   node add_seo_reviews.js --zero-reviews spa       - Add reviews to spa businesses with 0 reviews
const args = process.argv.slice(2);
let businessId = null;
let zeroReviewsMode = false;
let businessType = null;

// Parse arguments
if (args.length > 0) {
    const firstArg = args[0].toLowerCase();
    
    // Check for zero-reviews flag
    if (firstArg === '--zero-reviews' || firstArg === '--zero' || firstArg === 'zero-reviews' || firstArg === 'zero') {
        zeroReviewsMode = true;
        // Check if business type is provided as second argument
        if (args.length > 1) {
            businessType = args[1].toLowerCase();
        }
    } else if (mongoose.Types.ObjectId.isValid(firstArg)) {
        // If it's a valid ObjectId, treat it as business ID
        businessId = firstArg;
    } else {
        console.error(`❌ Error: Unknown argument: ${firstArg}`);
        console.log('\n💡 Usage:');
        console.log('  node add_seo_reviews.js                          - Add reviews to all spa businesses');
        console.log('  node add_seo_reviews.js <businessId>             - Add reviews to specific business');
        console.log('  node add_seo_reviews.js --zero-reviews            - Add reviews to all businesses with 0 reviews');
        console.log('  node add_seo_reviews.js --zero-reviews <type>    - Add reviews to businesses with 0 reviews of specific type');
        process.exit(1);
    }
}

// Display mode information
if (businessId) {
    console.log(`🎯 Target Business ID: ${businessId}`);
} else if (zeroReviewsMode) {
    console.log(`🎯 Mode: Zero Reviews${businessType ? ` (Business Type: ${businessType})` : ' (All Types)'}`);
} else {
    console.log('📌 No business ID provided. Will add reviews to all spa businesses.');
}

seedReviews(businessId, zeroReviewsMode, businessType);




 
// New feature: Zero reviews mode
// The script now supports adding reviews to businesses with 0 reviews.
// Usage options:
// All spa businesses (default):
//    node scripts/add_seo_reviews.js
// Specific business by ID:
//    node scripts/add_seo_reviews.js 507f1f77bcf86cd799439011
// All businesses with 0 reviews:
//    node scripts/add_seo_reviews.js --zero-reviews
// or
//    node scripts/add_seo_reviews.js --zero
// Businesses with 0 reviews of a specific type:
//    node scripts/add_seo_reviews.js --zero-reviews spa   
//    node scripts/add_seo_reviews.js --zero-reviews salon  
//    node scripts/add_seo_reviews.js --zero-reviews restaurant
// How it works:
// The script first checks if a business ID is provided. If not, it adds reviews to all spa businesses.
// If a business ID is provided, it adds reviews to that business.
// If the --zero-reviews flag is provided, it adds reviews to all businesses with 0 reviews.
// If the --zero-reviews flag is provided with a business type, it adds reviews to businesses with 0 reviews of that type.
// The script uses the Review model to add reviews to businesses.
// The script uses the Business model to get businesses and update business ratings.
// The script uses the Review model to delete previous SEO reviews for a business.
// The script uses the Review model to insert new reviews.
// The script uses the Business model to update business ratings.