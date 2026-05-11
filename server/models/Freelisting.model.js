const mongoose = require('mongoose');

const FreelistingSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true
    },
    user_phone: {
        type: Number,
        required: true
    },
    user_email: {
        type: String,
    },
    business_name: {
        type: String,
        required: true
    },
    business_category: {
        type: String,
        required: true,
        enum: ['spa & wellness', 'salon', 'beauty parlor', 'other']
    },
    number_of_outlets: {
        type: Number,
        required: true
    },
    message: {
        type: String
    },

},
    { timestamps: true }
);

module.exports = mongoose.model('Freelisting', FreelistingSchema);