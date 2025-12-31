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
            qrCode = await whatsappWebService.waitForQR(15000);
        }

        if (qrCode) {
            return res.status(200).json({
                success: true,
                qrCode,
                message: 'Scan this QR code with your WhatsApp mobile app'
            });
        }

        // If still no QR code, something might be stuck. Trigger re-init.
        console.log('[QR Controller] QR generation timed out. Triggering service reload...');
        whatsappWebService.reinitialize().catch(err => console.error('Reinit failed:', err));

        return res.status(503).json({
            success: false,
            message: 'WhatsApp service is reloading. Please click "Refresh QR Code" again in 10 seconds.',
            shouldRetry: true
        });

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

/**
 * Force reset connection (Connect New WhatsApp)
 * Clears session and restarts service
 */
const resetConnection = async (req, res) => {
    try {
        console.log('[QR Controller] Manual reset requested');
        // Trigger re-init without waiting (fire and forget)
        whatsappWebService.reinitialize().catch(err => console.error('Reset failed:', err));

        res.status(200).json({
            success: true,
            message: 'WhatsApp service is resetting. Please wait 10-15 seconds then refresh QR.',
            shouldRetry: true
        });
    } catch (error) {
        console.error('[QR Controller] Reset error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getQRCode,
    getConnectionStatus,
    logout,
    resetConnection
};
