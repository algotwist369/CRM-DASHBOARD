// Verifies access JWT, loads the corresponding user model (Admin / Manager / Staff)
// Attaches req.user = { id, role, businessId, companyId (admin id) } for downstream use.

const { verifyAccessToken } = require('../utils/generateToken');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');
const Business = require('../models/Business');

/**
 * Extract Bearer token from Authorization header
 */
function getTokenFromHeader(req) {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) return null;
    const parts = auth.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
    return null;
}

/**
 * Middleware: verifies JWT and loads user details
 */
async function authMiddleware(req, res, next) {
    try {
        const token = getTokenFromHeader(req);
        if (!token) return res.status(401).json({ success: false, message: 'No authorization token provided' });

        let decoded;
        try {
            decoded = verifyAccessToken(token);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        // Expect token to contain { id, role } — role should be 'admin' | 'manager' | 'staff'
        const { id: tokenUserId, role: tokenRole } = decoded;
        if (!tokenUserId || !tokenRole) {
            return res.status(401).json({ success: false, message: 'Token payload missing id or role' });
        }

        // Load user from DB based on role and attach normalized req.user
        if (tokenRole === 'admin') {
            const admin = await Admin.findById(tokenUserId).select('-password -refreshToken').lean();
            if (!admin) return res.status(401).json({ success: false, message: 'Admin not found' });

            req.user = {
                id: String(admin._id),
                role: 'admin',
                companyId: String(admin._id), // admin is company owner
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
            };
            return next();
        }

        if (tokenRole === 'manager') {
            const manager = await Manager.findById(tokenUserId).populate('business').lean();
            if (!manager) return res.status(401).json({ success: false, message: 'Manager not found' });

            // business may be populated or just an id
            let business = manager.business;
            if (!business) {
                // try fetching business if only id stored
                business = await Business.findById(manager.business).lean();
            }

            const companyId = business ? String(business.admin) : null;

            req.user = {
                id: String(manager._id),
                role: 'manager',
                name: manager.name,
                username: manager.username,
                businessId: business ? String(business._id) : null,
                companyId,
            };
            return next();
        }

        if (tokenRole === 'staff') {
            const staff = await Staff.findById(tokenUserId).lean();
            if (!staff) return res.status(401).json({ success: false, message: 'Staff not found' });

            // To get business + company we need to load manager -> business
            const manager = await Manager.findById(staff.manager).populate('business').lean();
            const business = manager ? manager.business : null;
            const companyId = business ? String(business.admin) : null;

            req.user = {
                id: String(staff._id),
                role: 'staff',
                name: staff.name,
                managerId: manager ? String(manager._id) : null,
                businessId: business ? String(business._id) : null,
                companyId,
            };
            return next();
        }

        // Unknown role in token
        return res.status(401).json({ success: false, message: 'Unrecognized role in token' });
    } catch (err) {
        // Pass to centralized error handler
        return next(err);
    }
}

module.exports = authMiddleware;
