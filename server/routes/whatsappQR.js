const express = require('express');
const router = express.Router();
const { getQRCode, getConnectionStatus, logout } = require('../controllers/qrCodeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Admin only routes - require authentication and admin role
router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/qr', getQRCode);
router.get('/status', getConnectionStatus);
router.post('/logout', logout);

module.exports = router;
