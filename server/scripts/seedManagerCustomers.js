/**
 * Script to seed demo manager (Ankit) and 50 customer records
 * Usage: node server/scripts/seedManagerCustomers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Manager = require('../models/Manager');
const Customer = require('../models/Customer');

const managerConfig = {
    name: 'Ankit Sharma',
    username: 'ankit',
    pin: '9125'
};

const businessConfig = {
    name: 'Ankit Signature Spa',
    branch: 'Main Branch',
    type: 'spa',
    address: '21 Palm Street, Near City Square',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+919812345678',
    email: 'contact@ankitspa.com',
    website: 'https://ankitspa.com'
};

const firstNames = [
    'Aarav', 'Aditi', 'Advik', 'Aisha', 'Ananya', 'Arjun', 'Avni', 'Dev', 'Diya', 'Ishaan',
    'Kavya', 'Krish', 'Meera', 'Neha', 'Parth', 'Priya', 'Rahul', 'Riya', 'Rohan', 'Saanvi',
    'Samaira', 'Shaurya', 'Shreya', 'Siddharth', 'Sneha', 'Tanvi', 'Vihaan', 'Vivaan', 'Yash', 'Zara',
    'Aryan', 'Ishani', 'Kabir', 'Kaira', 'Maya', 'Navya', 'Om', 'Pranav', 'Radha', 'Reyansh',
    'Rudra', 'Sara', 'Shivansh', 'Tara', 'Anika', 'Ayush', 'Dhruv', 'Ishita', 'Ved', 'Zoya'
];

const lastNames = [
    'Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Mehta', 'Iyer', 'Nair', 'Joshi', 'Desai',
    'Verma', 'Kapoor', 'Chawla', 'Agarwal', 'Rao', 'Malhotra', 'Banerjee', 'Das', 'Shah', 'Gupta',
    'Tiwari', 'Khanna', 'Jain', 'Saxena', 'Sinha', 'Trivedi', 'Bhatia', 'Menon', 'Nanda', 'Pillai'
];

const genders = ['male', 'female', 'other', 'prefer_not_to_say'];
const sources = ['walk-in', 'online', 'referral', 'social_media', 'advertisement', 'other'];
const timeSlots = ['morning', 'afternoon', 'evening'];
const tagsList = ['vip', 'regular', 'frequent', 'new', 'loyal', 'high-value', 'needs-follow-up'];

const slugify = (text) =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomItems = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
};

const generatePhone = async (businessId) => {
    let attempts = 0;
    while (attempts < 10) {
        const prefix = ['6', '7', '8', '9'][Math.floor(Math.random() * 4)];
        const number = `${prefix}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;

        const exists = await Customer.exists({ business: businessId, phone: number });
        if (!exists) {
            return number;
        }
        attempts++;
    }
    throw new Error('Unable to generate unique phone number');
};

const generateEmail = (firstName, lastName) => {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
    const domain = randomItem(domains);
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomSuffix}@${domain}`;
};

const ensureAdmin = async () => {
    const admin = await Admin.findOne().sort({ createdAt: 1 });
    if (!admin) {
        throw new Error('No admin found. Please create an admin using server/scripts/createAdmin.js');
    }
    return admin;
};

const ensureBusiness = async (admin) => {
    let business = await Business.findOne({
        name: businessConfig.name,
        branch: businessConfig.branch
    });

    if (business) {
        return business;
    }

    const baseLink = slugify(`${businessConfig.name}-${businessConfig.branch}`);
    let businessLink = baseLink;
    let suffix = 1;

    while (await Business.exists({ businessLink })) {
        businessLink = `${baseLink}-${suffix++}`;
    }

    business = await Business.create({
        admin: admin._id,
        type: businessConfig.type,
        name: businessConfig.name,
        branch: businessConfig.branch,
        address: businessConfig.address,
        city: businessConfig.city,
        state: businessConfig.state,
        country: 'India',
        zipCode: '400001',
        phone: businessConfig.phone,
        email: businessConfig.email,
        website: businessConfig.website,
        businessLink,
        description: 'Signature spa managed by Ankit, focused on premium wellness experiences.',
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        amenities: ['WiFi', 'AC', 'Parking', 'Refreshments', 'Changing Rooms'],
        features: ['Luxury Spa', 'Experienced Therapists', 'Personalized Treatments'],
        settings: {
            workingHours: {
                open: '09:00',
                close: '21:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            appointmentSettings: {
                advanceBookingDays: 30,
                minAdvanceBookingHours: 2,
                maxAdvanceBookingHours: 720,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true,
                cancellationPolicy: {
                    allowCancellation: true,
                    minCancellationHours: 4,
                    refundPercentage: 80
                },
                reminderSettings: {
                    sendSMSReminder: true,
                    sendEmailReminder: true,
                    sendWhatsappReminder: false,
                    reminderHours: 24
                }
            }
        }
    });

    console.log(`🏢 Created business "${business.name}" (${business.branch})`);
    return business;
};

const ensureManager = async (business) => {
    let manager = await Manager.findOne({ username: managerConfig.username });

    if (manager) {
        let needsUpdate = false;

        if (manager.pin !== managerConfig.pin) {
            manager.pin = managerConfig.pin;
            needsUpdate = true;
        }

        if (!manager.business || manager.business.toString() !== business._id.toString()) {
            manager.business = business._id;
            needsUpdate = true;
        }

        if (needsUpdate) {
            await manager.save();
            console.log(`🔁 Updated manager "${manager.username}" with latest configuration`);
        }
    } else {
        manager = await Manager.create({
            business: business._id,
            name: managerConfig.name,
            username: managerConfig.username,
            pin: managerConfig.pin,
            email: 'ankit.manager@ankitspa.com',
            phone: '+919812345670',
            isActive: true,
            permissions: {
                canManageStaff: true,
                canViewReports: true,
                canManageDailyBusiness: true,
                canManageTransactions: true
            }
        });
        console.log(`👤 Created manager "${manager.username}" with PIN ${manager.pin}`);
    }

    // Ensure manager is listed in business managers array
    const isManagerLinked = business.managers?.some((id) => id.toString() === manager._id.toString());
    if (!isManagerLinked) {
        await Business.findByIdAndUpdate(business._id, {
            $addToSet: { managers: manager._id }
        });
    }

    return manager;
};

const createCustomers = async (business, manager, targetCount = 50) => {
    const existingCount = await Customer.countDocuments({ business: business._id });

    if (existingCount >= targetCount) {
        console.log(`ℹ️  Business already has ${existingCount} customers. No new customers created.`);
        return { created: 0, total: existingCount };
    }

    const toCreate = targetCount - existingCount;
    let created = 0;

    console.log(`👥 Creating ${toCreate} customers for ${business.name} (${business.branch})`);

    for (let i = 0; i < toCreate; i++) {
        const firstName = randomItem(firstNames);
        const lastName = randomItem(lastNames);
        const phone = await generatePhone(business._id);
        const email = generateEmail(firstName, lastName);
        const gender = randomItem(genders);
        const source = randomItem(sources);

        const totalVisits = Math.floor(Math.random() * 25);
        const avgSpend = totalVisits > 0 ? 500 + Math.floor(Math.random() * 2500) : 0;
        const totalSpent = totalVisits * avgSpend;
        const customerType = totalVisits >= 15 ? 'vip' : totalVisits >= 5 ? 'regular' : 'new';
        const loyaltyPoints = Math.floor(totalSpent / 10);
        const membershipTier =
            loyaltyPoints >= 10000 ? 'platinum' :
            loyaltyPoints >= 5000 ? 'gold' :
            loyaltyPoints >= 2000 ? 'silver' :
            loyaltyPoints >= 500 ? 'bronze' :
            'none';

        let firstVisit = null;
        let lastVisit = null;
        if (totalVisits > 0) {
            firstVisit = new Date();
            firstVisit.setMonth(firstVisit.getMonth() - Math.floor(Math.random() * 18));
            lastVisit = new Date();
            lastVisit.setDate(lastVisit.getDate() - Math.floor(Math.random() * 60));
        }

        await Customer.create({
            business: business._id,
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth: Math.random() > 0.4 ? new Date(1980 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)) : null,
            gender,
            address: {
                street: `${Math.floor(Math.random() * 200)} Palm Residency`,
                city: business.city,
                state: business.state,
                country: 'India',
                zipCode: `${400000 + Math.floor(Math.random() * 5999)}`
            },
            customerType,
            source,
            totalVisits,
            totalSpent,
            averageSpent: totalVisits > 0 ? Math.round(totalSpent / totalVisits) : 0,
            firstVisit,
            lastVisit,
            preferences: {
                preferredTimeSlots: randomItems(timeSlots, 1 + Math.floor(Math.random() * 2)),
                specialRequests: Math.random() > 0.8 ? 'Prefers aromatherapy sessions' : undefined
            },
            loyaltyPoints,
            membershipTier,
            marketingConsent: {
                email: Math.random() > 0.3,
                sms: Math.random() > 0.4,
                whatsapp: Math.random() > 0.5,
                phone: Math.random() > 0.6
            },
            tags: randomItems(tagsList, 1 + Math.floor(Math.random() * 2)),
            notes: totalVisits > 10 ? 'Frequent visitor, keep updated about new packages.' : undefined,
            createdBy: manager._id,
            createdByModel: 'Manager'
        });

        created++;

        if (created <= 3) {
            console.log(`   ✅ ${created}. ${firstName} ${lastName} (${phone})`);
        }
    }

    const total = existingCount + created;
    console.log(`📊 Created ${created} customers. Business now has ${total} customers.`);

    await Business.findByIdAndUpdate(business._id, {
        $set: {
            'stats.totalCustomers': total,
            'stats.totalAppointments': Math.max(totalVisitsPlaceholder(total), 0)
        }
    });

    return { created, total };
};

const totalVisitsPlaceholder = (customerCount) => {
    // Simple heuristic for demo stats
    return Math.floor(customerCount * 1.5);
};

const seed = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        const admin = await ensureAdmin();
        console.log(`👤 Using Admin: ${admin.name || admin.email}\n`);

        const business = await ensureBusiness(admin);
        const manager = await ensureManager(business);
        const { created, total } = await createCustomers(business, manager, 50);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 Seeding Complete');
        console.log(`   Manager Username: ${manager.username}`);
        console.log(`   Manager PIN: ${manager.pin}`);
        console.log(`   Business: ${business.name} (${business.branch})`);
        console.log(`   Customers Created This Run: ${created}`);
        console.log(`   Total Customers for Business: ${total}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } catch (error) {
        console.error('\n❌ Error seeding manager customers:', error.message);
        console.error(error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
    }
};

seed();

