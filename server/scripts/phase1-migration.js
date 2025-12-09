/**
 * Phase 1 Data Migration Script
 * Purpose: Initialize new fields on existing records with default values
 * Safe to run multiple times (idempotent)
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const DailyBusiness = require('../models/DailyBusiness');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

/**
 * Connect to MongoDB
 */
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        log('✓ Connected to MongoDB', 'green');
    } catch (error) {
        log(`✗ MongoDB connection error: ${error.message}`, 'red');
        process.exit(1);
    }
}

/**
 * Migrate DailyBusiness records
 */
async function migrateDailyBusiness() {
    log('\n=== Migrating DailyBusiness Records ===', 'blue');

    try {
        const count = await DailyBusiness.countDocuments();
        log(`Found ${count} DailyBusiness records`, 'yellow');

        if (count === 0) {
            log('No records to migrate', 'yellow');
            return;
        }

        // Update all records to add new fields with defaults
        const result = await DailyBusiness.updateMany(
            {
                // Only update records that don't have the new fields
                $or: [
                    { revenueByPaymentMethod: { $exists: false } },
                    { expenses: { $exists: false } },
                    { cashHandling: { $exists: false } }
                ]
            },
            {
                $set: {
                    // Only set if not exists
                    revenueByPaymentMethod: {
                        cash: 0,
                        card: 0,
                        upi: 0,
                        wallet: 0,
                        bankTransfer: 0,
                        credit: 0
                    },
                    adjustments: {
                        discounts: 0,
                        refunds: 0,
                        tips: 0,
                        cancellationFees: 0
                    },
                    expenses: {
                        staff: { salaries: 0, commissions: 0, bonuses: 0 },
                        operational: { rent: 0, electricity: 0, water: 0, internet: 0, cleaning: 0, laundry: 0 },
                        inventory: { products: 0, supplies: 0 },
                        marketing: 0,
                        maintenance: 0,
                        miscellaneous: []
                    },
                    cashHandling: {
                        openingBalance: 0,
                        expectedClosing: 0,
                        actualClosing: 0,
                        variance: 0,
                        pettyCashWithdrawals: 0,
                        pettyCashDeposits: 0
                    },
                    inventoryConsumed: [],
                    operationalMetrics: {
                        totalAppointments: 0,
                        completedAppointments: 0,
                        cancelledAppointments: 0,
                        noShows: 0,
                        averageBookingValue: 0,
                        serviceUtilizationRate: 0,
                        staffUtilizationRate: 0,
                        averageServiceDuration: 0,
                        peakHours: []
                    },
                    flags: {
                        hasDiscrepancy: false,
                        requiresReview: false,
                        hasLowStock: false,
                        belowTarget: false
                    }
                }
            }
        );

        log(`✓ Updated ${result.modifiedCount} DailyBusiness records`, 'green');
    } catch (error) {
        log(`✗ DailyBusiness migration error: ${error.message}`, 'red');
    }
}

/**
 * Migrate Manager records
 */
async function migrateManagers() {
    log('\n=== Migrating Manager Records ===', 'blue');

    try {
        const count = await Manager.countDocuments();
        log(`Found ${count} Manager records`, 'yellow');

        if (count === 0) {
            log('No records to migrate', 'yellow');
            return;
        }

        // Update all records to add new permission fields
        const result = await Manager.updateMany(
            {
                $or: [
                    { accessScope: { $exists: false } },
                    { 'permissions.staff': { $exists: false } }
                ]
            },
            {
                $set: {
                    accessScope: 'all_branches',
                    assignedBranches: [],
                    'permissions.staff': {
                        view: true,
                        create: false,
                        edit: false,
                        delete: false,
                        viewSalary: false
                    },
                    'permissions.customers': {
                        view: true,
                        create: true,
                        edit: true,
                        delete: false,
                        exportData: false
                    },
                    'permissions.financial': {
                        viewRevenue: true,
                        viewExpenses: false,
                        approveExpenses: false,
                        viewProfitMargin: false
                    },
                    'permissions.appointments': {
                        view: true,
                        create: true,
                        cancel: true,
                        refund: false
                    },
                    'permissions.inventory': {
                        view: true,
                        adjustStock: false,
                        viewCost: false
                    },
                    'permissions.reports': {
                        dailyReports: true,
                        monthlyReports: false,
                        yearlyReports: false,
                        exportReports: false
                    }
                }
            }
        );

        log(`✓ Updated ${result.modifiedCount} Manager records`, 'green');
    } catch (error) {
        log(`✗ Manager migration error: ${error.message}`, 'red');
    }
}

/**
 * Migrate Staff records
 */
async function migrateStaff() {
    log('\n=== Migrating Staff Records ===', 'blue');

    try {
        const count = await Staff.countDocuments();
        log(`Found ${count} Staff records`, 'yellow');

        if (count === 0) {
            log('No records to migrate', 'yellow');
            return;
        }

        // Update all records to add new fields
        const result = await Staff.updateMany(
            {
                $or: [
                    { attendance: { $exists: false } },
                    { monthlyTarget: { $exists: false } }
                ]
            },
            {
                $set: {
                    attendance: {
                        totalWorkingDays: 0,
                        presentDays: 0,
                        absentDays: 0,
                        lateDays: 0,
                        halfDays: 0,
                        leaves: []
                    },
                    'performance.totalAppointments': 0,
                    'performance.completedAppointments': 0,
                    'performance.cancelledByStaff': 0,
                    'performance.averageRating': 0,
                    'performance.totalReviews': 0,
                    'performance.totalCommissionEarned': 0,
                    'performance.avgServiceTime': 0,
                    'performance.customerRetentionRate': 0,
                    monthlyTarget: {
                        revenue: 0,
                        appointments: 0,
                        rating: 4.5,
                        customerSatisfaction: 90
                    },
                    documents: []
                }
            }
        );

        log(`✓ Updated ${result.modifiedCount} Staff records`, 'green');
    } catch (error) {
        log(`✗ Staff migration error: ${error.message}`, 'red');
    }
}

/**
 * Create sample expense for demonstration (optional)
 */
async function createSampleData() {
    log('\n=== Creating Sample Data (Optional) ===', 'blue');
    log('Skipping sample data creation. Run manually if needed.', 'yellow');

    // Uncomment below to create sample records
    /*
    const Expense = require('../models/Expense');
    const Product = require('../models/Product');
    
    // Get first business and manager for sample
    const manager = await Manager.findOne();
    if (!manager) {
        log('No managers found. Skipping sample data.', 'yellow');
        return;
    }
    
    // Create sample expense
    await Expense.create({
        business: manager.business,
        date: new Date(),
        category: 'electricity',
        amount: 5000,
        paymentMethod: 'bank_transfer',
        description: 'Monthly electricity bill',
        status: 'approved',
        submittedBy: manager._id
    });
    
    // Create sample product
    await Product.create({
        business: manager.business,
        name: 'Shampoo',
        category: 'consumable',
        currentStock: 50,
        unit: 'bottle',
        reorderLevel: 10,
        costPrice: 150,
        sellingPrice: 250
    });
    
    log('✓ Sample data created', 'green');
    */
}

/**
 * Verify migration
 */
async function verifyMigration() {
    log('\n=== Verifying Migration ===', 'blue');

    try {
        // Check one DailyBusiness record
        const dailyBusiness = await DailyBusiness.findOne();
        if (dailyBusiness) {
            const hasNewFields =
                dailyBusiness.revenueByPaymentMethod !== undefined &&
                dailyBusiness.expenses !== undefined &&
                dailyBusiness.cashHandling !== undefined;

            log(`DailyBusiness new fields: ${hasNewFields ? '✓ Present' : '✗ Missing'}`, hasNewFields ? 'green' : 'red');
        }

        // Check one Manager record
        const manager = await Manager.findOne();
        if (manager) {
            const hasNewPermissions =
                manager.accessScope !== undefined &&
                manager.permissions.staff !== undefined;

            log(`Manager new permissions: ${hasNewPermissions ? '✓ Present' : '✗ Missing'}`, hasNewPermissions ? 'green' : 'red');
        }

        // Check one Staff record
        const staff = await Staff.findOne();
        if (staff) {
            const hasNewFields =
                staff.attendance !== undefined &&
                staff.monthlyTarget !== undefined;

            log(`Staff new fields: ${hasNewFields ? '✓ Present' : '✗ Missing'}`, hasNewFields ? 'green' : 'red');
        }

        log('\n✓ Migration verification complete', 'green');
    } catch (error) {
        log(`✗ Verification error: ${error.message}`, 'red');
    }
}

/**
 * Main migration function
 */
async function runMigration() {
    log('\n╔════════════════════════════════════════════════════╗', 'bright');
    log('║     PHASE 1 DATA MODEL MIGRATION SCRIPT          ║', 'bright');
    log('╚════════════════════════════════════════════════════╝\n', 'bright');

    try {
        await connectDB();

        await migrateDailyBusiness();
        await migrateManagers();
        await migrateStaff();
        await createSampleData();
        await verifyMigration();

        log('\n╔════════════════════════════════════════════════════╗', 'green');
        log('║     MIGRATION COMPLETED SUCCESSFULLY!             ║', 'green');
        log('╚════════════════════════════════════════════════════╝\n', 'green');

        log('Next Steps:', 'yellow');
        log('1. Review the migration results above', 'reset');
        log('2. Test the application to ensure backward compatibility', 'reset');
        log('3. Proceed to Phase 2 implementation', 'reset');

    } catch (error) {
        log(`\n✗ Migration failed: ${error.message}`, 'red');
        console.error(error);
    } finally {
        await mongoose.connection.close();
        log('\n✓ Database connection closed', 'yellow');
        process.exit(0);
    }
}

// Run migration if script is executed directly
if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };
