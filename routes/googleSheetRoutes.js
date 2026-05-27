const express = require('express');
const router = express.Router();
const googleSheetController = require('../controllers/googleSheetController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// ==========================================
// PUBLIC WEBHOOKS (Double Tick)
// ==========================================
// Endpoint to receive leads directly from WhatsApp automation
router.post('/webhook', googleSheetController.receiveWebhookLead);

// ==========================================
// ADMIN PROTECTED ROUTES
// ==========================================
router.get('/leads', protect, roleMiddleware(['admin']), googleSheetController.getAllLeads);
router.post('/sync', protect, roleMiddleware(['admin']), googleSheetController.manualSync);
router.post('/forward-lead', protect, roleMiddleware(['admin']), googleSheetController.forwardLeadToManagers);

// Get all leads with manager tracking (Admin view)
router.get('/leads/admin', protect, roleMiddleware(['admin']), googleSheetController.getLeadsForAdmin);

// Add a lead manually into the Google Sheet lead database
router.post('/leads/manual', protect, roleMiddleware(['admin']), googleSheetController.createManualGoogleSheetLead);

// Delete a lead only when admin provides the required delete code
router.delete('/leads/:leadId', protect, roleMiddleware(['admin']), googleSheetController.deleteGoogleSheetLead);

// Analytics
router.get('/leads/analytics', protect, roleMiddleware(['admin']), googleSheetController.getLeadAnalytics);

// Managers for a location (for manual forwarding)
router.get('/leads/managers', protect, roleMiddleware(['admin']), googleSheetController.getManagersByLocation);

// Update lead status (Admin/Manager manually marking as done)
router.post('/leads/admin-status', protect, roleMiddleware(['admin', 'manager']), googleSheetController.updateLeadAdminStatus);


// ==========================================
// MANAGER PROTECTED ROUTES
// ==========================================

// Get leads only for manager's assigned location(s)
router.get('/leads/manager', protect, roleMiddleware(['manager']), googleSheetController.getLeadsForManager);

// Update lead contact status (mark as called or whatsapped)
router.post('/leads/update-status', protect, roleMiddleware(['manager']), googleSheetController.updateLeadContactStatus);

// Add Remark
router.post('/leads/remark', protect, roleMiddleware(['admin', 'manager']), googleSheetController.addLeadRemark);

// Update follow-up status and optional follow-up remark
router.post('/leads/follow-up', protect, roleMiddleware(['admin', 'manager']), googleSheetController.updateLeadFollowUp);

// ==========================================
// PENDING LEADS COUNT (For Sidebar Badges)
// ==========================================

// Get pending leads count for admin
router.get('/pending-count/admin', protect, roleMiddleware(['admin']), googleSheetController.getPendingLeadsCountAdmin);

// Get pending leads count for manager (filtered by location)
router.get('/pending-count/manager', protect, roleMiddleware(['manager']), googleSheetController.getPendingLeadsCountManager);

module.exports = router;
