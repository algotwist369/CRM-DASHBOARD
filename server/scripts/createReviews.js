/**
 * Script to create Reviews for completed appointments
 * Usage: node server/scripts/createReviews.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Staff = require('../models/Staff');

// Review comments pool
const positiveComments = [
    'Excellent service! Very satisfied with the treatment.',
    'Great experience, will definitely come back.',
    'Professional staff and amazing service quality.',
    'Highly recommended! Best service in town.',
    'Wonderful experience, exceeded my expectations.',
    'Very clean and hygienic place. Great service!',
    'Staff was very friendly and professional.',
    'Amazing service, worth every penny.',
    'Best experience ever! Will visit again soon.',
    'Outstanding service quality. Very impressed!',
    'Great value for money. Excellent service.',
    'Professional and courteous staff. Loved it!',
    'Clean facility and excellent service.',
    'Very satisfied with the overall experience.',
    'Great service, highly recommended!'
];

const averageComments = [
    'Good service overall.',
    'Decent experience, could be better.',
    'Service was okay, nothing special.',
    'Average service quality.',
    'It was fine, nothing exceptional.',
    'Service was satisfactory.',
    'Could improve in some areas.',
    'Good but room for improvement.'
];

const negativeComments = [
    'Service could be better.',
    'Not satisfied with the experience.',
    'Expected better service quality.',
    'Staff could be more professional.',
    'Service was below expectations.',
    'Needs improvement in several areas.'
];

// Helper function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to generate review based on rating
function generateReview(rating) {
    if (rating >= 4.5) {
        return getRandomItem(positiveComments);
    } else if (rating >= 3.5) {
        return getRandomItem([...positiveComments, ...averageComments]);
    } else if (rating >= 2.5) {
        return getRandomItem(averageComments);
    } else {
        return getRandomItem(negativeComments);
    }
}

async function createReviews() {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        // Get admin
        const admin = await Admin.findOne({ email: 'dinesh@dishonlinesolution.com' });
        if (!admin) {
            console.error('❌ Admin not found. Please create admin first using createAdmin.js');
            process.exit(1);
        }

        console.log(`👤 Found Admin: ${admin.companyName} (${admin.name})\n`);

        // Get all businesses
        const businesses = await Business.find({ admin: admin._id, isActive: true })
            .select('_id name branch type')
            .sort({ createdAt: 1 });

        if (businesses.length === 0) {
            console.error('❌ No businesses found. Please create businesses first using createBusinesses.js');
            process.exit(1);
        }

        console.log(`📦 Found ${businesses.length} businesses\n`);
        console.log(`⭐ Creating reviews for completed appointments...\n`);

        let totalCreated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const reviewsPerBusiness = [];

        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];

            // Get completed appointments for this business
            const completedAppointments = await Appointment.find({
                business: business._id,
                status: 'completed'
            }).limit(20);
            
            // Populate separately to avoid schema issues
            for (let apt of completedAppointments) {
                await apt.populate('customer', 'firstName lastName');
                await apt.populate('service', 'name');
                if (apt.staff) {
                    await apt.populate('staff', 'name');
                }
            }

            if (completedAppointments.length === 0) {
                console.log(`⚠️  [${i + 1}/${businesses.length}] Skipped: ${business.name} - ${business.branch} (no completed appointments)`);
                continue;
            }

            // Create reviews for 60-80% of completed appointments
            const numReviews = Math.floor(completedAppointments.length * (0.6 + Math.random() * 0.2));
            const appointmentsToReview = completedAppointments.slice(0, numReviews);

            let created = 0;
            let skipped = 0;
            let errors = 0;

            console.log(`\n🏢 [${i + 1}/${businesses.length}] ${business.name} - ${business.branch} (${business.type})`);
            console.log(`   Creating reviews for ${numReviews} appointments...\n`);

            for (let j = 0; j < appointmentsToReview.length; j++) {
                const appointment = appointmentsToReview[j];
                
                try {
                    // Check if review already exists
                    const existingReview = await Review.findOne({
                        appointment: appointment._id,
                        customer: appointment.customer._id
                    });

                    if (existingReview) {
                        skipped++;
                        continue;
                    }

                    // Generate rating (most reviews are positive)
                    let rating;
                    const rand = Math.random();
                    if (rand > 0.7) {
                        rating = 5; // 30% 5 stars
                    } else if (rand > 0.5) {
                        rating = 4; // 20% 4 stars
                    } else if (rand > 0.3) {
                        rating = 4.5; // 20% 4.5 stars
                    } else if (rand > 0.15) {
                        rating = 3.5; // 15% 3.5 stars
                    } else {
                        rating = 3 + Math.random() * 1; // 15% 3-4 stars
                    }

                    const reviewText = generateReview(rating);
                    const reviewDate = appointment.completedAt || appointment.appointmentDate;

                    // Create review
                    const review = await Review.create({
                        business: business._id,
                        customer: appointment.customer._id,
                        appointment: appointment._id,
                        service: appointment.service._id,
                        staff: appointment.staff || null,
                        rating: rating,
                        review: reviewText,
                        title: rating >= 4 ? 'Great Experience!' : rating >= 3 ? 'Good Service' : 'Could Be Better',
                        isVerified: Math.random() > 0.3, // 70% verified
                        isPublished: true,
                        status: 'approved',
                        helpfulCount: Math.floor(Math.random() * 10), // 0-9 helpful votes
                        source: 'website'
                    });

                    // Update appointment with review
                    await Appointment.findByIdAndUpdate(appointment._id, {
                        rating: rating,
                        review: reviewText,
                        reviewDate: reviewDate
                    });

                    // Update business ratings
                    const businessDoc = await Business.findById(business._id);
                    if (businessDoc && businessDoc.ratings) {
                        const ratings = businessDoc.ratings;
                        ratings.totalReviews += 1;
                        
                        // Update star distribution
                        if (rating >= 4.5) {
                            ratings.fiveStars += 1;
                        } else if (rating >= 3.5) {
                            ratings.fourStars += 1;
                        } else if (rating >= 2.5) {
                            ratings.threeStars += 1;
                        } else if (rating >= 1.5) {
                            ratings.twoStars += 1;
                        } else {
                            ratings.oneStar += 1;
                        }
                        
                        // Recalculate average
                        const totalStars = ratings.fiveStars * 5 + 
                                         ratings.fourStars * 4 + 
                                         ratings.threeStars * 3 + 
                                         ratings.twoStars * 2 + 
                                         ratings.oneStar * 1;
                        ratings.average = totalStars / ratings.totalReviews;
                        
                        await businessDoc.save();
                    }

                    // Update service ratings if service exists
                    if (appointment.service && appointment.service._id) {
                        const service = await Service.findById(appointment.service._id);
                        if (service && service.ratings) {
                            const totalRating = (service.ratings.average * service.ratings.count) + rating;
                            service.ratings.count += 1;
                            service.ratings.average = totalRating / service.ratings.count;
                            await service.save();
                        }
                    }

                    created++;
                    totalCreated++;

                    if (j < 3) { // Show first 3 reviews
                        const customerName = appointment.customer.firstName + (appointment.customer.lastName ? ' ' + appointment.customer.lastName : '');
                        console.log(`   ✅ ${j + 1}. ${customerName} - ${rating}⭐`);
                        console.log(`      Service: ${appointment.service?.name || 'N/A'} | ${reviewText.substring(0, 50)}...`);
                    }

                } catch (error) {
                    errors++;
                    totalErrors++;
                    console.error(`   ❌ Error creating review ${j + 1}:`, error.message);
                }
            }

            reviewsPerBusiness.push({
                business: business.name,
                branch: business.branch,
                created: created,
                skipped: skipped,
                errors: errors
            });

            console.log(`   📊 Created: ${created} | Skipped: ${skipped} | Errors: ${errors}`);
        }

        console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Overall Summary:');
        console.log(`   ✅ Total Created: ${totalCreated}`);
        console.log(`   ⏭️  Total Skipped: ${totalSkipped}`);
        console.log(`   ❌ Total Errors: ${totalErrors}`);
        console.log(`   📦 Total Businesses: ${businesses.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Show per-business summary
        console.log('📋 Per-Business Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        reviewsPerBusiness.forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.business} - ${item.branch}: ${item.created} reviews`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Show rating distribution
        const allReviews = await Review.find({ 
            business: { $in: businesses.map(b => b._id) }
        });
        
        const ratingDistribution = {
            five: allReviews.filter(r => r.rating >= 4.5).length,
            four: allReviews.filter(r => r.rating >= 3.5 && r.rating < 4.5).length,
            three: allReviews.filter(r => r.rating >= 2.5 && r.rating < 3.5).length,
            two: allReviews.filter(r => r.rating >= 1.5 && r.rating < 2.5).length,
            one: allReviews.filter(r => r.rating < 1.5).length
        };
        
        const avgRating = allReviews.length > 0
            ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(2)
            : 0;
        
        console.log('⭐ Review Statistics:');
        console.log(`   Total Reviews: ${allReviews.length}`);
        console.log(`   Average Rating: ${avgRating}⭐`);
        console.log(`   5⭐: ${ratingDistribution.five}`);
        console.log(`   4⭐: ${ratingDistribution.four}`);
        console.log(`   3⭐: ${ratingDistribution.three}`);
        console.log(`   2⭐: ${ratingDistribution.two}`);
        console.log(`   1⭐: ${ratingDistribution.one}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Close database connection
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the script
createReviews();

