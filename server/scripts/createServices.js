/**
 * Script to create Services for all businesses (5-10 services per business)
 * Usage: node server/scripts/createServices.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Service = require('../models/Service');
const Staff = require('../models/Staff');

// Service configurations based on business type
const serviceConfigs = {
    spa: {
        services: [
            {
                name: 'Swedish Massage',
                category: 'Massage',
                subCategory: 'Relaxation',
                description: 'Classic Swedish massage for deep relaxation and stress relief. Perfect for unwinding after a long day.',
                shortDescription: 'Classic relaxation massage',
                price: 1500,
                originalPrice: 2000,
                duration: 60,
                tags: ['relaxation', 'stress-relief', 'popular'],
                features: ['Aromatherapy', 'Hot Towels'],
                benefits: ['Reduces Stress', 'Improves Circulation', 'Relieves Muscle Tension']
            },
            {
                name: 'Deep Tissue Massage',
                category: 'Massage',
                subCategory: 'Therapeutic',
                description: 'Intense massage targeting deep muscle layers to relieve chronic pain and tension.',
                shortDescription: 'Intense therapeutic massage',
                price: 2000,
                originalPrice: 2500,
                duration: 75,
                tags: ['therapeutic', 'pain-relief', 'intense'],
                features: ['Deep Pressure', 'Muscle Release'],
                benefits: ['Pain Relief', 'Improved Mobility', 'Muscle Recovery']
            },
            {
                name: 'Hot Stone Massage',
                category: 'Massage',
                subCategory: 'Luxury',
                description: 'Luxurious massage using heated stones for ultimate relaxation and muscle relief.',
                shortDescription: 'Luxury heated stone massage',
                price: 2500,
                originalPrice: 3000,
                duration: 90,
                tags: ['luxury', 'premium', 'relaxation'],
                features: ['Heated Stones', 'Aromatherapy'],
                benefits: ['Deep Relaxation', 'Improved Sleep', 'Stress Relief']
            },
            {
                name: 'Aromatherapy Facial',
                category: 'Facial',
                subCategory: 'Skincare',
                description: 'Rejuvenating facial treatment with essential oils for glowing, healthy skin.',
                shortDescription: 'Rejuvenating facial with essential oils',
                price: 1800,
                originalPrice: 2200,
                duration: 60,
                tags: ['facial', 'skincare', 'glowing'],
                features: ['Essential Oils', 'Steam', 'Mask'],
                benefits: ['Glowing Skin', 'Hydration', 'Anti-Aging']
            },
            {
                name: 'Thai Massage',
                category: 'Massage',
                subCategory: 'Traditional',
                description: 'Traditional Thai massage combining acupressure and yoga-like stretching.',
                shortDescription: 'Traditional Thai massage',
                price: 2200,
                originalPrice: 2800,
                duration: 90,
                tags: ['traditional', 'stretching', 'energizing'],
                features: ['Acupressure', 'Stretching'],
                benefits: ['Flexibility', 'Energy Boost', 'Pain Relief']
            },
            {
                name: 'Body Scrub & Wrap',
                category: 'Body Treatment',
                subCategory: 'Exfoliation',
                description: 'Exfoliating body scrub followed by hydrating wrap for smooth, soft skin.',
                shortDescription: 'Exfoliating body treatment',
                price: 2000,
                originalPrice: 2500,
                duration: 75,
                tags: ['exfoliation', 'body-care', 'smoothing'],
                features: ['Body Scrub', 'Hydrating Wrap'],
                benefits: ['Smooth Skin', 'Exfoliation', 'Hydration']
            },
            {
                name: 'Reflexology',
                category: 'Massage',
                subCategory: 'Foot Therapy',
                description: 'Foot reflexology targeting pressure points for overall wellness and relaxation.',
                shortDescription: 'Foot pressure point therapy',
                price: 1200,
                originalPrice: 1500,
                duration: 45,
                tags: ['foot-therapy', 'wellness', 'relaxation'],
                features: ['Pressure Points', 'Foot Massage'],
                benefits: ['Overall Wellness', 'Stress Relief', 'Improved Circulation']
            },
            {
                name: 'Ayurvedic Massage',
                category: 'Massage',
                subCategory: 'Traditional',
                description: 'Traditional Ayurvedic massage with herbal oils for balance and rejuvenation.',
                shortDescription: 'Traditional Ayurvedic treatment',
                price: 2300,
                originalPrice: 2800,
                duration: 90,
                tags: ['ayurvedic', 'traditional', 'herbal'],
                features: ['Herbal Oils', 'Traditional Techniques'],
                benefits: ['Balance', 'Rejuvenation', 'Holistic Wellness']
            },
            {
                name: 'Couples Massage',
                category: 'Massage',
                subCategory: 'Special',
                description: 'Romantic couples massage in a private room for two people simultaneously.',
                shortDescription: 'Romantic couples massage',
                price: 3500,
                originalPrice: 4500,
                duration: 90,
                tags: ['couples', 'romantic', 'special'],
                features: ['Private Room', 'Dual Therapists'],
                benefits: ['Bonding Experience', 'Relaxation', 'Romance']
            },
            {
                name: 'Prenatal Massage',
                category: 'Massage',
                subCategory: 'Specialty',
                description: 'Safe and gentle massage designed specifically for expecting mothers.',
                shortDescription: 'Safe massage for expecting mothers',
                price: 2000,
                originalPrice: 2500,
                duration: 60,
                tags: ['prenatal', 'specialty', 'gentle'],
                features: ['Safe Techniques', 'Comfortable Positioning'],
                benefits: ['Stress Relief', 'Pain Relief', 'Relaxation']
            }
        ]
    },
    hotel: {
        services: [
            {
                name: 'Deluxe Room Booking',
                category: 'Accommodation',
                subCategory: 'Standard',
                description: 'Comfortable deluxe room with modern amenities, perfect for business and leisure travelers.',
                shortDescription: 'Comfortable deluxe room',
                price: 3500,
                originalPrice: 4000,
                duration: 1440, // 24 hours
                tags: ['accommodation', 'standard', 'comfortable'],
                features: ['AC', 'WiFi', 'TV', 'Room Service'],
                benefits: ['Comfort', 'Convenience', 'Modern Amenities']
            },
            {
                name: 'Executive Suite',
                category: 'Accommodation',
                subCategory: 'Premium',
                description: 'Spacious executive suite with separate living area and premium amenities.',
                shortDescription: 'Spacious executive suite',
                price: 6000,
                originalPrice: 7500,
                duration: 1440,
                tags: ['accommodation', 'premium', 'suite'],
                features: ['Separate Living Area', 'Premium Amenities', 'City View'],
                benefits: ['Luxury', 'Space', 'Premium Experience']
            },
            {
                name: 'Conference Room Booking',
                category: 'Business',
                subCategory: 'Meeting',
                description: 'Fully equipped conference room for business meetings and events.',
                shortDescription: 'Business conference room',
                price: 5000,
                originalPrice: 6000,
                duration: 240, // 4 hours
                tags: ['business', 'meeting', 'conference'],
                features: ['Projector', 'WiFi', 'Catering', 'Whiteboard'],
                benefits: ['Professional', 'Fully Equipped', 'Catering Available']
            },
            {
                name: 'Wedding Venue Booking',
                category: 'Events',
                subCategory: 'Wedding',
                description: 'Elegant wedding venue with banquet hall and catering services.',
                shortDescription: 'Elegant wedding venue',
                price: 50000,
                originalPrice: 60000,
                duration: 480, // 8 hours
                tags: ['events', 'wedding', 'banquet'],
                features: ['Banquet Hall', 'Catering', 'Decoration', 'Sound System'],
                benefits: ['Elegant Venue', 'Full Service', 'Memorable Experience']
            },
            {
                name: 'Room Service Meal',
                category: 'Dining',
                subCategory: 'Room Service',
                description: 'Delicious meals delivered directly to your room for your convenience.',
                shortDescription: 'In-room dining service',
                price: 800,
                originalPrice: 1000,
                duration: 30,
                tags: ['dining', 'room-service', 'convenience'],
                features: ['24/7 Available', 'Variety of Cuisines'],
                benefits: ['Convenience', 'Quality Food', 'Time Saving']
            },
            {
                name: 'Laundry Service',
                category: 'Services',
                subCategory: 'Housekeeping',
                description: 'Professional laundry and dry cleaning service for your garments.',
                shortDescription: 'Professional laundry service',
                price: 500,
                originalPrice: 600,
                duration: 180, // 3 hours
                tags: ['housekeeping', 'laundry', 'convenience'],
                features: ['Same Day Service', 'Dry Cleaning'],
                benefits: ['Convenience', 'Professional', 'Quick Service']
            },
            {
                name: 'Airport Transfer',
                category: 'Transport',
                subCategory: 'Transfer',
                description: 'Comfortable airport pickup and drop service with professional drivers.',
                shortDescription: 'Airport transfer service',
                price: 1500,
                originalPrice: 2000,
                duration: 60,
                tags: ['transport', 'airport', 'transfer'],
                features: ['Professional Driver', 'Comfortable Vehicle'],
                benefits: ['Convenience', 'Safety', 'Time Saving']
            },
            {
                name: 'Spa Package',
                category: 'Wellness',
                subCategory: 'Spa',
                description: 'Relaxing spa package including massage, facial, and body treatment.',
                shortDescription: 'Complete spa experience',
                price: 4000,
                originalPrice: 5000,
                duration: 180,
                tags: ['wellness', 'spa', 'package'],
                features: ['Massage', 'Facial', 'Body Treatment'],
                benefits: ['Relaxation', 'Rejuvenation', 'Complete Experience']
            }
        ]
    },
    salon: {
        services: [
            {
                name: 'Hair Cut & Styling',
                category: 'Hair',
                subCategory: 'Cutting',
                description: 'Professional haircut with styling using premium products for a fresh new look.',
                shortDescription: 'Professional haircut and styling',
                price: 800,
                originalPrice: 1000,
                duration: 45,
                tags: ['hair', 'cutting', 'styling', 'popular'],
                features: ['Premium Products', 'Expert Stylist', 'Consultation'],
                benefits: ['Fresh Look', 'Professional Cut', 'Styling Tips']
            },
            {
                name: 'Hair Coloring',
                category: 'Hair',
                subCategory: 'Coloring',
                description: 'Expert hair coloring service with premium color products for vibrant, long-lasting results.',
                shortDescription: 'Professional hair coloring',
                price: 2500,
                originalPrice: 3000,
                duration: 120,
                tags: ['hair', 'coloring', 'premium'],
                features: ['Premium Colors', 'Color Consultation', 'Aftercare'],
                benefits: ['Vibrant Color', 'Long Lasting', 'Expert Application']
            },
            {
                name: 'Hair Treatment',
                category: 'Hair',
                subCategory: 'Treatment',
                description: 'Deep conditioning hair treatment for damaged, dry, or frizzy hair.',
                shortDescription: 'Deep conditioning treatment',
                price: 1500,
                originalPrice: 2000,
                duration: 60,
                tags: ['hair', 'treatment', 'repair'],
                features: ['Deep Conditioning', 'Hair Mask', 'Steam Treatment'],
                benefits: ['Hair Repair', 'Smoothness', 'Shine']
            },
            {
                name: 'Bridal Makeup',
                category: 'Makeup',
                subCategory: 'Bridal',
                description: 'Complete bridal makeup package with trial session and professional application.',
                shortDescription: 'Complete bridal makeup',
                price: 5000,
                originalPrice: 6000,
                duration: 180,
                tags: ['makeup', 'bridal', 'premium'],
                features: ['Trial Session', 'Long Lasting', 'Touch-up Kit'],
                benefits: ['Perfect Look', 'Long Lasting', 'Professional']
            },
            {
                name: 'Facial Treatment',
                category: 'Skincare',
                subCategory: 'Facial',
                description: 'Rejuvenating facial treatment for glowing, healthy skin with premium products.',
                shortDescription: 'Rejuvenating facial',
                price: 1200,
                originalPrice: 1500,
                duration: 60,
                tags: ['facial', 'skincare', 'glowing'],
                features: ['Deep Cleansing', 'Exfoliation', 'Mask', 'Massage'],
                benefits: ['Glowing Skin', 'Hydration', 'Anti-Aging']
            },
            {
                name: 'Hair Spa',
                category: 'Hair',
                subCategory: 'Spa',
                description: 'Luxurious hair spa treatment for complete hair care and relaxation.',
                shortDescription: 'Luxurious hair spa',
                price: 1800,
                originalPrice: 2200,
                duration: 90,
                tags: ['hair', 'spa', 'luxury'],
                features: ['Scalp Massage', 'Hair Mask', 'Steam'],
                benefits: ['Hair Health', 'Relaxation', 'Nourishment']
            },
            {
                name: 'Nail Art',
                category: 'Nails',
                subCategory: 'Art',
                description: 'Creative nail art designs with premium nail polish and decorations.',
                shortDescription: 'Creative nail art',
                price: 600,
                originalPrice: 800,
                duration: 45,
                tags: ['nails', 'art', 'creative'],
                features: ['Design Options', 'Premium Polish', 'Decorations'],
                benefits: ['Creative Design', 'Long Lasting', 'Trendy']
            },
            {
                name: 'Waxing Service',
                category: 'Hair Removal',
                subCategory: 'Waxing',
                description: 'Professional waxing service for smooth, hair-free skin.',
                shortDescription: 'Professional waxing',
                price: 800,
                originalPrice: 1000,
                duration: 30,
                tags: ['waxing', 'hair-removal', 'smooth'],
                features: ['Premium Wax', 'Quick Service', 'Aftercare'],
                benefits: ['Smooth Skin', 'Long Lasting', 'Professional']
            },
            {
                name: 'Threading',
                category: 'Hair Removal',
                subCategory: 'Threading',
                description: 'Traditional threading service for precise eyebrow and facial hair removal.',
                shortDescription: 'Traditional threading',
                price: 300,
                originalPrice: 400,
                duration: 15,
                tags: ['threading', 'eyebrow', 'traditional'],
                features: ['Precise', 'Traditional Technique'],
                benefits: ['Precise Shape', 'Quick', 'Natural']
            },
            {
                name: 'Hair Styling Package',
                category: 'Hair',
                subCategory: 'Package',
                description: 'Complete hair styling package including cut, color, and treatment.',
                shortDescription: 'Complete hair package',
                price: 4000,
                originalPrice: 5000,
                duration: 180,
                tags: ['hair', 'package', 'complete'],
                features: ['Cut', 'Color', 'Treatment', 'Styling'],
                benefits: ['Complete Makeover', 'Value Package', 'Expert Service']
            }
        ]
    }
};

// Helper function to get random items from array
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Helper function to generate image URLs
function generateServiceImages(serviceName, category) {
    const baseImages = {
        massage: [
            'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
            'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800'
        ],
        facial: [
            'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
        ],
        hair: [
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
            'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
        ],
        accommodation: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1551882547-ec40ba7bca36?w=800'
        ],
        default: [
            'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
        ]
    };

    let imageCategory = 'default';
    if (category.toLowerCase().includes('massage') || category.toLowerCase().includes('spa')) {
        imageCategory = 'massage';
    } else if (category.toLowerCase().includes('facial') || category.toLowerCase().includes('skincare')) {
        imageCategory = 'facial';
    } else if (category.toLowerCase().includes('hair')) {
        imageCategory = 'hair';
    } else if (category.toLowerCase().includes('accommodation') || category.toLowerCase().includes('room')) {
        imageCategory = 'accommodation';
    }

    const images = baseImages[imageCategory] || baseImages.default;
    return {
        thumbnail: images[0],
        images: images,
        videoUrl: null
    };
}

async function createServices() {
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

        // Get all businesses with their staff
        const businesses = await Business.find({ admin: admin._id, isActive: true })
            .populate('staff')
            .select('_id name branch type city staff')
            .sort({ createdAt: 1 });

        if (businesses.length === 0) {
            console.error('❌ No businesses found. Please create businesses first using createBusinesses.js');
            process.exit(1);
        }

        console.log(`📦 Found ${businesses.length} businesses\n`);
        console.log(`🛍️  Creating services for each business (5-10 services per business)...\n`);

        let totalCreated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const servicesPerBusiness = [];

        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            const config = serviceConfigs[business.type] || serviceConfigs.spa;
            
            // Select 5-10 random services for this business
            const numServices = 5 + Math.floor(Math.random() * 6); // 5-10 services
            const selectedServices = getRandomItems(config.services, numServices);
            
            let created = 0;
            let skipped = 0;
            let errors = 0;

            console.log(`\n🏢 [${i + 1}/${businesses.length}] ${business.name} - ${business.branch} (${business.type})`);
            console.log(`   Creating ${numServices} services...\n`);

            // Get staff for this business (for assignment)
            const businessStaff = business.staff || [];
            const therapists = businessStaff.filter(s => s.role === 'therapist' || s.role === 'stylist');
            const availableStaff = therapists.length > 0 ? therapists : businessStaff.slice(0, 3);

            for (let j = 0; j < selectedServices.length; j++) {
                const serviceTemplate = selectedServices[j];
                
                try {
                    // Check if service already exists
                    const existingService = await Service.findOne({
                        business: business._id,
                        name: serviceTemplate.name
                    });

                    if (existingService) {
                        skipped++;
                        continue;
                    }

                    // Generate service images
                    const imageData = generateServiceImages(serviceTemplate.name, serviceTemplate.category);

                    // Assign staff (1-3 staff members)
                    const numAssignedStaff = Math.min(1 + Math.floor(Math.random() * 3), availableStaff.length);
                    const assignedStaff = getRandomItems(availableStaff, numAssignedStaff).map(s => s._id);

                    // Create service
                    const service = await Service.create({
                        business: business._id,
                        name: serviceTemplate.name,
                        description: serviceTemplate.description,
                        shortDescription: serviceTemplate.shortDescription,
                        category: serviceTemplate.category,
                        subCategory: serviceTemplate.subCategory,
                        tags: serviceTemplate.tags,
                        price: serviceTemplate.price,
                        originalPrice: serviceTemplate.originalPrice,
                        currency: 'INR',
                        pricingType: 'fixed',
                        serviceType: 'service',
                        duration: serviceTemplate.duration,
                        bufferTime: 15,
                        isActive: true,
                        isAvailableOnline: true,
                        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
                        availableTimeSlots: [
                            { start: '09:00', end: '12:00' },
                            { start: '14:00', end: '18:00' },
                            { start: '18:00', end: '21:00' }
                        ],
                        requiresStaff: true,
                        minStaffRequired: 1,
                        assignedStaff: assignedStaff,
                        staffCommission: {
                            type: 'percentage',
                            value: 10 + Math.floor(Math.random() * 10) // 10-20%
                        },
                        images: imageData.images,
                        thumbnail: imageData.thumbnail,
                        videoUrl: imageData.videoUrl,
                        features: serviceTemplate.features || [],
                        benefits: serviceTemplate.benefits || [],
                        allowOnlineBooking: true,
                        advanceBookingDays: 30,
                        minBookingNotice: 2,
                        cancellationPolicy: {
                            allowed: true,
                            hoursBeforeService: 24,
                            cancellationFee: 0
                        },
                        ratings: {
                            average: 4.0 + Math.random() * 1.0, // 4.0-5.0
                            count: Math.floor(Math.random() * 50)
                        },
                        stats: {
                            totalBookings: Math.floor(Math.random() * 100),
                            totalRevenue: 0,
                            popularity: Math.floor(Math.random() * 100)
                        },
                        displayOrder: j + 1,
                        isFeatured: j < 3, // First 3 are featured
                        createdBy: admin._id,
                        createdByModel: 'Admin'
                    });

                    created++;
                    totalCreated++;

                    if (j < 3) { // Show first 3 services
                        console.log(`   ✅ ${j + 1}. ${serviceTemplate.name}`);
                        console.log(`      Price: ₹${serviceTemplate.price} | Duration: ${serviceTemplate.duration} min | Category: ${serviceTemplate.category}`);
                    }

                } catch (error) {
                    errors++;
                    totalErrors++;
                    if (error.code === 11000) {
                        skipped++;
                        totalSkipped++;
                    } else {
                        console.error(`   ❌ Error creating service ${j + 1}:`, error.message);
                    }
                }
            }

            servicesPerBusiness.push({
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
        servicesPerBusiness.forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.business} - ${item.branch}: ${item.created} services`);
        });
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
createServices();

