// managerController.js - Manager operations (staff CRUD, daily business entry)
const Staff = require("../models/Staff");
const DailyBusiness = require("../models/DailyBusiness");
const Transaction = require("../models/Transaction");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const { setCache, getCache, deleteCache } = require("../utils/cache");

// ================== Manager Dashboard ==================
const getManagerDashboard = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const cacheKey = `manager:${managerId}:dashboard`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        // Get manager and business info
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ success: false, message: "Manager or business not found" });
        }

        const business = manager.business;

        // Get staff count
        const staffCount = await Staff.countDocuments({ 
            business: business._id, 
            isActive: true 
        });

        // Get today's transactions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTransactions = await Transaction.find({
            business: business._id,
            transactionDate: { $gte: today, $lt: tomorrow }
        });

        const todayRevenue = todayTransactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
        const todayCustomers = todayTransactions.length;

        // Get this month's daily business records
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRecords = await DailyBusiness.find({
            business: business._id,
            date: { $gte: startOfMonth }
        });

        const monthlyRevenue = monthlyRecords.reduce((sum, r) => sum + (r.totalIncome || 0), 0);
        const monthlyCustomers = monthlyRecords.reduce((sum, r) => sum + (r.totalCustomers || 0), 0);

        const dashboard = {
            manager: {
                name: manager.name,
                username: manager.username,
                business: business.name,
                businessType: business.type
            },
            business: {
                id: business._id,
                name: business.name,
                type: business.type,
                branch: business.branch,
                address: business.address
            },
            stats: {
                staffCount,
                todayRevenue,
                todayCustomers,
                monthlyRevenue,
                monthlyCustomers,
                totalTransactions: todayTransactions.length
            },
            recentTransactions: todayTransactions.slice(0, 5).map(t => ({
                id: t._id,
                customerName: t.customerName,
                serviceName: t.serviceName,
                finalPrice: t.finalPrice,
                transactionDate: t.transactionDate
            }))
        };

        // Cache for 5 minutes
        await setCache(cacheKey, dashboard, 300);

        return res.json({ success: true, data: dashboard });
    } catch (err) {
        next(err);
    }
};

// ================== Add Staff ==================
const addStaff = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { 
            name, 
            email, 
            phone, 
            role, 
            specialization, 
            experience, 
            salary, 
            commission,
            username,
            pin
        } = req.body;

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        const staff = await Staff.create({ 
            business: manager.business,
            manager: managerId,
            name, 
            email,
            phone, 
            role: role || 'stylist',
            username,
            pin,
            specialization,
            experience: experience || 0,
            salary,
            commission: commission || 0
        });

        // Add staff to business
        await Business.findByIdAndUpdate(manager.business, {
            $push: { staff: staff._id }
        });

        // Invalidate caches
        await deleteCache(`manager:${managerId}:staff`);
        await deleteCache(`business:${manager.business}:staff`);

        return res.status(201).json({
            success: true,
            message: "Staff added successfully",
            data: staff,
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Staff ==================
const getStaff = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { page = 1, limit = 10, role, search } = req.query;
        const cacheKey = `manager:${managerId}:staff:${role}:${search}:${page}:${limit}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) return res.json({ success: true, source: "cache", ...cachedData });

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        let query = { business: manager.business, isActive: true };

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const staff = await Staff.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Staff.countDocuments(query);

        const response = {
            success: true,
            data: staff.map(s => s.toObject()),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        };

        await setCache(cacheKey, response, 120);
        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Update Staff ==================
const updateStaff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const managerId = req.user.id;

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        const staff = await Staff.findOneAndUpdate(
            { _id: id, business: manager.business },
            { ...updates, updatedAt: new Date() },
            { new: true }
        );

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        // Invalidate caches
        await deleteCache(`manager:${managerId}:staff`);
        await deleteCache(`business:${manager.business}:staff`);

        return res.json({ success: true, message: "Staff updated successfully", data: staff });
    } catch (err) {
        next(err);
    }
};

// ================== Delete Staff ==================
const deleteStaff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const managerId = req.user.id;

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        const staff = await Staff.findOneAndUpdate(
            { _id: id, business: manager.business },
            { isActive: false },
            { new: true }
        );

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        // Remove from business staff array
        await Business.findByIdAndUpdate(manager.business, {
            $pull: { staff: staff._id }
        });

        // Invalidate caches
        await deleteCache(`manager:${managerId}:staff`);
        await deleteCache(`business:${manager.business}:staff`);

        return res.json({ success: true, message: "Staff deleted successfully" });
    } catch (err) {
        next(err);
    }
};

// ================== Add Transaction ==================
const addTransaction = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const {
            customerName,
            customerPhone,
            customerEmail,
            serviceName,
            serviceType,
            serviceCategory,
            basePrice,
            discount,
            tax,
            paymentMethod,
            staff,
            notes,
            rating
        } = req.body;

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        const finalPrice = basePrice - (discount || 0) + (tax || 0);

        const transaction = await Transaction.create({
            business: manager.business,
            manager: managerId,
            staff,
            customerName,
            customerPhone,
            customerEmail,
            isNewCustomer: true, // Can be improved with customer lookup
            serviceName,
            serviceType,
            serviceCategory,
            basePrice,
            discount: discount || 0,
            tax: tax || 0,
            finalPrice,
            paymentMethod: paymentMethod || 'cash',
            paymentStatus: 'completed',
            notes,
            rating,
            transactionDate: new Date()
        });

        // Invalidate caches
        await deleteCache(`manager:${managerId}:dashboard`);
        await deleteCache(`business:${manager.business}:transactions`);

        return res.status(201).json({
            success: true,
            message: "Transaction added successfully",
            data: transaction
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Transactions ==================
const getTransactions = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { page = 1, limit = 10, startDate, endDate, serviceType } = req.query;
        const cacheKey = `manager:${managerId}:transactions:${startDate}:${endDate}:${serviceType}:${page}:${limit}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) return res.json({ success: true, source: "cache", ...cachedData });

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        let query = { business: manager.business };

        if (startDate && endDate) {
            query.transactionDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (serviceType) {
            query.serviceType = serviceType;
        }

        const transactions = await Transaction.find(query)
            .populate('staff', 'name role')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ transactionDate: -1 });

        const total = await Transaction.countDocuments(query);

        const response = {
            success: true,
            data: transactions.map(t => t.toObject()),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        };

        await setCache(cacheKey, response, 120);
        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Update Business (Manager can update their own business) ==================
const updateBusiness = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const updates = req.body;

        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ success: false, message: "Manager or business not found" });
        }

        const businessId = manager.business._id;

        // Validate business type if being updated
        if (updates.type) {
            const validTypes = ["salon", "spa", "hotel", "restaurant", "retail", "gym", "clinic", "cafe", "studio", "education", "automotive", "others"];
            if (!validTypes.includes(updates.type)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Invalid business type. Must be one of: ${validTypes.join(', ')}` 
                });
            }
        }

        // Managers cannot change certain fields
        delete updates.admin; // Cannot change business owner
        delete updates.isActive; // Cannot deactivate business
        delete updates.businessLink; // Cannot change business link

        // Update business - pre-save hook will extract lat/lng from googleMapsUrl if changed
        const updatedBusiness = await Business.findByIdAndUpdate(
            businessId, 
            { ...updates, updatedAt: new Date() }, 
            { new: true, runValidators: true }
        ).populate('managers', 'name username email phone isActive');

        if (!updatedBusiness) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        // Invalidate caches
        await deleteCache(`manager:${managerId}:dashboard`);
        await deleteCache(`business:${businessId}:info`);

        return res.json({ 
            success: true, 
            message: "Business updated successfully", 
            data: {
                id: updatedBusiness._id,
                name: updatedBusiness.name,
                type: updatedBusiness.type,
                branch: updatedBusiness.branch,
                address: updatedBusiness.address,
                city: updatedBusiness.city,
                state: updatedBusiness.state,
                phone: updatedBusiness.phone,
                email: updatedBusiness.email,
                website: updatedBusiness.website,
                businessLink: updatedBusiness.businessLink,
                location: updatedBusiness.location,
                googleMapsUrl: updatedBusiness.googleMapsUrl,
                images: updatedBusiness.images,
                socialMedia: updatedBusiness.socialMedia,
                registration: updatedBusiness.registration,
                category: updatedBusiness.category,
                tags: updatedBusiness.tags,
                features: updatedBusiness.features,
                amenities: updatedBusiness.amenities,
                paymentMethods: updatedBusiness.paymentMethods,
                bankDetails: updatedBusiness.bankDetails,
                settings: updatedBusiness.settings,
                isActive: updatedBusiness.isActive,
                managers: updatedBusiness.managers,
                updatedAt: updatedBusiness.updatedAt
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Business Info (Manager can view their own business) ==================
const getBusinessInfo = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const cacheKey = `manager:${managerId}:business:info`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", data: cachedData });
        }

        // Get manager's business
        const manager = await Manager.findById(managerId).populate({
            path: 'business',
            populate: [
                { path: 'managers', select: 'name username email phone isActive' },
                { path: 'staff', select: 'name role phone email isActive' }
            ]
        });

        if (!manager || !manager.business) {
            return res.status(404).json({ success: false, message: "Manager or business not found" });
        }

        const business = manager.business;

        // Cache for 10 minutes
        await setCache(cacheKey, business, 600);

        return res.json({ success: true, data: business });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getManagerDashboard,
    addStaff,
    getStaff,
    updateStaff,
    deleteStaff,
    addTransaction,
    getTransactions,
    updateBusiness,
    getBusinessInfo
};
