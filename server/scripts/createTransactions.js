/**
 * Script to create Transactions for all businesses (10-25 transactions per business)
 * Usage: node server/scripts/createTransactions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Manager = require('../models/Manager');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Transaction = require('../models/Transaction');

// Service types mapping
const serviceTypeMapping = {
    'Massage': 'massage',
    'Facial': 'facial',
    'Body Treatment': 'massage',
    'Hair': 'hair',
    'Makeup': 'other',
    'Nails': 'nail',
    'Hair Removal': 'other',
    'Accommodation': 'room',
    'Business': 'other',
    'Events': 'other',
    'Dining': 'food',
    'Services': 'other',
    'Transport': 'other',
    'Wellness': 'spa'
};

// Helper function to get service type from category
function getServiceType(category) {
    for (const [key, value] of Object.entries(serviceTypeMapping)) {
        if (category.includes(key)) {
            return value;
        }
    }
    return 'other';
}

// Helper function to generate random date within range
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Payment methods
const paymentMethods = ['cash', 'card', 'upi', 'wallet', 'other'];

// Service categories for hotels
const hotelServiceCategories = {
    'Deluxe Room Booking': 'Standard Room',
    'Executive Suite': 'Premium Suite',
    'Conference Room Booking': 'Business Meeting',
    'Wedding Venue Booking': 'Event Venue',
    'Room Service Meal': 'Food & Beverage',
    'Laundry Service': 'Housekeeping',
    'Airport Transfer': 'Transportation',
    'Spa Package': 'Wellness'
};

async function createTransactions() {
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

        // Get all businesses with managers
        const businesses = await Business.find({ admin: admin._id, isActive: true })
            .populate('managers')
            .select('_id name branch type city managers')
            .sort({ createdAt: 1 });

        if (businesses.length === 0) {
            console.error('❌ No businesses found. Please create businesses first using createBusinesses.js');
            process.exit(1);
        }

        console.log(`📦 Found ${businesses.length} businesses\n`);
        console.log(`💰 Creating transactions for each business (10-25 transactions per business)...\n`);

        let totalCreated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const transactionsPerBusiness = [];

        // Date ranges - last 3 months
        const now = new Date();
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            const manager = business.managers && business.managers.length > 0 ? business.managers[0] : null;

            if (!manager) {
                console.log(`⚠️  [${i + 1}/${businesses.length}] Skipped: ${business.name} - ${business.branch} (no manager found)`);
                continue;
            }

            // Get customers, services, and staff for this business
            const customers = await Customer.find({ business: business._id, isActive: true }).limit(30);
            const services = await Service.find({ business: business._id, isActive: true });
            const staff = await Staff.find({ business: business._id, isActive: true });

            if (customers.length === 0 || services.length === 0) {
                console.log(`⚠️  [${i + 1}/${businesses.length}] Skipped: ${business.name} - ${business.branch} (no customers or services)`);
                continue;
            }

            // Number of transactions per business
            const numTransactions = 10 + Math.floor(Math.random() * 16); // 10-25 transactions

            let created = 0;
            let skipped = 0;
            let errors = 0;

            console.log(`\n🏢 [${i + 1}/${businesses.length}] ${business.name} - ${business.branch} (${business.type})`);
            console.log(`   Creating ${numTransactions} transactions...\n`);

            for (let j = 0; j < numTransactions; j++) {
                try {
                    // Select random customer, service, and staff
                    const customer = getRandomItem(customers);
                    const service = getRandomItem(services);
                    const assignedStaff = staff.length > 0 ? getRandomItem(staff) : null;

                    // Generate transaction date (within last 3 months)
                    const transactionDate = randomDate(threeMonthsAgo, now);

                    // Determine if new customer
                    const isNewCustomer = Math.random() > 0.7; // 30% new customers

                    // Get service details
                    const serviceName = service.name;
                    const serviceType = getServiceType(service.category);
                    const serviceCategory = business.type === 'hotel' 
                        ? (hotelServiceCategories[serviceName] || service.category)
                        : service.category;

                    // Calculate pricing
                    const basePrice = service.price;
                    const discount = Math.random() > 0.7 ? Math.floor(basePrice * (0.1 + Math.random() * 0.2)) : 0; // 30% chance, 10-30% discount
                    const tax = Math.floor((basePrice - discount) * 0.18); // 18% GST
                    const finalPrice = basePrice - discount + tax;

                    // Payment details
                    const paymentMethod = getRandomItem(paymentMethods);
                    const paymentStatus = Math.random() > 0.1 ? 'completed' : 'pending'; // 90% completed

                    // Service timing
                    const serviceStartTime = new Date(transactionDate);
                    serviceStartTime.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0); // 9 AM - 7 PM
                    
                    const serviceDuration = service.duration || 60;
                    const serviceEndTime = new Date(serviceStartTime);
                    serviceEndTime.setMinutes(serviceEndTime.getMinutes() + serviceDuration);

                    // Staff commission
                    let staffCommission = 0;
                    if (assignedStaff && service.staffCommission) {
                        if (service.staffCommission.type === 'percentage') {
                            staffCommission = Math.floor(finalPrice * (service.staffCommission.value / 100));
                        } else {
                            staffCommission = service.staffCommission.value;
                        }
                    }

                    // Rating and feedback (for completed transactions)
                    const rating = paymentStatus === 'completed' && Math.random() > 0.3 
                        ? Math.floor(3 + Math.random() * 3) // 3-5 stars
                        : null;
                    const feedback = rating && rating >= 4 && Math.random() > 0.5
                        ? getRandomItem([
                            'Great service!',
                            'Very satisfied',
                            'Excellent experience',
                            'Will come again',
                            'Highly recommended',
                            'Amazing service',
                            'Best experience ever'
                        ])
                        : null;

                    // Notes
                    const notes = Math.random() > 0.7 
                        ? getRandomItem([
                            'Customer requested specific timing',
                            'Special discount applied',
                            'Repeat customer',
                            'VIP customer',
                            'First time visit',
                            'Referred by friend'
                        ])
                        : null;

                    // Create transaction
                    const transaction = await Transaction.create({
                        business: business._id,
                        manager: manager._id,
                        staff: assignedStaff ? assignedStaff._id : null,
                        customerName: `${customer.firstName} ${customer.lastName || ''}`.trim(),
                        customerPhone: customer.phone,
                        customerEmail: customer.email || null,
                        isNewCustomer: isNewCustomer,
                        serviceName: serviceName,
                        serviceType: serviceType,
                        serviceCategory: serviceCategory,
                        basePrice: basePrice,
                        discount: discount,
                        tax: tax,
                        finalPrice: finalPrice,
                        paymentMethod: paymentMethod,
                        paymentStatus: paymentStatus,
                        serviceStartTime: serviceStartTime,
                        serviceEndTime: serviceEndTime,
                        duration: serviceDuration,
                        notes: notes,
                        rating: rating,
                        feedback: feedback,
                        staffCommission: staffCommission,
                        transactionDate: transactionDate
                    });

                    created++;
                    totalCreated++;

                    if (j < 3) { // Show first 3 transactions
                        const dateStr = transactionDate.toLocaleDateString('en-IN');
                        console.log(`   ✅ ${j + 1}. ${customer.firstName} ${customer.lastName || ''} - ${serviceName}`);
                        console.log(`      Date: ${dateStr} | Amount: ₹${finalPrice} | Payment: ${paymentMethod} | Status: ${paymentStatus}`);
                    }

                } catch (error) {
                    errors++;
                    totalErrors++;
                    console.error(`   ❌ Error creating transaction ${j + 1}:`, error.message);
                }
            }

            transactionsPerBusiness.push({
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
        transactionsPerBusiness.forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.business} - ${item.branch}: ${item.created} transactions`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Calculate total revenue
        const allTransactions = await Transaction.find({ 
            business: { $in: businesses.map(b => b._id) },
            paymentStatus: 'completed'
        });
        const totalRevenue = allTransactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
        
        console.log('💰 Revenue Summary:');
        console.log(`   Total Transactions: ${allTransactions.length}`);
        console.log(`   Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
        console.log(`   Average Transaction: ₹${Math.floor(totalRevenue / allTransactions.length).toLocaleString('en-IN')}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Show payment method distribution
        const paymentMethodCounts = {};
        allTransactions.forEach(t => {
            paymentMethodCounts[t.paymentMethod] = (paymentMethodCounts[t.paymentMethod] || 0) + 1;
        });
        
        console.log('💳 Payment Method Distribution:');
        Object.entries(paymentMethodCounts).forEach(([method, count]) => {
            console.log(`   ${method}: ${count}`);
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
createTransactions();

