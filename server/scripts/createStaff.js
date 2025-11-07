/**
 * Script to create Staff members for all businesses (minimum 7 per business)
 * Usage: node server/scripts/createStaff.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');

// Staff names pool
const staffNames = [
    'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Vikram Mehta',
    'Anjali Reddy', 'Rajesh Iyer', 'Kavita Nair', 'Suresh Joshi', 'Meera Desai',
    'Arjun Verma', 'Divya Kapoor', 'Manoj Chawla', 'Pooja Agarwal', 'Kiran Rao',
    'Neha Malhotra', 'Ravi Banerjee', 'Swati Das', 'Deepak Shah', 'Anita Gupta',
    'Nikhil Tiwari', 'Riya Khanna', 'Siddharth Jain', 'Tanvi Saxena', 'Aditya Sinha',
    'Isha Trivedi', 'Karan Bhatia', 'Shreya Menon', 'Varun Nanda', 'Aishwarya Pillai',
    'Harsh Varma', 'Kritika Oberoi', 'Yash Chopra', 'Sanjana Mehra', 'Rohan Dutta',
    'Ananya Bose', 'Rishabh Agarwal', 'Ishita Sengupta', 'Abhishek Roy', 'Sakshi Mukherjee',
    'Vivek Pandey', 'Aditi Chaturvedi', 'Kunal Mishra', 'Ritika Bansal', 'Sahil Goyal',
    'Nisha Rastogi', 'Rohit Bajaj', 'Shivani Tandon', 'Akash Sethi', 'Pallavi Arora',
    'Himanshu Goel', 'Kavya Sood', 'Tarun Malhotra', 'Rachna Wadhwa', 'Siddhant Khurana',
    'Anushka Bhardwaj', 'Raghav Chadha', 'Shruti Ahuja', 'Kartik Dhingra', 'Mansi Kohli',
    'Rohan Mehra', 'Ishani Kapoor', 'Vedant Singh', 'Aarohi Chawla', 'Sarthak Verma'
];

// Role configurations based on business type
const roleConfigs = {
    spa: {
        roles: ['therapist', 'therapist', 'therapist', 'receptionist', 'assistant', 'assistant', 'cleaner'],
        specializations: [
            'Deep Tissue Massage', 'Swedish Massage', 'Hot Stone Therapy', 'Aromatherapy',
            'Facial Treatment', 'Body Wraps', 'Reflexology', 'Thai Massage', 'Ayurvedic Massage'
        ]
    },
    hotel: {
        roles: ['receptionist', 'receptionist', 'assistant', 'assistant', 'assistant', 'cleaner', 'cleaner'],
        specializations: [
            'Front Desk', 'Guest Relations', 'Housekeeping', 'Concierge',
            'Event Management', 'Food & Beverage', 'Maintenance'
        ]
    },
    salon: {
        roles: ['stylist', 'stylist', 'stylist', 'therapist', 'receptionist', 'assistant', 'cleaner'],
        specializations: [
            'Hair Cutting', 'Hair Coloring', 'Hair Styling', 'Hair Treatment',
            'Facial', 'Makeup', 'Nail Art', 'Waxing', 'Threading'
        ]
    }
};

// Helper function to generate username
function generateUsername(name, businessName, index) {
    const cleanName = name.toLowerCase().replace(/\s+/g, '').substring(0, 6);
    const cleanBusiness = businessName.toLowerCase().replace(/\s+/g, '').substring(0, 4);
    return `${cleanName}${cleanBusiness}${index}${Math.floor(Math.random() * 100)}`;
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

// Helper function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random items from array
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Helper function to generate working hours
function generateWorkingHours() {
    const shifts = [
        { start: '09:00', end: '18:00' },
        { start: '10:00', end: '19:00' },
        { start: '11:00', end: '20:00' },
        { start: '08:00', end: '17:00' }
    ];
    const shift = getRandomItem(shifts);
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return {
        start: shift.start,
        end: shift.end,
        days: days
    };
}

// Helper function to generate salary based on role
function generateSalary(role, experience) {
    const baseSalaries = {
        stylist: 25000,
        therapist: 30000,
        receptionist: 20000,
        assistant: 18000,
        cleaner: 15000,
        other: 20000
    };
    const base = baseSalaries[role] || 20000;
    const experienceBonus = experience * 2000;
    return base + experienceBonus + Math.floor(Math.random() * 5000);
}

// Helper function to generate commission based on role
function generateCommission(role) {
    const commissions = {
        stylist: 10,
        therapist: 12,
        receptionist: 0,
        assistant: 5,
        cleaner: 0,
        other: 0
    };
    return commissions[role] || 0;
}

async function createStaff() {
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

        // Get all businesses with their managers
        const businesses = await Business.find({ admin: admin._id, isActive: true })
            .populate('managers')
            .select('_id name branch type city managers')
            .sort({ createdAt: 1 });

        if (businesses.length === 0) {
            console.error('❌ No businesses found. Please create businesses first using createBusinesses.js');
            process.exit(1);
        }

        console.log(`📦 Found ${businesses.length} businesses\n`);
        console.log(`👥 Creating staff for each business (minimum 7 per business)...\n`);

        let totalCreated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const staffPerBusiness = [];

        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            const manager = business.managers && business.managers.length > 0 ? business.managers[0] : null;

            if (!manager) {
                console.log(`⚠️  [${i + 1}/${businesses.length}] Skipped: ${business.name} - ${business.branch} (no manager found)`);
                totalSkipped++;
                continue;
            }

            // Get role configuration for this business type
            const config = roleConfigs[business.type] || roleConfigs.spa;
            const numStaff = 7 + Math.floor(Math.random() * 3); // 7-9 staff per business
            const roles = config.roles.slice(0, numStaff);
            
            // Add extra roles if needed
            while (roles.length < numStaff) {
                roles.push(getRandomItem(config.roles));
            }

            let created = 0;
            let skipped = 0;
            let errors = 0;

            console.log(`\n🏢 [${i + 1}/${businesses.length}] ${business.name} - ${business.branch} (${business.type})`);
            console.log(`   Creating ${numStaff} staff members...\n`);

            // Shuffle staff names to avoid duplicates
            const availableNames = [...staffNames].sort(() => Math.random() - 0.5);
            let nameIndex = 0;

            for (let j = 0; j < numStaff; j++) {
                try {
                    const role = roles[j];
                    const name = availableNames[nameIndex % availableNames.length];
                    nameIndex++;

                    // Check if staff already exists
                    const existingStaff = await Staff.findOne({
                        business: business._id,
                        name: name,
                        role: role
                    });

                    if (existingStaff) {
                        skipped++;
                        continue;
                    }

                    // Generate unique username
                    let username = generateUsername(name, business.name, j);
                    let usernameExists = await Staff.findOne({ username });
                    let attempts = 0;
                    while (usernameExists && attempts < 10) {
                        username = generateUsername(name, business.name, j);
                        usernameExists = await Staff.findOne({ username });
                        attempts++;
                    }
                    if (usernameExists) {
                        username = `${username}${Date.now().toString().slice(-4)}`;
                    }

                    const pin = generatePIN();
                    const phone = generatePhone();
                    const email = `${username}@dishonlinesolution.com`;
                    const experience = Math.floor(Math.random() * 8); // 0-7 years
                    const specialization = getRandomItem(config.specializations);
                    const salary = generateSalary(role, experience);
                    const commission = generateCommission(role);
                    const workingHours = generateWorkingHours();
                    const joiningDate = new Date();
                    joiningDate.setMonth(joiningDate.getMonth() - Math.floor(Math.random() * 24)); // Joined 0-24 months ago

                    // Create staff
                    const staff = await Staff.create({
                        business: business._id,
                        manager: manager._id,
                        name: name,
                        email: email,
                        phone: phone,
                        username: username,
                        pin: pin,
                        role: role,
                        specialization: specialization,
                        experience: experience,
                        salary: salary,
                        commission: commission,
                        isActive: true,
                        joiningDate: joiningDate,
                        workingHours: workingHours,
                        address: `${Math.floor(Math.random() * 100)} Street, ${business.city}`,
                        performance: {
                            totalCustomers: Math.floor(Math.random() * 200),
                            totalRevenue: Math.floor(Math.random() * 500000),
                            rating: 4.0 + Math.random() * 1.0, // 4.0-5.0
                            reviews: Math.floor(Math.random() * 50)
                        }
                    });

                    // Add staff to business
                    await Business.findByIdAndUpdate(business._id, {
                        $push: { staff: staff._id }
                    });

                    // Add staff to manager
                    await Manager.findByIdAndUpdate(manager._id, {
                        $push: { staff: staff._id }
                    });

                    created++;
                    totalCreated++;

                    if (j < 3) { // Show first 3 staff details
                        console.log(`   ✅ ${j + 1}. ${name} - ${role} (${specialization})`);
                        console.log(`      Username: ${username} | PIN: ${pin} | Exp: ${experience} years`);
                    }

                } catch (error) {
                    errors++;
                    totalErrors++;
                    if (error.code === 11000) {
                        // Duplicate username, skip
                        skipped++;
                        totalSkipped++;
                    } else {
                        console.error(`   ❌ Error creating staff ${j + 1}:`, error.message);
                    }
                }
            }

            staffPerBusiness.push({
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
        staffPerBusiness.forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.business} - ${item.branch}: ${item.created} staff`);
        });
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
createStaff();

