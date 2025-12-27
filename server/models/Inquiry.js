const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
    business_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business"
    },
    user_name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    inquiry_type: {
        type: String,
    },
    is_recieved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});
inquirySchema.index({ business_id: 1, createdAt: -1 });
inquirySchema.index({ phone: 1 });

module.exports = mongoose.model("Inquiry", inquirySchema);