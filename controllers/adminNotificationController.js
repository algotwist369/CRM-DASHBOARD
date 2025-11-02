require('dotenv').config();
const AdminNotification = require("../models/AdminNotification");
const { setCache, getCache, deleteCache } = require("../utils/cache");

// ================== Get Admin Notifications ==================
const getAdminNotifications = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { page = 1, limit = 20, isRead, type, priority } = req.query;
        const cacheKey = `admin:${adminId}:notifications:${isRead}:${type}:${priority}:${page}:${limit}`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        let query = { admin: adminId };

        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }
        if (type) {
            query.type = type;
        }
        if (priority) {
            query.priority = priority;
        }

        const notifications = await AdminNotification.find(query)
            .populate('relatedBusiness', 'name type branch')
            .populate('relatedManager', 'name username')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await AdminNotification.countDocuments(query);
        const unreadCount = await AdminNotification.countDocuments({ admin: adminId, isRead: false });

        const response = {
            success: true,
            data: notifications,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            unreadCount
        };

        // Cache for 1 minute
        await setCache(cacheKey, response, 60);

        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Unread Count ==================
const getUnreadCount = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const count = await AdminNotification.countDocuments({ admin: adminId, isRead: false });

        return res.json({ success: true, count });
    } catch (err) {
        next(err);
    }
};

// ================== Mark Notification as Read ==================
const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const notification = await AdminNotification.findOne({ _id: id, admin: adminId });
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        // Invalidate cache
        await deleteCache(`admin:${adminId}:notifications`);

        return res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
        next(err);
    }
};

// ================== Mark All as Read ==================
const markAllAsRead = async (req, res, next) => {
    try {
        const adminId = req.user.id;

        await AdminNotification.updateMany(
            { admin: adminId, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );

        // Invalidate cache
        await deleteCache(`admin:${adminId}:notifications`);

        return res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        next(err);
    }
};

// ================== Delete Notification ==================
const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const notification = await AdminNotification.findOneAndDelete({ _id: id, admin: adminId });
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        // Invalidate cache
        await deleteCache(`admin:${adminId}:notifications`);

        return res.json({ success: true, message: "Notification deleted" });
    } catch (err) {
        next(err);
    }
};

// ================== Get Recent Notifications ==================
const getRecentNotifications = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const limit = parseInt(req.query.limit) || 5;

        const notifications = await AdminNotification.find({ admin: adminId })
            .populate('relatedBusiness', 'name type branch')
            .populate('relatedManager', 'name username')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return res.json({ success: true, data: notifications });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAdminNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getRecentNotifications
};

