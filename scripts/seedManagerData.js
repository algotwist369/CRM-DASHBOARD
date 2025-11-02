require('dotenv').config();
const mongoose = require('mongoose');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');
const Transaction = require('../models/Transaction');
const DailyBusiness = require('../models/DailyBusiness');
const Business = require('../models/Business');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb+srv://infoalgotwist_db_user:55zhwdorMn07uanx@cluster0.ejdcjld.mongodb.net/crm_dashboard';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Database connection error:', error);
        process.exit(1);
    }
};

// Seed data for manager
const seedManagerData = async () => {
    try {
        console.log('🔍 Finding manager with username: ankit, pin: 9125...');
        
        // Find the manager
        const manager = await Manager.findOne({ username: 'ankit', pin: '9125' }).populate('business');
        
        if (!manager) {
            console.error('❌ Manager not found with username: ankit, pin: 9125');
            process.exit(1);
        }

        console.log(`✅ Found manager: ${manager.name}`);
        console.log(`✅ Business: ${manager.business.name}`);

        const businessId = manager.business._id;
        const managerId = manager._id;

        // Check if staff already exists
        const existingStaff = await Staff.find({ business: businessId, manager: managerId });
        
        if (existingStaff.length > 0) {
            console.log(`⚠️  ${existingStaff.length} staff members already exist. Adding more...`);
        }

        // Sample Staff Data
        const staffData = [
            {
                name: 'Priya Sharma',
                email: 'priya.sharma@elitehair.com',
                phone: '9876543210',
                role: 'stylist',
                specialization: 'Hair Cutting & Styling',
                experience: 5,
                salary: 25000,
                commission: 10,
                username: 'priya',
                pin: '1234',
                joiningDate: new Date('2023-01-15'),
                performance: {
                    totalCustomers: 120,
                    totalRevenue: 180000,
                    rating: 4.5,
                    reviews: 95
                }
            },
            {
                name: 'Rahul Kapoor',
                email: 'rahul.kapoor@elitehair.com',
                phone: '9876543211',
                role: 'therapist',
                specialization: 'Facial Treatments & Skincare',
                experience: 3,
                salary: 22000,
                commission: 12,
                username: 'rahul',
                pin: '2345',
                joiningDate: new Date('2023-06-01'),
                performance: {
                    totalCustomers: 85,
                    totalRevenue: 140000,
                    rating: 4.7,
                    reviews: 72
                }
            },
            {
                name: 'Sneha Patel',
                email: 'sneha.patel@elitehair.com',
                phone: '9876543212',
                role: 'receptionist',
                specialization: 'Customer Service',
                experience: 2,
                salary: 18000,
                commission: 5,
                username: 'sneha',
                pin: '3456',
                joiningDate: new Date('2023-09-10'),
                performance: {
                    totalCustomers: 0,
                    totalRevenue: 0,
                    rating: 4.8,
                    reviews: 45
                }
            },
            {
                name: 'Amit Singh',
                email: 'amit.singh@elitehair.com',
                phone: '9876543213',
                role: 'stylist',
                specialization: 'Hair Coloring & Treatment',
                experience: 4,
                salary: 23000,
                commission: 11,
                username: 'amit',
                pin: '4567',
                joiningDate: new Date('2023-03-20'),
                performance: {
                    totalCustomers: 105,
                    totalRevenue: 165000,
                    rating: 4.6,
                    reviews: 88
                }
            },
            {
                name: 'Kavita Reddy',
                email: 'kavita.reddy@elitehair.com',
                phone: '9876543214',
                role: 'therapist',
                specialization: 'Massage Therapy',
                experience: 6,
                salary: 26000,
                commission: 13,
                username: 'kavita',
                pin: '5678',
                joiningDate: new Date('2022-11-05'),
                performance: {
                    totalCustomers: 150,
                    totalRevenue: 195000,
                    rating: 4.9,
                    reviews: 132
                }
            }
        ];

        // Create staff members
        const createdStaff = [];
        for (const staff of staffData) {
            const existing = existingStaff.find(s => s.phone === staff.phone);
            if (!existing) {
                const newStaff = await Staff.create({
                    business: businessId,
                    manager: managerId,
                    ...staff
                });
                createdStaff.push(newStaff);
                console.log(`✅ Created staff: ${newStaff.name}`);
            } else {
                createdStaff.push(existing);
                console.log(`ℹ️  Staff already exists: ${existing.name}`);
            }
        }

        // Get all staff IDs (existing + newly created)
        const allStaff = await Staff.find({ business: businessId, manager: managerId });
        const staffIds = allStaff.map(s => s._id);

        // Check existing transactions
        const existingTransactions = await Transaction.countDocuments({ business: businessId, manager: managerId });
        
        if (existingTransactions > 0) {
            console.log(`⚠️  ${existingTransactions} transactions already exist. Adding more...`);
        }

        // Generate transactions for today and past 30 days
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const transactionData = [];
        const customerNames = [
            'Rajesh Kumar', 'Priya Mehta', 'Amit Desai', 'Sneha Shah', 'Rahul Gupta',
            'Kavita Joshi', 'Vikram Singh', 'Meera Patel', 'Suresh Reddy', 'Anjali Nair',
            'Rohit Sharma', 'Divya Iyer', 'Manoj Kumar', 'Swati Verma', 'Arjun Menon',
            'Nisha Rao', 'Deepak Agarwal', 'Ritu Agarwal', 'Karan Malhotra', 'Pooja Chawla'
        ];
        
        const serviceTypes = ['hair', 'facial', 'massage', 'nail', 'spa'];
        const serviceNames = [
            'Haircut & Styling', 'Hair Color', 'Hair Treatment', 'Hair Spa',
            'Deep Cleansing Facial', 'Anti-Aging Facial', 'Hydrating Facial', 'Glow Facial',
            'Swedish Massage', 'Deep Tissue Massage', 'Aromatherapy Massage', 'Thai Massage',
            'Manicure', 'Pedicure', 'Nail Art', 'Gel Polish',
            'Full Body Spa', 'Foot Spa', 'Head Spa'
        ];

        const paymentMethods = ['cash', 'card', 'upi', 'wallet'];

        // Generate transactions for the last 30 days
        for (let day = 0; day < 30; day++) {
            const transactionDate = new Date(today);
            transactionDate.setDate(transactionDate.getDate() - day);
            
            // Generate 3-8 transactions per day (more for recent days)
            const transactionsPerDay = day < 7 ? Math.floor(Math.random() * 5) + 5 : Math.floor(Math.random() * 3) + 2;
            
            for (let i = 0; i < transactionsPerDay; i++) {
                const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
                const serviceName = serviceNames[Math.floor(Math.random() * serviceNames.length)];
                const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
                const staffMember = staffIds[Math.floor(Math.random() * staffIds.length)];
                
                // Set transaction time randomly throughout the day
                const hour = Math.floor(Math.random() * 10) + 9; // 9 AM to 7 PM
                const minute = Math.floor(Math.random() * 60);
                transactionDate.setHours(hour, minute, 0, 0);
                
                const basePrice = Math.floor(Math.random() * 2000) + 500; // ₹500 to ₹2500
                const discount = Math.random() > 0.7 ? Math.floor(basePrice * 0.1) : 0; // 10% discount sometimes
                const tax = Math.floor(basePrice * 0.18); // 18% GST
                const finalPrice = basePrice - discount + tax;
                
                transactionData.push({
                    business: businessId,
                    manager: managerId,
                    staff: staffMember,
                    customerName: customerName,
                    customerPhone: `9${Math.floor(Math.random() * 90000000) + 10000000}`,
                    customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@email.com`,
                    isNewCustomer: Math.random() > 0.4,
                    serviceName: serviceName,
                    serviceType: serviceType,
                    serviceCategory: serviceName,
                    basePrice: basePrice,
                    discount: discount,
                    tax: tax,
                    finalPrice: finalPrice,
                    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                    paymentStatus: 'completed',
                    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                    notes: Math.random() > 0.8 ? 'Regular customer' : undefined,
                    transactionDate: new Date(transactionDate)
                });
            }
        }

        // Insert transactions in batches
        const batchSize = 50;
        let inserted = 0;
        for (let i = 0; i < transactionData.length; i += batchSize) {
            const batch = transactionData.slice(i, i + batchSize);
            await Transaction.insertMany(batch);
            inserted += batch.length;
            console.log(`✅ Inserted ${inserted}/${transactionData.length} transactions...`);
        }

        console.log(`✅ Created ${transactionData.length} transactions`);

        // Generate Daily Business records for the last 30 days
        const existingDailyBusiness = await DailyBusiness.countDocuments({ business: businessId, manager: managerId });
        
        if (existingDailyBusiness > 0) {
            console.log(`⚠️  ${existingDailyBusiness} daily business records already exist. Adding more...`);
        }

        // Group transactions by date for daily business records
        const transactionsByDate = {};
        const allTransactions = await Transaction.find({ business: businessId, manager: managerId });
        
        allTransactions.forEach(t => {
            const dateKey = new Date(t.transactionDate).toISOString().split('T')[0];
            if (!transactionsByDate[dateKey]) {
                transactionsByDate[dateKey] = [];
            }
            transactionsByDate[dateKey].push(t);
        });

        // Create daily business records
        for (const dateKey in transactionsByDate) {
            const date = new Date(dateKey);
            const transactions = transactionsByDate[dateKey];
            
            const totalIncome = transactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
            const totalCustomers = transactions.length;
            const uniqueCustomers = new Set(transactions.map(t => t.customerPhone)).size;
            
            // Check if record already exists
            const existing = await DailyBusiness.findOne({
                business: businessId,
                manager: managerId,
                date: { $gte: new Date(dateKey), $lt: new Date(new Date(dateKey).setDate(new Date(dateKey).getDate() + 1)) }
            });

            if (!existing) {
                // Group by service type
                const serviceBreakdown = {};
                transactions.forEach(t => {
                    const key = t.serviceType || 'other';
                    if (!serviceBreakdown[key]) {
                        serviceBreakdown[key] = { count: 0, revenue: 0 };
                    }
                    serviceBreakdown[key].count++;
                    serviceBreakdown[key].revenue += t.finalPrice || 0;
                });

                const services = Object.entries(serviceBreakdown).map(([type, data]) => ({
                    serviceName: type.charAt(0).toUpperCase() + type.slice(1),
                    serviceType: type,
                    customerCount: data.count,
                    totalRevenue: data.revenue,
                    averagePrice: data.revenue / data.count
                }));

                // Staff performance
                const staffPerformance = {};
                transactions.forEach(t => {
                    if (t.staff) {
                        const staffId = t.staff.toString();
                        if (!staffPerformance[staffId]) {
                            staffPerformance[staffId] = { customersServed: 0, revenue: 0 };
                        }
                        staffPerformance[staffId].customersServed++;
                        staffPerformance[staffId].revenue += t.finalPrice || 0;
                    }
                });

                const staffPerf = Object.entries(staffPerformance).map(([staffId, data]) => {
                    const staff = allStaff.find(s => s._id.toString() === staffId);
                    return {
                        staff: staffId,
                        customersServed: data.customersServed,
                        revenue: data.revenue,
                        commission: staff ? (data.revenue * (staff.commission || 0)) / 100 : 0
                    };
                });

                // Calculate expenses (20-30% of income)
                const totalExpenses = Math.floor(totalIncome * (0.2 + Math.random() * 0.1));
                
                await DailyBusiness.create({
                    business: businessId,
                    manager: managerId,
                    date: date,
                    businessType: manager.business.type || 'salon',
                    totalCustomers: totalCustomers,
                    totalIncome: totalIncome,
                    totalExpenses: totalExpenses,
                    netProfit: totalIncome - totalExpenses,
                    services: services,
                    staffPerformance: staffPerf,
                    metrics: {
                        walkInCustomers: Math.floor(totalCustomers * 0.3),
                        appointmentCustomers: Math.floor(totalCustomers * 0.7),
                        repeatCustomers: Math.floor(uniqueCustomers * 0.6),
                        newCustomers: uniqueCustomers - Math.floor(uniqueCustomers * 0.6),
                        averageServiceTime: 45 + Math.floor(Math.random() * 30),
                        customerSatisfaction: 4.2 + Math.random() * 0.8
                    },
                    notes: `Daily business summary for ${date.toLocaleDateString()}`,
                    isCompleted: true,
                    completedAt: new Date(date.getTime() + 20 * 60 * 60 * 1000) // 8 PM
                });

                console.log(`✅ Created daily business record for ${date.toLocaleDateString()}`);
            }
        }

        // Update manager's staff array
        await Manager.findByIdAndUpdate(managerId, {
            $set: { staff: staffIds }
        });

        // Update business staff array
        await Business.findByIdAndUpdate(businessId, {
            $set: { staff: staffIds }
        });

        console.log('\n✅ Seed data completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Staff members: ${allStaff.length}`);
        console.log(`   - Transactions: ${allTransactions.length}`);
        console.log(`   - Daily business records: ${Object.keys(transactionsByDate).length}`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    }
};

// Run the script
const run = async () => {
    await connectDB();
    await seedManagerData();
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
};

run();

