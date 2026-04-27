/**
 * Script to create Appointments for customers (5-15 appointments per business)
 * Usage: node server/scripts/createAppointments.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Appointment = require('../models/Appointment');

// Helper function to generate random date within range
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to add minutes to time string
function addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
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

// Appointment statuses with weights
const appointmentStatuses = [
    { status: 'completed', weight: 50 }, // 50% completed
    { status: 'confirmed', weight: 20 },  // 20% confirmed
    { status: 'pending', weight: 15 },   // 15% pending
    { status: 'cancelled', weight: 10 },  // 10% cancelled
    { status: 'no_show', weight: 5 }      // 5% no show
];

function getRandomStatus() {
    const totalWeight = appointmentStatuses.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of appointmentStatuses) {
        random -= item.weight;
        if (random <= 0) {
            return item.status;
        }
    }
    return 'completed';
}

// Payment statuses based on appointment status
function getPaymentStatus(appointmentStatus, totalAmount) {
    if (appointmentStatus === 'completed') {
        return Math.random() > 0.1 ? 'paid' : 'partial'; // 90% paid, 10% partial
    }
    if (appointmentStatus === 'cancelled') {
        return Math.random() > 0.7 ? 'refunded' : 'pending'; // 30% refunded
    }
    if (appointmentStatus === 'confirmed') {
        return Math.random() > 0.5 ? 'partial' : 'pending'; // 50% partial
    }
    return 'pending';
}

// Payment methods
const paymentMethods = ['cash', 'card', 'upi', 'wallet', 'netbanking'];

async function createAppointments() {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        // Get admin
        const admin = await Admin.findOne({ email: 'dos.dineshmaurya@gmail.com' });
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
        console.log(`📅 Creating appointments for each business (5-15 appointments per business)...\n`);

        let totalCreated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const appointmentsPerBusiness = [];

        // Date ranges
        const now = new Date();
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const oneMonthAhead = new Date(now);
        oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 1);

        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];

            // Get customers, services, and staff for this business
            const customers = await Customer.find({ business: business._id, isActive: true }).limit(20);
            const services = await Service.find({ business: business._id, isActive: true });
            const staff = await Staff.find({ business: business._id, isActive: true });

            if (customers.length === 0 || services.length === 0) {
                console.log(`⚠️  [${i + 1}/${businesses.length}] Skipped: ${business.name} - ${business.branch} (no customers or services)`);
                continue;
            }

            // Number of appointments per business
            const numAppointments = 5 + Math.floor(Math.random() * 11); // 5-15 appointments

            let created = 0;
            let skipped = 0;
            let errors = 0;

            console.log(`\n🏢 [${i + 1}/${businesses.length}] ${business.name} - ${business.branch} (${business.type})`);
            console.log(`   Creating ${numAppointments} appointments...\n`);

            for (let j = 0; j < numAppointments; j++) {
                try {
                    // Select random customer, service, and staff
                    const customer = getRandomItem(customers);
                    const service = getRandomItem(services);
                    const assignedStaff = service.assignedStaff && service.assignedStaff.length > 0
                        ? getRandomItem(service.assignedStaff)
                        : (staff.length > 0 ? getRandomItem(staff)._id : null);

                    // Generate appointment date (past, present, or future)
                    const isPast = Math.random() > 0.3; // 70% past appointments
                    const appointmentDate = isPast
                        ? randomDate(threeMonthsAgo, now)
                        : randomDate(now, oneMonthAhead);

                    // Generate time slots
                    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
                    const startTime = getRandomItem(timeSlots);
                    const duration = service.duration || 60;
                    const endTime = addMinutes(startTime, duration);

                    // Calculate pricing
                    const servicePrice = service.price;
                    const discount = Math.random() > 0.7 ? Math.floor(servicePrice * 0.1) : 0; // 30% chance of discount
                    const tax = Math.floor((servicePrice - discount) * 0.18); // 18% GST
                    const totalAmount = servicePrice - discount + tax;

                    // Determine status
                    const status = getRandomStatus();
                    const paymentStatus = getPaymentStatus(status, totalAmount);
                    const paymentMethod = getRandomItem(paymentMethods);

                    // Calculate paid amount based on payment status
                    let paidAmount = 0;
                    let advanceAmount = 0;
                    if (paymentStatus === 'paid') {
                        paidAmount = totalAmount;
                    } else if (paymentStatus === 'partial') {
                        advanceAmount = Math.floor(totalAmount * 0.5);
                        paidAmount = advanceAmount;
                    }

                    // Set completion/check-in times for completed appointments
                    let completedAt = null;
                    let checkInTime = null;
                    let checkOutTime = null;
                    let actualDuration = null;

                    if (status === 'completed' && isPast) {
                        checkInTime = new Date(appointmentDate);
                        const [hours, mins] = startTime.split(':').map(Number);
                        checkInTime.setHours(hours, mins, 0, 0);
                        checkInTime.setMinutes(checkInTime.getMinutes() + Math.floor(Math.random() * 10)); // 0-10 min late

                        checkOutTime = new Date(checkInTime);
                        checkOutTime.setMinutes(checkOutTime.getMinutes() + duration + Math.floor(Math.random() * 15)); // Actual duration

                        completedAt = checkOutTime;
                        actualDuration = Math.floor((checkOutTime - checkInTime) / (1000 * 60));
                    }

                    // Cancellation details
                    let cancellationReason = null;
                    let cancelledBy = null;
                    let cancelledByModel = null;
                    let cancelledAt = null;
                    let cancellationFee = 0;

                    if (status === 'cancelled') {
                        cancellationReason = getRandomItem([
                            'Customer requested',
                            'Emergency',
                            'Weather conditions',
                            'Staff unavailable',
                            'Double booking'
                        ]);
                        cancelledBy = Math.random() > 0.5 ? customer._id : admin._id;
                        cancelledByModel = cancelledBy.toString() === customer._id.toString() ? 'Customer' : 'Admin';
                        cancelledAt = new Date(appointmentDate);
                        cancelledAt.setDate(cancelledAt.getDate() - Math.floor(Math.random() * 2)); // Cancelled 0-2 days before
                        cancellationFee = Math.random() > 0.7 ? Math.floor(totalAmount * 0.1) : 0; // 30% chance of fee
                    }

                    // Reminder and confirmation
                    const reminderSent = status !== 'cancelled' && isPast && Math.random() > 0.3; // 70% sent
                    const confirmationSent = status !== 'cancelled' && Math.random() > 0.2; // 80% sent

                    // Booking source
                    const bookingSource = getRandomItem(['walk-in', 'online', 'phone', 'whatsapp', 'social_media', 'mobile_app']);

                    // Create appointment
                    const appointment = await Appointment.create({
                        business: business._id,
                        customer: customer._id,
                        service: service._id,
                        staff: assignedStaff,
                        appointmentDate: appointmentDate,
                        startTime: startTime,
                        endTime: endTime,
                        duration: duration,
                        servicePrice: servicePrice,
                        discount: discount,
                        tax: tax,
                        totalAmount: totalAmount,
                        paymentStatus: paymentStatus,
                        paymentMethod: paymentMethod,
                        paidAmount: paidAmount,
                        advanceAmount: advanceAmount,
                        status: status,
                        bookingSource: bookingSource,
                        bookingType: 'regular',
                        customerNotes: Math.random() > 0.7 ? 'Special request noted' : null,
                        reminderSent: reminderSent,
                        reminderSentAt: reminderSent ? new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000) : null,
                        confirmationSent: confirmationSent,
                        confirmationSentAt: confirmationSent ? new Date(appointmentDate.getTime() - 2 * 24 * 60 * 60 * 1000) : null,
                        completedAt: completedAt,
                        checkInTime: checkInTime,
                        checkOutTime: checkOutTime,
                        actualDuration: actualDuration,
                        cancellationReason: cancellationReason,
                        cancelledBy: cancelledBy,
                        cancelledByModel: cancelledByModel,
                        cancelledAt: cancelledAt,
                        cancellationFee: cancellationFee,
                        loyaltyPointsEarned: status === 'completed' ? Math.floor(totalAmount / 10) : 0, // 1 point per ₹10
                        loyaltyPointsRedeemed: Math.random() > 0.8 ? Math.floor(Math.random() * 100) : 0, // 20% used points
                        createdBy: admin._id,
                        createdByModel: 'Admin'
                    });

                    created++;
                    totalCreated++;

                    if (j < 3) { // Show first 3 appointments
                        const dateStr = appointmentDate.toLocaleDateString('en-IN');
                        console.log(`   ✅ ${j + 1}. ${customer.firstName} ${customer.lastName || ''} - ${service.name}`);
                        console.log(`      Date: ${dateStr} ${startTime} | Status: ${status} | Amount: ₹${totalAmount}`);
                    }

                } catch (error) {
                    errors++;
                    totalErrors++;
                    console.error(`   ❌ Error creating appointment ${j + 1}:`, error.message);
                }
            }

            appointmentsPerBusiness.push({
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
        appointmentsPerBusiness.forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.business} - ${item.branch}: ${item.created} appointments`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Show status distribution
        const allAppointments = await Appointment.find({ business: { $in: businesses.map(b => b._id) } });
        const statusCounts = {
            pending: allAppointments.filter(a => a.status === 'pending').length,
            confirmed: allAppointments.filter(a => a.status === 'confirmed').length,
            completed: allAppointments.filter(a => a.status === 'completed').length,
            cancelled: allAppointments.filter(a => a.status === 'cancelled').length,
            no_show: allAppointments.filter(a => a.status === 'no_show').length
        };

        console.log('📊 Appointment Status Distribution:');
        console.log(`   Pending: ${statusCounts.pending}`);
        console.log(`   Confirmed: ${statusCounts.confirmed}`);
        console.log(`   Completed: ${statusCounts.completed}`);
        console.log(`   Cancelled: ${statusCounts.cancelled}`);
        console.log(`   No Show: ${statusCounts.no_show}`);
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
createAppointments();

