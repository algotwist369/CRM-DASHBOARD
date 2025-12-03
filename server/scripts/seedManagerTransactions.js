/**
 * Script to seed 50+ transactions for manager Ankit's business
 * Usage: npm run seed:manager-transactions
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

const paymentMethods = ['cash', 'card', 'upi', 'wallet'];
const serviceCategories = [
    { name: 'Signature Swedish Massage', type: 'massage' },
    { name: 'Aromatherapy Bliss', type: 'massage' },
    { name: 'Detox Facial Treatment', type: 'facial' },
    { name: 'Luxury Body Wrap', type: 'spa' },
    { name: 'Hot Stone Therapy', type: 'massage' },
    { name: 'HydraGlow Facial', type: 'facial' }
];
const notesPool = [
    'Customer used loyalty points',
    'Package service',
    'Referral discount applied',
    'VIP customer session',
    'Requested preferred therapist'
];
const feedbackPool = [
    'Amazing experience!',
    'Very relaxing session',
    'Loved the service',
    'Will definitely return',
    'Professional staff'
];

const randomItem = (array) => array[Math.floor(Math.random() * array.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const slugify = (text) =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const ensureAdmin = async () => {
    const admin = await Admin.findOne().sort({ createdAt: 1 });
    if (!admin) {
        throw new Error('Admin not found. Run server/scripts/createAdmin.js first.');
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
            timezone: 'Asia/Kolkata'
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

    const isLinked = (business.managers || []).some(
        (id) => id.toString() === manager._id.toString()
    );
    if (!isLinked) {
        await Business.findByIdAndUpdate(business._id, {
            $addToSet: { managers: manager._id }
        });
    }

    return manager;
};

const ensureStaff = async (business, manager) => {
    const existingStaff = await Staff.find({ business: business._id, isActive: true });
    if (existingStaff.length >= 3) {
        return existingStaff;
    }

    const templates = [
        { name: 'Rohit Verma', role: 'therapist', specialization: 'Deep Tissue Massage' },
        { name: 'Priya Nair', role: 'therapist', specialization: 'Aromatherapy' },
        { name: 'Sonia Gupta', role: 'receptionist', specialization: 'Front Desk' },
        { name: 'Kabir Desai', role: 'therapist', specialization: 'Thai Massage' }
    ];

    const created = [];
    for (let i = existingStaff.length; i < 3; i++) {
        const template = templates[i % templates.length];
        const username = `ankit_staff_${Date.now()}_${i}`;
        const staff = await Staff.create({
            business: business._id,
            manager: manager._id,
            name: template.name,
            phone: `9${randomInt(100000000, 999999999)}`,
            email: `${username}@ankitspa.com`,
            role: template.role,
            specialization: template.specialization,
            experience: randomInt(3, 10),
            salary: randomInt(20000, 32000),
            commission: randomInt(5, 12),
            username,
            pin: randomInt(1000, 9999).toString(),
            workingHours: {
                start: '09:00',
                end: '18:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            }
        });
        created.push(staff);
    }

    return existingStaff.concat(created);
};

const ensureServices = async (business, staffMembers) => {
    const existingServices = await Service.find({ business: business._id, isActive: true });
    if (existingServices.length >= serviceCategories.length) {
        return existingServices;
    }

    const staffIds = staffMembers.map((member) => member._id);
    const created = [];

    for (const category of serviceCategories) {
        const service = await Service.create({
            business: business._id,
            name: category.name,
            description: `${category.name} tailored for premium relaxation.`,
            category: category.name,
            serviceType: 'service',
            tags: ['spa', 'wellness'],
            price: randomInt(1499, 2999),
            duration: randomInt(45, 90),
            bufferTime: 10,
            isActive: true,
            isAvailableOnline: true,
            availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            assignedStaff: staffIds,
            createdBy: business.admin,
            createdByModel: 'Admin'
        });
        created.push(service);
    }

    return existingServices.concat(created);
};

const seedTransactions = async (business, manager, services, staffMembers) => {
    const customers = await Customer.find({ business: business._id, isActive: true });
    if (!customers.length) {
        throw new Error('No customers found. Seed customers first.');
    }

    const currentCount = await Transaction.countDocuments({
        business: business._id,
        manager: manager._id
    });
    if (currentCount >= 50) {
        console.log(`ℹ️  Business already has ${currentCount} transactions. No new transactions created.`);
        return { created: 0, total: currentCount };
    }

    const toCreate = 50 - currentCount;
    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    let created = 0;

    for (let i = 0; i < toCreate; i++) {
        const customer = randomItem(customers);
        const service = randomItem(services);
        const staff = randomItem(staffMembers);

        const transactionDate = new Date(randomInt(ninetyDaysAgo.getTime(), now.getTime()));

        const basePrice = service.price || randomInt(1499, 2999);
        const discount = Math.random() > 0.75 ? Math.floor(basePrice * 0.15) : 0;
        const tax = Math.floor((basePrice - discount) * 0.18);
        const finalPrice = basePrice - discount + tax;

        const paymentMethod = randomItem(paymentMethods);
        const paymentStatus = Math.random() > 0.1 ? 'completed' : 'pending';

        const serviceStartTime = new Date(transactionDate);
        serviceStartTime.setHours(randomInt(9, 19), randomInt(0, 59), 0, 0);

        const serviceEndTime = new Date(serviceStartTime);
        const duration = service.duration || randomInt(45, 90);
        serviceEndTime.setMinutes(serviceEndTime.getMinutes() + duration);

        const rating =
            paymentStatus === 'completed' && Math.random() > 0.5 ? randomInt(3, 5) : null;
        const feedback = rating && rating >= 4 && Math.random() > 0.5 ? randomItem(feedbackPool) : null;

        await Transaction.create({
            business: business._id,
            manager: manager._id,
            staff: staff ? staff._id : null,
            customerName: `${customer.firstName} ${customer.lastName || ''}`.trim(),
            customerPhone: customer.phone,
            customerEmail: customer.email,
            isNewCustomer: Math.random() > 0.7,
            serviceName: service.name,
            serviceType: serviceCategories.find((cat) => cat.name === service.name)?.type || 'spa',
            serviceCategory: service.category,
            basePrice,
            discount,
            tax,
            finalPrice,
            paymentMethod,
            paymentStatus,
            serviceStartTime,
            serviceEndTime,
            duration,
            notes: Math.random() > 0.7 ? randomItem(notesPool) : null,
            rating,
            feedback,
            staffCommission: staff?.commission || 0,
            transactionDate
        });

        created += 1;
    }

    const total = currentCount + created;
    return { created, total };
};

const seed = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        const admin = await ensureAdmin();
        console.log(`👤 Using Admin: ${admin.companyName} (${admin.name})`);

        const business = await ensureBusiness(admin);
        const manager = await ensureManager(business);
        const staffMembers = await ensureStaff(business, manager);
        const services = await ensureServices(business, staffMembers);

        const result = await seedTransactions(business, manager, services, staffMembers);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💰 Transaction Seeding Summary');
        console.log(`   Manager Username: ${manager.username}`);
        console.log(`   Business: ${business.name} (${business.branch})`);
        console.log(`   Transactions Created This Run: ${result.created}`);
        console.log(`   Total Transactions for Business: ${result.total}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } catch (error) {
        console.error('\n❌ Error seeding manager transactions:', error.message);
        console.error(error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
    }
};

seed();

