const express = require('express');
const router = express.Router();
const googleSheetController = require('../controllers/googleSheetController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ==========================================
// ADMIN PROTECTED ROUTES
// ==========================================
router.get('/leads', protect, roleMiddleware(['admin']), googleSheetController.getAllLeads);
router.post('/sync', protect, roleMiddleware(['admin']), googleSheetController.manualSync);
router.post('/forward-lead', protect, roleMiddleware(['admin']), googleSheetController.forwardLeadToManagers);

// Get all leads with manager tracking (Admin view)
router.get('/leads/admin', protect, roleMiddleware(['admin']), googleSheetController.getLeadsForAdmin);

// Analytics
router.get('/leads/analytics', protect, roleMiddleware(['admin']), googleSheetController.getLeadAnalytics);

// Managers for a location (for manual forwarding)
router.get('/leads/managers', protect, roleMiddleware(['admin']), googleSheetController.getManagersByLocation);

// Update lead status (Admin manually marking as done)
router.post('/leads/admin-status', protect, roleMiddleware(['admin']), googleSheetController.updateLeadAdminStatus);

// Add Remark
router.post('/leads/remark', protect, roleMiddleware(['admin']), googleSheetController.addLeadRemark);

// ==========================================
// MANAGER PROTECTED ROUTES
// ==========================================

// Get leads only for manager's assigned location(s)
router.get('/leads/manager', protect, roleMiddleware(['manager']), googleSheetController.getLeadsForManager);

// Update lead contact status (mark as called or whatsapped)
router.post('/leads/update-status', protect, roleMiddleware(['manager']), googleSheetController.updateLeadContactStatus);

module.exports = router;
