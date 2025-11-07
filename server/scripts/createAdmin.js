/**
 * Script to create Admin account
 * Usage: node server/scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const { hashPassword } = require('../utils/hashPassword');

// Admin details
const adminData = {
    companyName: 'dish online solution',
    name: 'dinesh',
    email: 'dinesh@dishonlinesolution.com', // Default email - update if needed
    phone: '+919876543210', // Default phone - update if needed
    password: 'Pass@1234'
};

async function createAdmin() {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [
                { email: adminData.email },
                { phone: adminData.phone }
            ]
        });

        if (existingAdmin) {
            console.log('⚠️  Admin already exists with this email or phone:');
            console.log(`   Company: ${existingAdmin.companyName}`);
            console.log(`   Name: ${existingAdmin.name}`);
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Phone: ${existingAdmin.phone}`);
            console.log('\n❌ Skipping creation. Please use different email/phone or delete existing admin.');
            process.exit(0);
        }

        // Hash password
        console.log('🔐 Hashing password...');
        const hashedPassword = await hashPassword(adminData.password);

        // Create admin
        console.log('👤 Creating admin account...');
        const admin = await Admin.create({
            companyName: adminData.companyName,
            name: adminData.name,
            email: adminData.email,
            phone: adminData.phone,
            password: hashedPassword
        });

        console.log('\n✅ Admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Admin Details:');
        console.log(`   ID: ${admin._id}`);
        console.log(`   Company Name: ${admin.companyName}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Phone: ${admin.phone}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Close database connection
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error creating admin:');
        console.error(error.message);
        
        if (error.code === 11000) {
            console.error('\n⚠️  Duplicate key error: Email or phone already exists');
        }
        
        process.exit(1);
    }
}

// Run the script
createAdmin();

