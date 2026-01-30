require('dotenv').config();
const mongoose = require('mongoose');
const Manager = require('../models/Manager');

const fixVashiManager = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGO_URI || 'mongodb+srv://infoalgotwist_db_user:55zhwdorMn07uanx@cluster0.ejdcjld.mongodb.net/crm_dashboard';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Update the Vashi manager
        const managerId = '69735f2347c07fdeecbde9f2';

        const result = await Manager.findByIdAndUpdate(
            managerId,
            {
                $set: {
                    accessScope: 'own_branch',
                    assignedBranches: ['Vashi']
                }
            },
            { new: true }
        );

        if (result) {
            console.log('✅ Successfully updated manager:');
            console.log('   Manager ID:', result._id);
            console.log('   Name:', result.name);
            console.log('   Access Scope:', result.accessScope);
            console.log('   Assigned Branches:', result.assignedBranches);
        } else {
            console.log('❌ Manager not found');
        }

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

fixVashiManager();
