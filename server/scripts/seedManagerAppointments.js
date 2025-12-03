/**
 * Script to seed 50 demo appointments for manager Ankit's business
 * Usage: npm run seed:manager-appointments
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Manager = require('../models/Manager');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');

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

const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const slugify = (text) =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const addMinutes = (timeStr, minutesToAdd) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

const ensureAdmin = async () => {
    const admin = await Admin.findOne({ email: 'dinesh@dishonlinesolution.com' });
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

    const staffTemplates = [
        { name: 'Rohit Verma', role: 'therapist', specialization: 'Deep Tissue Massage' },
        { name: 'Priya Nair', role: 'therapist', specialization: 'Aromatherapy' },
        { name: 'Sonia Gupta', role: 'receptionist', specialization: 'Front Desk' },
        { name: 'Kabir Desai', role: 'therapist', specialization: 'Thai Massage' },
        { name: 'Manisha Rao', role: 'therapist', specialization: 'Facial Treatments' }
    ];

    const createdStaff = [];
    for (let i = existingStaff.length; i < 3; i++) {
        const template = staffTemplates[i % staffTemplates.length];
        const username = `ankit_staff_${Date.now()}_${i}`;
        const staff = await Staff.create({
            business: business._id,
            manager: manager._id,
            name: template.name,
            phone: `9${randomInt(100000000, 999999999)}`,
            email: `${username}@ankitspa.com`,
            role: template.role,
            specialization: template.specialization,
            experience: randomInt(2, 8),
            salary: randomInt(18000, 28000),
            commission: randomInt(5, 12),
            username,
            pin: randomInt(1000, 9999).toString(),
            workingHours: {
                start: '09:00',
                end: '18:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            }
        });

        createdStaff.push(staff);
    }

    return existingStaff.concat(createdStaff);
};

const ensureServices = async (business, staffMembers) => {
    const existingServices = await Service.find({ business: business._id, isActive: true });
    if (existingServices.length >= 3) {
        return existingServices;
    }

    const staffIds = staffMembers.map((member) => member._id);

    const serviceTemplates = [
        {
            name: 'Signature Swedish Massage',
            description: 'Full body Swedish massage for deep relaxation and improved circulation.',
            category: 'Massage Therapy',
            tags: ['relaxation', 'full-body'],
            price: 2499,
            duration: 75
        },
        {
            name: 'Aromatherapy De-stress Session',
            description: 'Custom essential oil blend to de-stress and rejuvenate.',
            category: 'Aromatherapy',
            tags: ['aroma', 'wellness'],
            price: 1899,
            duration: 60
        },
        {
            name: 'Rejuvenating Facial Treatment',
            description: 'Skin rejuvenation facial with premium organic products.',
            category: 'Skin Care',
            tags: ['facial', 'glow'],
            price: 1599,
            duration: 50
        }
    ];

    const createdServices = [];
    for (const template of serviceTemplates) {
        const service = await Service.create({
            business: business._id,
            name: template.name,
            description: template.description,
            category: template.category,
            tags: template.tags,
            price: template.price,
            duration: template.duration,
            serviceType: 'service',
            bufferTime: 10,
            isActive: true,
            isAvailableOnline: true,
            availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            assignedStaff: staffIds,
            createdBy: business.admin,
            createdByModel: 'Admin'
        });

        createdServices.push(service);
    }

    return existingServices.concat(createdServices);
};

const randomStatus = (isPast) => {
    if (isPast) {
        return randomItem([
            'completed',
            'completed',
            'completed',
            'cancelled',
            'no_show',
            'confirmed'
        ]);
    }

    return randomItem(['pending', 'confirmed', 'confirmed']);
};

const determinePaymentStatus = (status) => {
    if (status === 'completed') {
        return Math.random() > 0.2 ? 'paid' : 'partial';
    }
    if (status === 'cancelled') {
        return Math.random() > 0.5 ? 'refunded' : 'pending';
    }
    if (status === 'confirmed') {
        return Math.random() > 0.5 ? 'partial' : 'pending';
    }

    return 'pending';
};

const bookingSources = ['walk-in', 'online', 'phone', 'whatsapp', 'social_media', 'mobile_app'];
const timeSlots = ['09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30'];

const seedAppointments = async (business, manager, services, staffMembers) => {
    const existingCustomers = await Customer.find({ business: business._id, isActive: true });
    if (existingCustomers.length === 0) {
        throw new Error('No customers found for business. Run seedManagerCustomers.js first.');
    }

    const currentCount = await Appointment.countDocuments({ business: business._id });
    if (currentCount >= 50) {
        console.log(`ℹ️  Business already has ${currentCount} appointments. No new appointments created.`);
        return { created: 0, total: currentCount };
    }

    const toCreate = 50 - currentCount;
    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const fortyFiveDaysAhead = new Date(now);
    fortyFiveDaysAhead.setDate(fortyFiveDaysAhead.getDate() + 45);

    let created = 0;

    for (let i = 0; i < toCreate; i++) {
        const customer = randomItem(existingCustomers);
        const service = randomItem(services);

        const isPast = i < Math.floor(toCreate * 0.6);
        const appointmentDate = new Date(
            isPast
                ? randomInt(ninetyDaysAgo.getTime(), now.getTime())
                : randomInt(now.getTime(), fortyFiveDaysAhead.getTime())
        );

        const startTime = randomItem(timeSlots);
        const duration = service.duration || 60;
        const endTime = addMinutes(startTime, duration);

        const status = randomStatus(isPast);
        const paymentStatus = determinePaymentStatus(status);
        const paymentMethod = randomItem(['cash', 'card', 'upi', 'wallet']);

        const basePrice = service.price || 1500;
        const discount = Math.random() > 0.7 ? Math.floor(basePrice * 0.1) : 0;
        const tax = Math.floor((basePrice - discount) * 0.18);
        const totalAmount = basePrice - discount + tax;

        let paidAmount = 0;
        let advanceAmount = 0;
        if (paymentStatus === 'paid') {
            paidAmount = totalAmount;
        } else if (paymentStatus === 'partial') {
            advanceAmount = Math.floor(totalAmount * 0.5);
            paidAmount = advanceAmount;
        }

        let cancellationReason = null;
        let cancelledBy = null;
        let cancelledByModel = null;
        let cancelledAt = null;
        let cancellationFee = 0;

        if (status === 'cancelled') {
            cancellationReason = randomItem([
                'Customer requested cancellation',
                'Staff emergency',
                'Scheduling conflict',
                'Payment not received'
            ]);
            const cancelledByCustomer = Math.random() > 0.5;
            cancelledBy = cancelledByCustomer ? customer._id : manager._id;
            cancelledByModel = cancelledByCustomer ? 'Customer' : 'Manager';
            cancelledAt = new Date(appointmentDate);
            cancelledAt.setDate(cancelledAt.getDate() - randomInt(0, 2));
            cancellationFee = Math.random() > 0.6 ? Math.floor(totalAmount * 0.1) : 0;
        }

        let completedAt = null;
        let checkInTime = null;
        let checkOutTime = null;
        let actualDuration = null;

        if (status === 'completed') {
            checkInTime = new Date(appointmentDate);
            const [startHour, startMinute] = startTime.split(':').map(Number);
            checkInTime.setHours(startHour, startMinute, 0, 0);
            checkInTime.setMinutes(checkInTime.getMinutes() + randomInt(0, 10));

            checkOutTime = new Date(checkInTime);
            checkOutTime.setMinutes(checkOutTime.getMinutes() + duration + randomInt(0, 15));

            completedAt = checkOutTime;
            actualDuration = Math.floor((checkOutTime - checkInTime) / (1000 * 60));
        }

        const assignedStaffId = randomItem(
            service.assignedStaff && service.assignedStaff.length
                ? service.assignedStaff
                : staffMembers.map((member) => member._id)
        );

        const bookingNumber = `ANK${appointmentDate.toISOString().split('T')[0].replace(/-/g, '')}${randomInt(1000, 9999)}${i}`;

        await Appointment.create({
            business: business._id,
            customer: customer._id,
            service: service._id,
            staff: assignedStaffId,
            bookingNumber,
            appointmentDate,
            startTime,
            endTime,
            duration,
            status,
            servicePrice: basePrice,
            discount,
            tax,
            totalAmount,
            paymentStatus,
            paymentMethod,
            paidAmount,
            advanceAmount,
            bookingSource: randomItem(bookingSources),
            bookingType: 'regular',
            customerNotes: Math.random() > 0.75 ? 'Customer requested calming music' : null,
            reminderSent: status !== 'cancelled' && Math.random() > 0.4,
            reminderSentAt:
                status !== 'cancelled'
                    ? new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000)
                    : null,
            confirmationSent: status !== 'cancelled' && Math.random() > 0.2,
            confirmationSentAt:
                status !== 'cancelled'
                    ? new Date(appointmentDate.getTime() - 48 * 60 * 60 * 1000)
                    : null,
            completedAt,
            checkInTime,
            checkOutTime,
            actualDuration,
            cancellationReason,
            cancelledBy,
            cancelledByModel,
            cancelledAt,
            cancellationFee,
            loyaltyPointsEarned: status === 'completed' ? Math.floor(totalAmount / 10) : 0,
            loyaltyPointsRedeemed: Math.random() > 0.85 ? randomInt(20, 120) : 0,
            createdBy: manager._id,
            createdByModel: 'Manager'
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

        const result = await seedAppointments(business, manager, services, staffMembers);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📅 Appointment Seeding Summary');
        console.log(`   Manager: ${managerConfig.username}`);
        console.log(`   Business: ${businessConfig.name} (${businessConfig.branch})`);
        console.log(`   Appointments Created This Run: ${result.created}`);
        console.log(`   Total Appointments for Business: ${result.total}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } catch (error) {
        console.error('\n❌ Error seeding appointments:', error.message);
        console.error(error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
    }
};

seed();

