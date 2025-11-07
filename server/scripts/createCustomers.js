/**
 * Script to create Customers for all businesses (10-20 customers per business)
 * Usage: node server/scripts/createCustomers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const Service = require('../models/Service');

// Customer names pool
const customerFirstNames = [
    'Aarav', 'Aditi', 'Advik', 'Aisha', 'Ananya', 'Arjun', 'Avni', 'Dev', 'Diya', 'Ishaan',
    'Kavya', 'Krish', 'Meera', 'Neha', 'Parth', 'Priya', 'Rahul', 'Riya', 'Rohan', 'Saanvi',
    'Samaira', 'Shaurya', 'Shreya', 'Siddharth', 'Sneha', 'Tanvi', 'Vihaan', 'Vivaan', 'Yash', 'Zara',
    'Aaradhya', 'Abhay', 'Anika', 'Arnav', 'Ayush', 'Dhruv', 'Ishita', 'Kabir', 'Kaira', 'Kavya',
    'Maya', 'Navya', 'Om', 'Pranav', 'Radha', 'Reyansh', 'Rudra', 'Sara', 'Shivansh', 'Tara',
    'Aryan', 'Ishani', 'Krishna', 'Lakshmi', 'Manav', 'Nisha', 'Raghav', 'Saanvi', 'Ved', 'Zoya'
];

const customerLastNames = [
    'Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Mehta', 'Iyer', 'Nair', 'Joshi', 'Desai',
    'Verma', 'Kapoor', 'Chawla', 'Agarwal', 'Rao', 'Malhotra', 'Banerjee', 'Das', 'Shah', 'Gupta',
    'Tiwari', 'Khanna', 'Jain', 'Saxena', 'Sinha', 'Trivedi', 'Bhatia', 'Menon', 'Nanda', 'Pillai',
    'Bose', 'Dutta', 'Mukherjee', 'Pandey', 'Chaturvedi', 'Mishra', 'Bansal', 'Goyal', 'Rastogi', 'Bajaj',
    'Tandon', 'Sethi', 'Arora', 'Goel', 'Sood', 'Malhotra', 'Wadhwa', 'Chadha', 'Ahuja', 'Dhingra'
];

// Helper function to generate customer name
function generateCustomerName() {
    const firstName = customerFirstNames[Math.floor(Math.random() * customerFirstNames.length)];
    const lastName = customerLastNames[Math.floor(Math.random() * customerLastNames.length)];
    return { firstName, lastName };
}

// Helper function to generate phone number
function generatePhone() {
    const prefixes = ['6', '7', '8', '9'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 100000000).toString().padStart(9, '0');
    return `${prefix}${number}`;
}

// Helper function to generate email
function generateEmail(firstName, lastName) {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`;
}

// Helper function to generate date of birth (18-65 years old)
function generateDateOfBirth() {
    const age = 18 + Math.floor(Math.random() * 47); // 18-65
    const year = new Date().getFullYear() - age;
    const month = Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 28);
    return new Date(year, month, day);
}

// Helper function to generate anniversary date
function generateAnniversary() {
    const yearsAgo = Math.floor(Math.random() * 10); // 0-10 years ago
    const year = new Date().getFullYear() - yearsAgo;
    const month = Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 28);
    return new Date(year, month, day);
}

// Helper function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random items from array
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
}

// Helper function to determine customer type based on visits
function getCustomerType(visits) {
    if (visits >= 20) return 'vip';
    if (visits >= 5) return 'regular';
    if (visits > 0) return 'new';
    return 'new';
}

// Helper function to determine membership tier based on loyalty points
function getMembershipTier(points) {
    if (points >= 10000) return 'platinum';
    if (points >= 5000) return 'gold';
    if (points >= 2000) return 'silver';
    if (points >= 500) return 'bronze';
    return 'none';
}

async function createCustomers() {
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
            .select('_id name branch type city')
            .sort({ createdAt: 1 });

        if (businesses.length === 0) {
            console.error('❌ No businesses found. Please create businesses first using createBusinesses.js');
            process.exit(1);
        }

        console.log(`📦 Found ${businesses.length} businesses\n`);
        console.log(`👥 Creating customers for each business (10-20 customers per business)...\n`);

        let totalCreated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const customersPerBusiness = [];

        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            
            // Get staff and services for this business
            const staff = await Staff.find({ business: business._id, isActive: true }).limit(5);
            const services = await Service.find({ business: business._id, isActive: true }).limit(5);
            
            // Number of customers per business
            const numCustomers = 10 + Math.floor(Math.random() * 11); // 10-20 customers
            
            let created = 0;
            let skipped = 0;
            let errors = 0;

            console.log(`\n🏢 [${i + 1}/${businesses.length}] ${business.name} - ${business.branch} (${business.type})`);
            console.log(`   Creating ${numCustomers} customers...\n`);

            for (let j = 0; j < numCustomers; j++) {
                try {
                    const { firstName, lastName } = generateCustomerName();
                    const phone = generatePhone();
                    const email = generateEmail(firstName, lastName);
                    
                    // Check if customer already exists (by phone)
                    const existingCustomer = await Customer.findOne({
                        business: business._id,
                        phone: phone
                    });

                    if (existingCustomer) {
                        skipped++;
                        continue;
                    }

                    // Generate customer data
                    const dateOfBirth = Math.random() > 0.3 ? generateDateOfBirth() : null; // 70% have DOB
                    const anniversary = Math.random() > 0.7 ? generateAnniversary() : null; // 30% have anniversary
                    const gender = getRandomItem(['male', 'female', 'other', 'prefer_not_to_say']);
                    const source = getRandomItem(['walk-in', 'online', 'referral', 'social_media', 'advertisement', 'other']);
                    
                    // Generate visit history
                    const totalVisits = Math.floor(Math.random() * 30); // 0-29 visits
                    const totalSpent = totalVisits * (500 + Math.floor(Math.random() * 2000)); // ₹500-₹2500 per visit
                    const averageSpent = totalVisits > 0 ? totalSpent / totalVisits : 0;
                    
                    // Generate dates
                    let firstVisit = null;
                    let lastVisit = null;
                    if (totalVisits > 0) {
                        const monthsAgo = Math.floor(Math.random() * 24); // 0-24 months ago
                        firstVisit = new Date();
                        firstVisit.setMonth(firstVisit.getMonth() - monthsAgo);
                        
                        const daysSinceLastVisit = Math.floor(Math.random() * 90); // 0-90 days ago
                        lastVisit = new Date();
                        lastVisit.setDate(lastVisit.getDate() - daysSinceLastVisit);
                    }
                    
                    const customerType = getCustomerType(totalVisits);
                    const loyaltyPoints = Math.floor(totalSpent / 10); // 1 point per ₹10 spent
                    const membershipTier = getMembershipTier(loyaltyPoints);
                    
                    // Preferred staff and services
                    const preferredStaff = staff.length > 0 ? getRandomItems(staff, Math.min(2, staff.length)).map(s => s._id) : [];
                    const preferredServices = services.length > 0 ? getRandomItems(services, Math.min(3, services.length)).map(s => s._id) : [];
                    
                    // Marketing consent
                    const marketingConsent = {
                        email: Math.random() > 0.3, // 70% consent
                        sms: Math.random() > 0.4, // 60% consent
                        whatsapp: Math.random() > 0.5, // 50% consent
                        phone: Math.random() > 0.6 // 40% consent
                    };
                    
                    // Address
                    const address = {
                        street: `${Math.floor(Math.random() * 100)} Street`,
                        city: business.city,
                        state: business.state || 'Maharashtra',
                        country: 'India',
                        zipCode: `${Math.floor(100000 + Math.random() * 900000)}`
                    };
                    
                    // Create customer
                    const customer = await Customer.create({
                        business: business._id,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        phone: phone,
                        alternatePhone: Math.random() > 0.7 ? generatePhone() : null,
                        dateOfBirth: dateOfBirth,
                        gender: gender,
                        anniversary: anniversary,
                        address: address,
                        customerType: customerType,
                        source: source,
                        totalVisits: totalVisits,
                        totalSpent: totalSpent,
                        averageSpent: averageSpent,
                        firstVisit: firstVisit,
                        lastVisit: lastVisit,
                        preferences: {
                            preferredStaff: preferredStaff,
                            preferredServices: preferredServices,
                            preferredTimeSlots: getRandomItems(['morning', 'afternoon', 'evening'], 1 + Math.floor(Math.random() * 2))
                        },
                        loyaltyPoints: loyaltyPoints,
                        membershipTier: membershipTier,
                        membershipStartDate: loyaltyPoints > 500 ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) : null,
                        marketingConsent: marketingConsent,
                        isActive: true,
                        tags: getRandomItems(['regular', 'vip', 'frequent', 'new', 'loyal'], 1 + Math.floor(Math.random() * 2)),
                        notes: totalVisits > 10 ? `Regular customer, ${totalVisits} visits` : null,
                        createdBy: admin._id,
                        createdByModel: 'Admin'
                    });

                    created++;
                    totalCreated++;

                    if (j < 3) { // Show first 3 customers
                        console.log(`   ✅ ${j + 1}. ${firstName} ${lastName}`);
                        console.log(`      Phone: ${phone} | Visits: ${totalVisits} | Spent: ₹${totalSpent} | Type: ${customerType}`);
                    }

                } catch (error) {
                    errors++;
                    totalErrors++;
                    if (error.code === 11000) {
                        skipped++;
                        totalSkipped++;
                    } else {
                        console.error(`   ❌ Error creating customer ${j + 1}:`, error.message);
                    }
                }
            }

            customersPerBusiness.push({
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
        customersPerBusiness.forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.business} - ${item.branch}: ${item.created} customers`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Show customer type distribution
        const allCustomers = await Customer.find({ business: { $in: businesses.map(b => b._id) } });
        const typeCounts = {
            new: allCustomers.filter(c => c.customerType === 'new').length,
            regular: allCustomers.filter(c => c.customerType === 'regular').length,
            vip: allCustomers.filter(c => c.customerType === 'vip').length,
            inactive: allCustomers.filter(c => c.customerType === 'inactive').length
        };
        
        console.log('📊 Customer Type Distribution:');
        console.log(`   New: ${typeCounts.new}`);
        console.log(`   Regular: ${typeCounts.regular}`);
        console.log(`   VIP: ${typeCounts.vip}`);
        console.log(`   Inactive: ${typeCounts.inactive}`);
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
createCustomers();

