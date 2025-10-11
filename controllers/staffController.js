// staffController.js - Staff operations
const Staff = require("../models/Staff");
const Business = require("../models/Business");
const { deleteCache } = require("../utils/cache");

// ================== Get My Profile ==================
const getMyProfile = async (req, res, next) => {
    try {
        const staffId = req.user.id;

        const staff = await Staff.findById(staffId)
            .populate("manager", "name username")
            .populate("business", "name type branch");
        
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        return res.json({ success: true, data: staff });
    } catch (err) {
        next(err);
    }
};

// ================== Update My Profile ==================
const updateMyProfile = async (req, res, next) => {
    try {
        const staffId = req.user.id;
        const updates = req.body;

        const staff = await Staff.findByIdAndUpdate(
            staffId, 
            { ...updates, updatedAt: new Date() }, 
            { new: true }
        ).populate("manager", "name username");
        
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        // Invalidate caches
        await deleteCache(`manager:${staff.manager._id}:staff`);
        await deleteCache(`business:${staff.business}:staff`);

        return res.json({ success: true, message: "Profile updated successfully", data: staff });
    } catch (err) {
        next(err);
    }
};

// ================== Get My Business Info ==================
const getMyBusiness = async (req, res, next) => {
    try {
        const staffId = req.user.id;

        const staff = await Staff.findById(staffId).populate("business");
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        return res.json({ 
            success: true, 
            data: {
                business: staff.business,
                staff: {
                    id: staff._id,
                    name: staff.name,
                    role: staff.role,
                    specialization: staff.specialization
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    getMyBusiness
};
