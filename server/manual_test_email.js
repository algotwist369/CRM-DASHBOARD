const mongoose = require('mongoose');
const { sendTemplateMail } = require('./utils/sendMail');
const Appointment = require('./models/Appointment');
const Business = require('./models/Business');
const Customer = require('./models/Customer');
const Service = require('./models/Service');
// Register other models required for population
require('./models/Admin');
require('./models/Manager');
require('./models/Staff');
require('./models/OTP');
const { createAppointment, cancelAppointment, updateAppointmentStatus } = require('./controllers/appointmentController');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Mock Response Object
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

// Mock Next
const mockNext = (err) => {
    if (err) console.error('❌ MOCK ERROR:', err);
};

const runTest = async () => {
    console.log('🚀 Starting Email System Integration Test...');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ DB Connected');

        // 1. Find Test Data
        const business = await Business.findOne();
        if (!business) throw new Error('No business found');

        const service = await Service.findOne({ business: business._id });
        if (!service) throw new Error('No service found');

        let customer = await Customer.findOne({ business: business._id });
        if (!customer) {
            customer = await Customer.create({
                business: business._id,
                firstName: 'Test',
                lastName: 'Customer',
                email: 'test@example.com',
                phone: '1234567890'
            });
        }

        console.log(`📋 Using Business: ${business.name} | Customer: ${customer.email}`);

        // 2. Test Queue Performance (Direct Utility)
        console.log('\n🧪 TEST 1: High-Concurrency Queue Test (20 emails)');
        const promises = [];
        for (let i = 0; i < 20; i++) {
            promises.push(sendTemplateMail({
                to: 'test-queue@example.com',
                template: 'appointment_confirmation',
                data: {
                    customerName: `Test User ${i}`,
                    businessName: business.name,
                    confirmationCode: `TEST-${i}`
                }
            }));
        }
        // Don't await individual, allow them to queue
        console.log('   All 20 requests fired. Watch console for batched sending...');
        await Promise.all(promises);
        console.log('✅ Queue Test Complete');

        // 3. Test Controller Integration (Create Appointment)
        console.log('\n🧪 TEST 2: Controller - createAppointment');
        const reqCreate = {
            user: { id: business.admin, role: 'admin' },
            body: {
                businessId: business._id,
                customerId: customer._id,
                serviceId: service._id,
                appointmentDate: new Date(),
                startTime: '10:00',
                endTime: '11:00'
            }
        };
        const resCreate = mockRes();
        await createAppointment(reqCreate, resCreate, mockNext);

        if (resCreate.data?.success) {
            console.log('✅ Creation Success. Appointment ID:', resCreate.data.data.bookingNumber);
            const appointmentId = resCreate.data.data._id || (await Appointment.findOne({ bookingNumber: resCreate.data.data.bookingNumber }))._id;

            // Wait a bit for async emails to process
            await new Promise(r => setTimeout(r, 2000));

            // 4. Test Controller Integration (Cancel Appointment)
            console.log('\n🧪 TEST 3: Controller - cancelAppointment (Triggers Admin/Manager Email)');
            const reqCancel = {
                user: { id: business.admin, role: 'admin' },
                params: { id: appointmentId },
                body: { reason: 'Automated Test Cancellation' }
            };
            const resCancel = mockRes();
            await cancelAppointment(reqCancel, resCancel, mockNext);
            console.log('✅ Cancellation Response:', resCancel.data?.message);

            // Wait a bit for async emails to process
            await new Promise(r => setTimeout(r, 2000));
        } else {
            console.error('❌ Creation Failed:', resCreate.data);
        }

    } catch (error) {
        console.error('❌ FATAL TEST ERROR:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

runTest();
