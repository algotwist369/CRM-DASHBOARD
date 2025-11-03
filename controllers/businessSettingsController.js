// businessSettingsController.js - Business settings management
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const { setCache, getCache, deleteCache } = require("../utils/cache");

// ================== Get Business Settings ==================
const getBusinessSettings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId } = req.query;

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        return res.json({
            success: true,
            data: {
                settings: business.settings || {},
                businessHours: business.businessHours || {},
                holidays: business.holidays || [],
                notifications: business.notificationPreferences || {}
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Business Hours ==================
const updateBusinessHours = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId, businessHours } = req.body;

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        // Validate business hours format
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const day of daysOfWeek) {
            if (businessHours[day]) {
                const { isOpen, openTime, closeTime } = businessHours[day];
                if (isOpen && (!openTime || !closeTime)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid hours for ${day}. Please provide both openTime and closeTime.`
                    });
                }
            }
        }

        business.businessHours = businessHours;
        await business.save();

        // Invalidate cache
        await deleteCache(`business:${business._id}`);

        return res.json({
            success: true,
            message: "Business hours updated successfully",
            data: { businessHours: business.businessHours }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Appointment Settings ==================
const updateAppointmentSettings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId, appointmentSettings } = req.body;

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        if (!business.settings) {
            business.settings = {};
        }

        business.settings.appointmentSettings = {
            ...business.settings.appointmentSettings,
            ...appointmentSettings
        };

        await business.save();

        // Invalidate cache
        await deleteCache(`business:${business._id}`);

        return res.json({
            success: true,
            message: "Appointment settings updated successfully",
            data: { appointmentSettings: business.settings.appointmentSettings }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Notification Preferences ==================
const updateNotificationPreferences = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId, notificationPreferences } = req.body;

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        business.notificationPreferences = {
            ...business.notificationPreferences,
            ...notificationPreferences
        };

        await business.save();

        // Invalidate cache
        await deleteCache(`business:${business._id}`);

        return res.json({
            success: true,
            message: "Notification preferences updated successfully",
            data: { notificationPreferences: business.notificationPreferences }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Add Holiday ==================
const addHoliday = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId, date, reason } = req.body;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required"
            });
        }

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        if (!business.holidays) {
            business.holidays = [];
        }

        // Check if holiday already exists
        const holidayExists = business.holidays.some(
            h => new Date(h.date).toDateString() === new Date(date).toDateString()
        );

        if (holidayExists) {
            return res.status(400).json({
                success: false,
                message: "Holiday already exists for this date"
            });
        }

        business.holidays.push({
            date: new Date(date),
            reason: reason || "Holiday"
        });

        await business.save();

        // Invalidate cache
        await deleteCache(`business:${business._id}`);

        return res.json({
            success: true,
            message: "Holiday added successfully",
            data: { holidays: business.holidays }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Remove Holiday ==================
const removeHoliday = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId, date } = req.body;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required"
            });
        }

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        business.holidays = business.holidays.filter(
            h => new Date(h.date).toDateString() !== new Date(date).toDateString()
        );

        await business.save();

        // Invalidate cache
        await deleteCache(`business:${business._id}`);

        return res.json({
            success: true,
            message: "Holiday removed successfully",
            data: { holidays: business.holidays }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Payment Settings ==================
const updatePaymentSettings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId, paymentMethods, bankDetails } = req.body;

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        if (paymentMethods) {
            business.paymentMethods = paymentMethods;
        }

        if (bankDetails) {
            business.bankDetails = {
                ...business.bankDetails,
                ...bankDetails
            };
        }

        await business.save();

        // Invalidate cache
        await deleteCache(`business:${business._id}`);

        return res.json({
            success: true,
            message: "Payment settings updated successfully",
            data: {
                paymentMethods: business.paymentMethods,
                bankDetails: business.bankDetails
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Tax Settings ==================
const updateTaxSettings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId, taxSettings } = req.body;

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        if (!business.settings) {
            business.settings = {};
        }

        business.settings.taxSettings = {
            ...business.settings.taxSettings,
            ...taxSettings
        };

        await business.save();

        // Invalidate cache
        await deleteCache(`business:${business._id}`);

        return res.json({
            success: true,
            message: "Tax settings updated successfully",
            data: { taxSettings: business.settings.taxSettings }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update General Settings ==================
const updateGeneralSettings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId, generalSettings } = req.body;

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        if (!business.settings) {
            business.settings = {};
        }

        business.settings = {
            ...business.settings,
            ...generalSettings
        };

        await business.save();

        // Invalidate cache
        await deleteCache(`business:${business._id}`);

        return res.json({
            success: true,
            message: "General settings updated successfully",
            data: { settings: business.settings }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Loyalty Settings ==================
const updateLoyaltySettings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId, loyaltySettings } = req.body;

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        if (!business.settings) {
            business.settings = {};
        }

        business.settings.loyaltySettings = {
            enabled: loyaltySettings.enabled || false,
            pointsPerRupee: loyaltySettings.pointsPerRupee || 1,
            pointsExpiry: loyaltySettings.pointsExpiry || 365, // days
            tierMultipliers: {
                bronze: loyaltySettings.tierMultipliers?.bronze || 1,
                silver: loyaltySettings.tierMultipliers?.silver || 1.5,
                gold: loyaltySettings.tierMultipliers?.gold || 2,
                platinum: loyaltySettings.tierMultipliers?.platinum || 3
            },
            minPointsToRedeem: loyaltySettings.minPointsToRedeem || 100,
            ...loyaltySettings
        };

        await business.save();

        // Invalidate cache
        await deleteCache(`business:${business._id}`);

        return res.json({
            success: true,
            message: "Loyalty settings updated successfully",
            data: { loyaltySettings: business.settings.loyaltySettings }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getBusinessSettings,
    updateBusinessHours,
    updateAppointmentSettings,
    updateNotificationPreferences,
    addHoliday,
    removeHoliday,
    updatePaymentSettings,
    updateTaxSettings,
    updateGeneralSettings,
    updateLoyaltySettings
};

