require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Admin = require('../models/Admin');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb+srv://infoalgotwist_db_user:55zhwdorMn07uanx@cluster0.ejdcjld.mongodb.net/crm_dashboard';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Update business links to use 3-digit ID
const updateBusinessLinks = async () => {
    try {
        const businesses = await Business.find().populate('admin');
        
        console.log(`Found ${businesses.length} businesses to update`);
        
        let updated = 0;
        let errors = 0;
        
        for (const business of businesses) {
            try {
                const cleanCompanyName = business.admin.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const shortId = business._id.toString().slice(-3);
                const newBusinessLink = `${cleanCompanyName}_${shortId}`;
                
                // Only update if the link is different
                if (business.businessLink !== newBusinessLink) {
                    await Business.findByIdAndUpdate(business._id, { businessLink: newBusinessLink });
                    console.log(`✅ Updated: ${business.name} -> ${newBusinessLink}`);
                    updated++;
                } else {
                    console.log(`⏭️  Skipped: ${business.name} (already correct)`);
                }
            } catch (error) {
                console.error(`❌ Error updating ${business.name}:`, error.message);
                errors++;
            }
        }
        
        console.log('\n📊 Summary:');
        console.log(`   Updated: ${updated}`);
        console.log(`   Skipped: ${businesses.length - updated - errors}`);
        console.log(`   Errors: ${errors}`);
        
    } catch (error) {
        console.error('Error in updateBusinessLinks:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    }
};

// Run the migration
(async () => {
    await connectDB();
    await updateBusinessLinks();
})();

