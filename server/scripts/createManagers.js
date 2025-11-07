/**
 * Script to create Managers for all businesses
 * Usage: node server/scripts/createManagers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Manager = require('../models/Manager');

// Helper function to generate username from business name
function generateUsername(businessName, branch) {
    const cleanName = businessName.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 8);
    const cleanBranch = branch.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 4);
    return `${cleanName}${cleanBranch}${Math.floor(Math.random() * 100)}`;
}

// Helper function to generate manager name
function generateManagerName(businessName) {
    const names = [
        'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
        'Anjali Mehta', 'Rahul Gupta', 'Kavita Desai', 'Suresh Iyer', 'Meera Nair',
        'Arjun Joshi', 'Divya Kapoor', 'Manoj Verma', 'Pooja Agarwal', 'Kiran Rao',
        'Neha Malhotra', 'Ravi Chawla', 'Swati Banerjee', 'Deepak Shah', 'Anita Das'
    ];
    return names[Math.floor(Math.random() * names.length)];
}

// Helper function to generate phone number
function generatePhone() {
    const prefixes = ['6', '7', '8', '9'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 100000000).toString().padStart(9, '0');
    return `+91${prefix}${number}`;
}

// Helper function to generate 4-digit PIN
function generatePIN() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

async function createManagers() {
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

        // Get all businesses for this admin
        const businesses = await Business.find({ admin: admin._id, isActive: true })
            .select('_id name branch type city')
            .sort({ createdAt: 1 });

        if (businesses.length === 0) {
            console.error('❌ No businesses found. Please create businesses first using createBusinesses.js');
            process.exit(1);
        }

        console.log(`📦 Found ${businesses.length} businesses\n`);
        console.log(`👥 Creating managers for each business...\n`);

        let created = 0;
        let skipped = 0;
        let errors = 0;

        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];

            try {
                // Check if manager already exists for this business
                const existingManager = await Manager.findOne({ business: business._id });

                if (existingManager) {
                    console.log(`⏭️  [${i + 1}/${businesses.length}] Skipped: ${business.name} - ${business.branch} (manager already exists)`);
                    skipped++;
                    continue;
                }

                // Generate manager data
                const managerName = generateManagerName(business.name);
                let username = generateUsername(business.name, business.branch);
                
                // Ensure username is unique
                let usernameExists = await Manager.findOne({ username });
                let attempts = 0;
                while (usernameExists && attempts < 10) {
                    username = generateUsername(business.name, business.branch);
                    usernameExists = await Manager.findOne({ username });
                    attempts++;
                }
                
                if (usernameExists) {
                    username = `${username}${Date.now().toString().slice(-4)}`;
                }

                const pin = generatePIN();
                const phone = generatePhone();
                const email = `${username}@dishonlinesolution.com`;

                // Create manager
                const manager = await Manager.create({
                    business: business._id,
                    name: managerName,
                    username: username,
                    pin: pin,
                    email: email,
                    phone: phone,
                    isActive: true,
                    permissions: {
                        canManageStaff: true,
                        canViewReports: true,
                        canManageDailyBusiness: true,
                        canManageTransactions: true
                    }
                });

                // Add manager to business
                await Business.findByIdAndUpdate(business._id, {
                    $push: { managers: manager._id }
                });

                created++;
                console.log(`✅ [${i + 1}/${businesses.length}] Created Manager for: ${business.name} - ${business.branch}`);
                console.log(`   Manager: ${managerName}`);
                console.log(`   Username: ${username} | PIN: ${pin}`);
                console.log(`   Email: ${email} | Phone: ${phone}`);
                console.log(`   Business: ${business.type} in ${business.city}\n`);

            } catch (error) {
                errors++;
                console.error(`❌ [${i + 1}/${businesses.length}] Error creating manager for ${business.name}:`, error.message);
                
                if (error.code === 11000) {
                    console.error(`   ⚠️  Duplicate username detected, skipping...\n`);
                } else {
                    console.error(`   ⚠️  Error: ${error.message}\n`);
                }
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Summary:');
        console.log(`   ✅ Created: ${created}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📦 Total Businesses: ${businesses.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (created > 0) {
            console.log('📋 Manager Login Credentials:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // Display first 5 managers as examples
            const managers = await Manager.find({ business: { $in: businesses.map(b => b._id) } })
                .populate('business', 'name branch')
                .limit(5)
                .sort({ createdAt: -1 });
            
            managers.forEach((mgr, idx) => {
                console.log(`\n${idx + 1}. ${mgr.business.name} - ${mgr.business.branch}:`);
                console.log(`   Username: ${mgr.username}`);
                console.log(`   PIN: ${mgr.pin}`);
            });
            
            if (created > 5) {
                console.log(`\n   ... and ${created - 5} more managers`);
            }
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }

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
createManagers();

