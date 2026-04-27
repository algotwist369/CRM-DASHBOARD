const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const { connectDB } = require('../config/database');
const { parseJsonFields, handleBusinessImages } = require('../utils/fileHandler');

// Mock req.user
const mockUser = { id: null, role: 'admin' };

async function testInternalCreate() {
    try {
        console.log('🚀 Starting Internal Business Creation Test...');
        await connectDB();
        console.log('✅ DB Connected');

        const admin = await Admin.findOne({ email: 'ankitdos14@gmail.com' });
        if (!admin) throw new Error('Admin not found');
        mockUser.id = admin._id;

        // Mock req.body exactly as it comes from FormData
        const mockBody = {
            type: 'spa & wellness',
            name: 'Test Internal Diagnostic Spa ' + Date.now(),
            branch: 'Internal Branch ' + Math.floor(Math.random() * 1000),
            address: '123 Wellness Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            zipCode: '400001',
            phone: '9876543210',
            email: 'testinternal' + Date.now() + '@example.com',
            description: 'A test spa for internal diagnostic purposes.',
            googleMapsUrl: 'https://www.google.com/maps?q=19.0760,72.8777',
            images: JSON.stringify({
                logo: 'https://placehold.co/200x200?text=Logo',
                banner: 'https://placehold.co/800x400?text=Banner',
                thumbnail: 'https://placehold.co/400x400?text=Thumb',
                gallery: ['https://placehold.co/400x300?text=G1']
            }),
            socialMedia: JSON.stringify({
                facebook: 'fb.com/testspa'
            }),
            daysOff: "['[]']", // The problematic field
            holidays: '[]',
            registration: JSON.stringify({ gstNumber: '27AAAAA0000A1Z5' }),
            paymentMethods: JSON.stringify({ cash: true }),
            settings: JSON.stringify({
                workingHours: { open: "10:00", close: "20:00", days: ["monday"] },
                currency: "INR"
            }),
            tags: JSON.stringify(['Luxury']),
            features: JSON.stringify(['AC'])
        };

        console.log('📦 Parsing mock body...');
        const body = parseJsonFields(mockBody);
        
        console.log('🔍 Parsed daysOff:', JSON.stringify(body.daysOff));
        console.log('🔍 Parsed customFields:', JSON.stringify(body.customFields));

        // Destructure exactly like adminController.js
        const {
            type, name, branch, address, city, state, country, zipCode, phone, alternatePhone,
            email, website, description, googleMapsUrl, images, socialMedia, registration,
            category, subCategory, tags, specialties, paymentMethods, bankDetails, capacity,
            ratings, features, amenities, languages, seo, subscription, statistics,
            notificationPreferences, customFields, businessHours, daysOff, holidays, settings
        } = body;

        const businessData = {
            admin: mockUser.id,
            type, name, branch, address, city, state, country: country || "India"
        };

        if (zipCode) businessData.zipCode = zipCode;
        if (phone) businessData.phone = phone;
        if (email) businessData.email = email;
        if (description) businessData.description = description;
        if (googleMapsUrl) businessData.googleMapsUrl = googleMapsUrl;

        // Manual mock for images since we don't have req.files
        businessData.images = await handleBusinessImages(null, images || {});
        if (socialMedia) businessData.socialMedia = socialMedia;
        if (registration) businessData.registration = registration;
        if (tags) businessData.tags = tags;
        if (paymentMethods) businessData.paymentMethods = paymentMethods;
        if (settings) businessData.settings = settings;
        if (customFields) businessData.customFields = customFields;
        if (daysOff) businessData.daysOff = daysOff;
        if (holidays) businessData.holidays = holidays;

        console.log('📡 Attempting Business.create...');
        const business = await Business.create(businessData);
        
        console.log('✨ SUCCESS! Business created with ID:', business._id);
        process.exit(0);

    } catch (error) {
        console.error('❌ INTERNAL TEST FAILED!');
        console.error(error);
        process.exit(1);
    }
}

testInternalCreate();
