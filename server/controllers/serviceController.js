// serviceController.js - Service/Product catalog management
const Service = require("../models/Service");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const { setCache, getCache, deleteCache } = require("../utils/cache");

// ================== Create Service ==================
const createService = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const serviceData = req.body;

        // Determine business ID
        let business;
        if (userRole === 'admin') {
            if (!serviceData.businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: serviceData.businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (!manager) {
                return res.status(404).json({
                    success: false,
                    message: "Manager not found"
                });
            }
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        // Create service
        const service = await Service.create({
            ...serviceData,
            business: business._id,
            createdBy: userId,
            createdByModel: userRole === 'admin' ? 'Admin' : 'Manager'
        });

        // Invalidate cache
        await deleteCache(`business:${business._id}:services`);

        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: service
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Services ==================
const getServices = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const {
            businessId,
            page = 1,
            limit = 20,
            search,
            category,
            serviceType,
            isActive,
            minPrice,
            maxPrice,
            sortBy = 'displayOrder',
            sortOrder = 'asc'
        } = req.query;

        // Determine business ID
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

        const cacheKey = `business:${business._id}:services:${page}:${limit}:${search}:${category}:${serviceType}:${isActive}:${minPrice}:${maxPrice}:${sortBy}:${sortOrder}`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        // Build query
        let query = { business: business._id };

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (category) {
            query.category = category;
        }

        if (serviceType) {
            query.serviceType = serviceType;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const services = await Service.find(query)
            .populate('assignedStaff', 'name role')
            .populate('packageDetails.includedServices.service', 'name price')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort(sortOptions)
            .lean();

        const total = await Service.countDocuments(query);

        const response = {
            success: true,
            data: services,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        };

        // Cache for 5 minutes
        await setCache(cacheKey, response, 300);

        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Service by ID ==================
const getServiceById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { id } = req.params;

        const service = await Service.findById(id)
            .populate('business', 'name type branch')
            .populate('assignedStaff', 'name role phone email')
            .populate('packageDetails.includedServices.service')
            .populate('membershipDetails.includedServices.service');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Verify access
        if (userRole === 'admin') {
            const business = await Business.findOne({
                _id: service.business._id,
                admin: userId
            });
            if (!business) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager.business.toString() !== service.business._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        return res.json({
            success: true,
            data: service
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Service ==================
const updateService = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { id } = req.params;
        const updates = req.body;

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Verify access
        if (userRole === 'admin') {
            const business = await Business.findOne({
                _id: service.business,
                admin: userId
            });
            if (!business) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager.business.toString() !== service.business.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        // Update service
        Object.assign(service, updates);
        service.updatedBy = userId;
        service.updatedByModel = userRole === 'admin' ? 'Admin' : 'Manager';

        await service.save();

        // Invalidate cache
        await deleteCache(`business:${service.business}:services`);

        return res.json({
            success: true,
            message: "Service updated successfully",
            data: service
        });
    } catch (err) {
        next(err);
    }
};

// ================== Delete Service (Soft Delete) ==================
const deleteService = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { id } = req.params;

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Verify access
        if (userRole === 'admin') {
            const business = await Business.findOne({
                _id: service.business,
                admin: userId
            });
            if (!business) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager.business.toString() !== service.business.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        // Soft delete
        service.isActive = false;
        service.updatedBy = userId;
        service.updatedByModel = userRole === 'admin' ? 'Admin' : 'Manager';
        await service.save();

        // Invalidate cache
        await deleteCache(`business:${service.business}:services`);

        return res.json({
            success: true,
            message: "Service deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Popular Services ==================
const getPopularServices = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId, limit = 10 } = req.query;

        // Determine business ID
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

        const services = await Service.getPopularServices(business._id, parseInt(limit));

        return res.json({
            success: true,
            data: services
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Featured Services ==================
const getFeaturedServices = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId } = req.query;

        // Determine business ID
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

        const services = await Service.getFeaturedServices(business._id);

        return res.json({
            success: true,
            data: services
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Service Categories ==================
const getServiceCategories = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId } = req.query;

        // Determine business ID
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

        // Get unique categories with service count
        const categories = await Service.aggregate([
            { $match: { business: business._id, isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        return res.json({
            success: true,
            data: categories.map(cat => ({
                category: cat._id,
                serviceCount: cat.count,
                averagePrice: Math.round(cat.averagePrice)
            }))
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Inventory ==================
const updateInventory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity, action } = req.body; // action: 'add' or 'reduce'

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid quantity is required"
            });
        }

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        if (!service.inventory.trackInventory) {
            return res.status(400).json({
                success: false,
                message: "Inventory tracking is not enabled for this service"
            });
        }

        let success = false;
        if (action === 'add') {
            await service.addInventory(quantity);
            success = true;
        } else if (action === 'reduce') {
            success = await service.reduceInventory(quantity);
        }

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Insufficient inventory"
            });
        }

        return res.json({
            success: true,
            message: `Inventory ${action === 'add' ? 'added' : 'reduced'} successfully`,
            data: {
                currentStock: service.inventory.currentStock,
                isLowStock: service.isLowStock
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
    getPopularServices,
    getFeaturedServices,
    getServiceCategories,
    updateInventory
};

