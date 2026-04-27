/**
 * Script to create Daily Business Records from transactions
 * Usage: node server/scripts/createDailyBusiness.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');
const Transaction = require('../models/Transaction');
const DailyBusiness = require('../models/DailyBusiness');

// Helper function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random items from array
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
}

// Helper function to calculate daily metrics from transactions
function calculateDailyMetrics(transactions) {
    const metrics = {
        walkInCustomers: 0,
        appointmentCustomers: 0,
        repeatCustomers: 0,
        newCustomers: 0,
        averageServiceTime: 0,
        customerSatisfaction: 0
    };

    if (transactions.length === 0) return metrics;

    let totalServiceTime = 0;
    let totalRating = 0;
    let ratingCount = 0;

    transactions.forEach(t => {
        if (t.isNewCustomer) {
            metrics.newCustomers++;
        } else {
            metrics.repeatCustomers++;
        }

        // Assume 70% walk-in, 30% appointment
        if (Math.random() > 0.3) {
            metrics.walkInCustomers++;
        } else {
            metrics.appointmentCustomers++;
        }

        if (t.duration) {
            totalServiceTime += t.duration;
        }

        if (t.rating) {
            totalRating += t.rating;
            ratingCount++;
        }
    });

    metrics.averageServiceTime = transactions.length > 0 
        ? Math.round(totalServiceTime / transactions.length) 
        : 0;
    metrics.customerSatisfaction = ratingCount > 0 
        ? Math.round((totalRating / ratingCount) * 10) / 10 
        : 0;

    return metrics;
}

// Helper function to aggregate service-wise breakdown
function aggregateServices(transactions) {
    const serviceMap = {};

    transactions.forEach(t => {
        const serviceName = t.serviceName;
        const serviceType = t.serviceType;

        if (!serviceMap[serviceName]) {
            serviceMap[serviceName] = {
                serviceName: serviceName,
                serviceType: serviceType,
                customerCount: 0,
                totalRevenue: 0,
                averagePrice: 0
            };
        }

        serviceMap[serviceName].customerCount++;
        serviceMap[serviceName].totalRevenue += t.finalPrice || 0;
    });

    // Calculate averages
    Object.values(serviceMap).forEach(service => {
        service.averagePrice = service.customerCount > 0 
            ? Math.round(service.totalRevenue / service.customerCount) 
            : 0;
    });

    return Object.values(serviceMap);
}

// Helper function to aggregate staff performance
function aggregateStaffPerformance(transactions, staff) {
    const staffMap = {};

    transactions.forEach(t => {
        if (!t.staff) return;

        const staffId = t.staff.toString();
        if (!staffMap[staffId]) {
            staffMap[staffId] = {
                staff: t.staff,
                customersServed: 0,
                revenue: 0,
                commission: 0
            };
        }

        staffMap[staffId].customersServed++;
        staffMap[staffId].revenue += t.finalPrice || 0;
        staffMap[staffId].commission += t.staffCommission || 0;
    });

    return Object.values(staffMap);
}

async function createDailyBusiness() {
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
        console.log(`📊 Creating daily business records from transactions...\n`);

        let totalCreated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const recordsPerBusiness = [];

        // Date range - last 3 months
        const now = new Date();
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        threeMonthsAgo.setHours(0, 0, 0, 0);

        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            const manager = business.managers && business.managers.length > 0 ? business.managers[0] : null;

            if (!manager) {
                console.log(`⚠️  [${i + 1}/${businesses.length}] Skipped: ${business.name} - ${business.branch} (no manager found)`);
                continue;
            }

            // Get transactions for this business
            const allTransactions = await Transaction.find({
                business: business._id,
                paymentStatus: 'completed'
            });

            if (allTransactions.length === 0) {
                console.log(`⚠️  [${i + 1}/${businesses.length}] Skipped: ${business.name} - ${business.branch} (no transactions)`);
                continue;
            }

            // Group transactions by date
            const transactionsByDate = {};
            allTransactions.forEach(t => {
                const dateKey = t.transactionDate.toISOString().split('T')[0];
                if (!transactionsByDate[dateKey]) {
                    transactionsByDate[dateKey] = [];
                }
                transactionsByDate[dateKey].push(t);
            });

            // Get unique dates (last 90 days max)
            const dates = Object.keys(transactionsByDate)
                .sort()
                .slice(-90); // Last 90 days

            let created = 0;
            let skipped = 0;
            let errors = 0;

            console.log(`\n🏢 [${i + 1}/${businesses.length}] ${business.name} - ${business.branch} (${business.type})`);
            console.log(`   Processing ${dates.length} days with transactions...\n`);

            for (let j = 0; j < dates.length; j++) {
                const dateStr = dates[j];
                const date = new Date(dateStr);
                const dayTransactions = transactionsByDate[dateStr];

                try {
                    // Check if daily record already exists
                    const existingRecord = await DailyBusiness.findOne({
                        business: business._id,
                        date: {
                            $gte: new Date(date.setHours(0, 0, 0, 0)),
                            $lt: new Date(date.setHours(23, 59, 59, 999))
                        }
                    });

                    if (existingRecord) {
                        skipped++;
                        continue;
                    }

                    // Calculate metrics
                    const metrics = calculateDailyMetrics(dayTransactions);
                    const services = aggregateServices(dayTransactions);
                    const staffPerformance = aggregateStaffPerformance(dayTransactions, []);

                    // Calculate totals
                    const totalCustomers = dayTransactions.length;
                    const totalIncome = dayTransactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
                    const totalExpenses = Math.floor(totalIncome * 0.3); // 30% expenses (rough estimate)
                    const netProfit = totalIncome - totalExpenses;

                    // Weather and special events (random)
                    const weatherOptions = ['Sunny', 'Cloudy', 'Rainy', 'Clear', 'Partly Cloudy'];
                    const weather = getRandomItem(weatherOptions);
                    const specialEvents = [];
                    if (Math.random() > 0.7) {
                        specialEvents.push(getRandomItem(['Festival', 'Holiday', 'Special Event', 'Promotion Day']));
                    }

                    // Notes
                    const notes = totalIncome > 50000 
                        ? `High revenue day. Excellent performance.`
                        : totalIncome > 30000
                        ? `Good business day.`
                        : `Regular business day.`;

                    // Create daily business record
                    const dailyRecord = await DailyBusiness.create({
                        business: business._id,
                        manager: manager._id,
                        date: new Date(dateStr),
                        businessType: business.type,
                        totalCustomers: totalCustomers,
                        totalIncome: totalIncome,
                        totalExpenses: totalExpenses,
                        netProfit: netProfit,
                        services: services,
                        staffPerformance: staffPerformance,
                        metrics: metrics,
                        notes: notes,
                        weather: weather,
                        specialEvents: specialEvents,
                        isCompleted: true,
                        completedAt: new Date(dateStr + 'T23:59:59')
                    });

                    created++;
                    totalCreated++;

                    if (j < 3) { // Show first 3 records
                        console.log(`   ✅ ${j + 1}. ${dateStr}`);
                        console.log(`      Customers: ${totalCustomers} | Income: ₹${totalIncome.toLocaleString('en-IN')} | Profit: ₹${netProfit.toLocaleString('en-IN')}`);
                    }

                } catch (error) {
                    errors++;
                    totalErrors++;
                    console.error(`   ❌ Error creating record for ${dateStr}:`, error.message);
                }
            }

            recordsPerBusiness.push({
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
        recordsPerBusiness.forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.business} - ${item.branch}: ${item.created} daily records`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Calculate total revenue from daily records
        const allRecords = await DailyBusiness.find({ 
            business: { $in: businesses.map(b => b._id) }
        });
        const totalRevenue = allRecords.reduce((sum, r) => sum + (r.totalIncome || 0), 0);
        const totalProfit = allRecords.reduce((sum, r) => sum + (r.netProfit || 0), 0);
        const totalCustomers = allRecords.reduce((sum, r) => sum + (r.totalCustomers || 0), 0);
        
        console.log('💰 Business Summary:');
        console.log(`   Total Daily Records: ${allRecords.length}`);
        console.log(`   Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
        console.log(`   Total Profit: ₹${totalProfit.toLocaleString('en-IN')}`);
        console.log(`   Total Customers Served: ${totalCustomers}`);
        console.log(`   Average Revenue per Day: ₹${Math.floor(totalRevenue / allRecords.length).toLocaleString('en-IN')}`);
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
createDailyBusiness();

