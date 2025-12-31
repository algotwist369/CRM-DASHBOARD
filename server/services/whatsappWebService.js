const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const EventEmitter = require('events');
require('dotenv').config();

/**
 * WhatsApp Web Service - Manages single admin WhatsApp session for all businesses
 * Features: Persistent session, auto-reconnect, keep-alive
 */
class WhatsAppWebService extends EventEmitter {
    constructor() {
        super();
        this.client = null;
        this.qrCode = null;
        this.isInitialized = false;
        this.isClientReady = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.sessionName = process.env.WHATSAPP_WEB_SESSION_NAME || 'crm-whatsapp';
    }

    /**
     * Initialize WhatsApp client with persistent LocalAuth
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('[WhatsApp Web] Client already initialized');
            return;
        }

        const enabled = process.env.WHATSAPP_WEB_ENABLED === 'true';
        if (!enabled) {
            console.log('[WhatsApp Web] Service disabled via WHATSAPP_WEB_ENABLED');
            return;
        }

        try {
            console.log('[WhatsApp Web] Initializing client...');

            // Ensure clean slate
            if (this.client) {
                try {
                    await this.client.destroy();
                } catch (e) { /* ignore */ }
            }

            this.client = new Client({
                authStrategy: new LocalAuth({
                    clientId: this.sessionName,
                    dataPath: './.wwebjs_auth'
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu',
                        '--disable-extensions'
                    ]
                }
            });

            this._setupEventHandlers();

            // Set flag immediately to prevent race
            this.isInitialized = true;

            await this.client.initialize();

        } catch (error) {
            console.error('[WhatsApp Web] Initialization failed:', error.message);
            this.isInitialized = false; // Reset on failure
            this.emit('error', error);
            // Don't auto-reconnect immediately loop if init failed hard
        }
    }

    /**
     * Force re-initialization of the client
     */
    async reinitialize() {
        const fs = require('fs');
        const path = require('path');

        // Force clean slate
        this.isInitialized = false;
        this.isClientReady = false;
        this.qrCode = null;

        if (this.client) {
            try {
                console.log('[WhatsApp Web] destroying client...');
                await this.client.destroy();
            } catch (e) { console.error('Destroy failed', e); }
            this.client = null;
        }

        // Clean up session data if requested
        const authPath = './.wwebjs_auth';
        if (fs.existsSync(authPath)) {
            try {
                console.log('[WhatsApp Web] Deleting session data...');
                fs.rmSync(authPath, { recursive: true, force: true });
            } catch (e) {
                console.error('[WhatsApp Web] Failed to delete session data:', e.message);
            }
        }

        // Wait a bit before restart
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Force env reload just in case
        require('dotenv').config();

        await this.initialize();
    }

    /**
     * Setup event handlers for connection lifecycle
     */
    _setupEventHandlers() {
        // QR Code generation for first-time authentication
        this.client.on('qr', async (qr) => {
            console.log('[WhatsApp Web] QR Code received. Scan to authenticate.');
            try {
                this.qrCode = await QRCode.toDataURL(qr);
                this.emit('qr', this.qrCode);
            } catch (error) {
                console.error('[WhatsApp Web] QR generation failed:', error);
            }
        });

        // Client authenticated (session loaded successfully)
        this.client.on('authenticated', () => {
            console.log('[WhatsApp Web] ✅ Authenticated successfully');
            this.qrCode = null; // Clear QR after authentication
            this.retryCount = 0; // Reset retry counter
            this.emit('authenticated');
        });

        // Authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('[WhatsApp Web] ❌ Authentication failed:', msg);
            this.qrCode = null;
            this.emit('auth_failure', msg);
        });

        // Client ready to send/receive messages
        this.client.on('ready', () => {
            console.log('[WhatsApp Web] 🚀 Client ready! Session is active.');
            this.isClientReady = true;
            this.retryCount = 0;
            this.emit('ready');
            this._startKeepAlive();
        });

        // Disconnected event - Handle auto-reconnection
        this.client.on('disconnected', (reason) => {
            console.log('[WhatsApp Web] Disconnected. Reason:', reason);
            this.isClientReady = false;
            this.emit('disconnected', reason);

            // Only auto-reconnect if NOT manual logout
            if (reason !== 'LOGOUT') {
                this._handleReconnect();
            } else {
                console.log('[WhatsApp Web] Manual logout detected. No auto-reconnect.');
            }
        });

        // Message creation event (optional logging)
        this.client.on('message_create', (msg) => {
            if (msg.fromMe) {
                console.log(`[WhatsApp Web] Message sent to ${msg.to}`);
            }
        });

        // Loading screen progress
        this.client.on('loading_screen', (percent, message) => {
            console.log(`[WhatsApp Web] Loading... ${percent}%`);
        });
    }

    /**
     * Handle reconnection with exponential backoff
     */
    _handleReconnect() {
        if (this.retryCount >= this.maxRetries) {
            console.error('[WhatsApp Web] Max retries reached. Please restart manually.');
            this.emit('max_retries_reached');
            return;
        }

        this.retryCount++;
        const delay = Math.min(1000 * Math.pow(2, this.retryCount), 60000); // Max 60s

        console.log(`[WhatsApp Web] Reconnecting in ${delay / 1000}s (Attempt ${this.retryCount}/${this.maxRetries})`);

        setTimeout(() => {
            console.log('[WhatsApp Web] Attempting to reconnect...');
            this.client.initialize().catch((err) => {
                console.error('[WhatsApp Web] Reconnect failed:', err.message);
            });
        }, delay);
    }

    /**
     * Keep-alive mechanism to maintain connection
     */
    _startKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }

        // Ping every 30 seconds to keep connection alive
        this.keepAliveInterval = setInterval(async () => {
            if (this.isClientReady && this.client) {
                try {
                    const state = await this.client.getState();
                    if (state !== 'CONNECTED') {
                        console.warn('[WhatsApp Web] Connection state:', state);
                    }
                } catch (error) {
                    console.error('[WhatsApp Web] Keep-alive check failed:', error.message);
                }
            }
        }, 30000); // 30 seconds
    }

    /**
     * Send WhatsApp message
     * @param {string} phone - Phone number (10-digit or +91 format)
     * @param {string} message - Message content
     * @returns {Promise<Object>} - Send result
     */
    async sendMessage(phone, message) {
        if (!this.isClientReady) {
            throw new Error('WhatsApp client not ready. Check connection status.');
        }

        try {
            // Format phone number to WhatsApp ID format
            let formattedPhone = phone.toString().replace(/\D/g, ''); // Remove non-digits

            // Add country code if 10-digit Indian number
            if (formattedPhone.length === 10) {
                formattedPhone = '91' + formattedPhone;
            }

            // Remove leading '+' if present
            formattedPhone = formattedPhone.replace(/^\+/, '');

            const chatId = `${formattedPhone}@c.us`;
            console.log(`[WhatsApp Web] Sending message to ${chatId}`);

            // 1. Verify number exists on WhatsApp first
            const isRegistered = await this.client.isRegisteredUser(chatId);
            if (!isRegistered) {
                console.warn(`[WhatsApp Web] Number ${formattedPhone} is not registered on WhatsApp`);
                // Fallback or throw error? Throwing allows fallback to Twilio
                throw new Error('Number not registered on WhatsApp');
            }

            // 2. Explicitly get chat instance to ensure internal models are loaded
            // This prevents the 'sendSeen' undefined error
            let chat;
            try {
                chat = await this.client.getChatById(chatId);
            } catch (err) {
                // If checking by ID fails, use number ID
                const numberId = await this.client.getNumberId(chatId);
                if (numberId) {
                    chat = await this.client.getChatById(numberId._serialized);
                }
            }

            // 3. Send message using the chat object if available, otherwise fallback to check strategy
            let result;
            if (chat) {
                // Clear state to prevent weird issues
                await chat.clearState();
                result = await chat.sendMessage(message);
            } else {
                // Fallback if chat object lookup weirdly failed
                result = await this.client.sendMessage(chatId, message);
            }

            return {
                success: true,
                messageId: result.id.id,
                timestamp: result.timestamp
            };

        } catch (error) {
            console.error('[WhatsApp Web] Message send failed:', error.message);
            throw new Error(`Failed to send WhatsApp message: ${error.message}`);
        }
    }

    /**
     * Check if client is ready to send messages
     * Checks internal flag first, then verifies with client state
     * @returns {Promise<boolean>}
     */
    async isReady() {
        // Fast path
        if (this.isClientReady && this.client) {
            return true;
        }

        // Deep check if client exists but flag might be out of sync
        if (this.client) {
            try {
                const state = await this.client.getState();
                if (state === 'CONNECTED') {
                    console.log('[WhatsApp Web] Client state is CONNECTED (healed isReady flag)');
                    this.isClientReady = true;
                    return true;
                }
            } catch (error) {
                // Ignore error, just return false
            }
        }

        return false;
    }

    /**
     * Get QR code for authentication
     * @returns {string|null} - Base64 QR code or null
     */
    getQR() {
        return this.qrCode;
    }


    async waitForQR(timeoutMs = 45000) {
        if (this.qrCode) return this.qrCode;
        if (this.isClientReady) return null; // Already connected

        console.log(`[WhatsApp Web] Waiting for QR (Timeout: ${timeoutMs}ms)...`);

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                cleanup();
                console.log('[WhatsApp Web] WaitForQR timed out.');
                resolve(null);
            }, timeoutMs);

            const onQr = (qr) => {
                cleanup();
                resolve(qr);
            };

            const onReady = () => {
                cleanup();
                resolve(null); // Connected, no QR needed
            };

            const onClose = () => {
                cleanup();
                resolve(null);
            };

            const onError = (err) => {
                cleanup();
                console.error('[WhatsApp Web] Init Error caught in waitForQR:', err.message);
                resolve({ error: err.message }); // Return error object
            };

            const cleanup = () => {
                this.off('qr', onQr);
                this.off('ready', onReady);
                this.off('disconnected', onClose);
                this.off('error', onError);
                clearTimeout(timeout);
            };

            this.on('qr', onQr);
            this.on('ready', onReady);
            this.on('disconnected', onClose);
            this.on('error', onError);
        });
    }

    /**
     * Get current connection status
     * @returns {Object}
     */
    async getStatus() {
        if (!this.client) {
            return { connected: false, state: 'NOT_INITIALIZED' };
        }

        try {
            const state = await this.client.getState();
            // Connected if explicit state is CONNECTED or if client says it's ready
            const isConnected = state === 'CONNECTED' || this.isClientReady;

            return {
                connected: isConnected,
                state: state || (this.isClientReady ? 'CONNECTED' : 'DISCONNECTED'),
                qrAvailable: !!this.qrCode,
                retryCount: this.retryCount
            };
        } catch (error) {
            return {
                connected: false,
                state: 'ERROR',
                error: error.message
            };
        }
    }

    /**
     * Manual logout - disconnect and clear session
     */
    async logout() {
        if (!this.client) {
            return;
        }

        try {
            console.log('[WhatsApp Web] Logging out...');
            await this.client.logout();
            this.isClientReady = false;
            this.qrCode = null;
            console.log('[WhatsApp Web] Logged out successfully');
        } catch (error) {
            console.error('[WhatsApp Web] Logout failed:', error.message);
            throw error;
        }
    }

    /**
     * Graceful shutdown
     */
    async destroy() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }

        if (this.client) {
            try {
                await this.client.destroy();
                console.log('[WhatsApp Web] Client destroyed gracefully');
            } catch (error) {
                console.error('[WhatsApp Web] Destroy error:', error.message);
            }
        }

        this.isInitialized = false;
        this.isClientReady = false;
        this.client = null;
    }
}

// Export singleton instance
const whatsappWebService = new WhatsAppWebService();
module.exports = whatsappWebService;
