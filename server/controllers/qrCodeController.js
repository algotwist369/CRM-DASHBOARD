const whatsappWebService = require('../services/whatsappWebService');

/**
 * Get QR code for WhatsApp authentication
 * Admin only
 */
const getQRCode = async (req, res) => {
    try {
        let qrCode = whatsappWebService.getQR();

        // If QR not immediately available, wait for it (up to 15s)
        if (!qrCode) {
            console.log('[QR Controller] QR not cached, waiting for generation...');
            qrCode = await whatsappWebService.waitForQR();
        }

        if (qrCode) {
            return res.status(200).json({
                success: true,
                qrCode,
                message: 'Scan this QR code with your WhatsApp mobile app'
            });
        }

        // Check if already authenticated
        const status = await whatsappWebService.getStatus();

        if (status.connected) {
            return res.status(200).json({
                success: true,
                alreadyConnected: true,
                message: 'WhatsApp is already connected'
            });
        }

        return res.status(404).json({
            success: false,
            message: 'QR code not available. Please restart WhatsApp service or wait for initialization.'
        });

    } catch (error) {
        console.error('[QR Controller] Error fetching QR:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get WhatsApp connection status
 * Admin only
 */
const getConnectionStatus = async (req, res) => {
    try {
        const status = await whatsappWebService.getStatus();

        res.status(200).json({
            success: true,
            ...status
        });
    } catch (error) {
        console.error('[QR Controller] Error fetching status:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Logout from WhatsApp (disconnect session)
 * Admin only
 */
const logout = async (req, res) => {
    try {
        await whatsappWebService.logout();

        res.status(200).json({
            success: true,
            message: 'WhatsApp logged out successfully. Scan QR code to reconnect.'
        });
    } catch (error) {
        console.error('[QR Controller] Logout error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getQRCode,
    getConnectionStatus,
    logout
};
