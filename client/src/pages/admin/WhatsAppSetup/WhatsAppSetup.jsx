import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaWhatsapp, FaQrcode, FaCheckCircle, FaTimesCircle, FaSpinner, FaSignOutAlt } from 'react-icons/fa';
import adminService from '../../../services/admin/adminService';

const WhatsAppSetup = () => {
    const [qrCode, setQrCode] = useState(null);
    const [status, setStatus] = useState({
        connected: false,
        state: 'LOADING',
        loading: true
    });
    const [refreshing, setRefreshing] = useState(false);

    // Fetch connection status
    const fetchStatus = async () => {
        try {
            const response = await adminService.getWhatsAppStatus();
            if (response.success) {
                setStatus({
                    connected: response.state === 'CONNECTED', // Trust state over connected flag if mismatch
                    state: response.state,
                    loading: false
                });

                // If connected, clear QR code
                if (response.state === 'CONNECTED') {
                    setQrCode(null);
                }
            }
        } catch (error) {
            console.error('Failed to fetch status:', error);
            setStatus(prev => ({ ...prev, loading: false }));
        }
    };

    // Fetch QR code
    const fetchQRCode = async () => {
        setRefreshing(true);
        try {
            const response = await adminService.getWhatsAppQR();
            if (response.success) {
                if (response.alreadyConnected) {
                    toast.success('WhatsApp is already connected!');
                    fetchStatus();
                } else if (response.qrCode) {
                    setQrCode(response.qrCode);
                    toast.success('QR Code loaded. Scan with your WhatsApp.');
                }
            } else {
                toast.error(response.message || 'Failed to get QR code');
            }
        } catch (error) {
            toast.error('Failed to load QR code');
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    // Logout from WhatsApp
    const handleLogout = async () => {
        if (!window.confirm('Are you sure you want to disconnect WhatsApp? You will need to scan QR code again.')) {
            return;
        }

        try {
            const response = await adminService.logoutWhatsApp();
            if (response.success) {
                toast.success('WhatsApp disconnected successfully');
                setStatus({ connected: false, state: 'DISCONNECTED', loading: false });
                setQrCode(null);
            }
        } catch (error) {
            toast.error('Failed to logout');
            console.error(error);
        }
    };

    // Initial load - remove interval
    useEffect(() => {
        fetchStatus();
    }, []);

    // Manual Refresh Handler
    const handleRefreshStatus = () => {
        setStatus(prev => ({ ...prev, loading: true }));
        fetchStatus();
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FaWhatsapp className="text-4xl text-green-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">WhatsApp Integration</h1>
                            <p className="text-sm text-gray-500">Connect your WhatsApp to send inquiry notifications</p>
                        </div>
                    </div>

                    {/* Connection Status Badge */}
                    <div className="flex items-center gap-2">
                        {status.loading ? (
                            <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                <FaSpinner className="animate-spin" />
                                Checking...
                            </span>
                        ) : status.connected ? (
                            <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                <FaCheckCircle />
                                Connected
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                <FaTimesCircle />
                                Not Connected
                            </span>
                        )}

                        {/* Manual Refresh Button */}
                        <button
                            onClick={handleRefreshStatus}
                            title="Refresh Status"
                            className="p-2 ml-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <svg className={`w-4 h-4 ${status.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
                {status.connected ? (
                    // Connected State
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                            <FaCheckCircle className="text-4xl text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp Connected!</h2>
                        <p className="text-gray-600 mb-6">
                            Your WhatsApp is active. Customers will receive notifications when they submit inquiries.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                            <p className="text-sm text-blue-800">
                                <strong>Connection Status:</strong> {status.state}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Session will remain active until manual logout
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mx-auto"
                        >
                            <FaSignOutAlt />
                            Disconnect WhatsApp
                        </button>
                    </div>
                ) : (
                    // Not Connected State
                    <div>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Connect Your WhatsApp</h2>
                            <p className="text-gray-600">Scan the QR code with your WhatsApp Business number</p>
                        </div>

                        {qrCode ? (
                            // QR Code Display
                            <div className="max-w-md mx-auto">
                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                                    <img
                                        src={qrCode}
                                        alt="WhatsApp QR Code"
                                        className="w-full h-auto max-w-[300px] mx-auto"
                                    />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-yellow-800 font-medium mb-2">📱 How to scan:</p>
                                    <ol className="text-xs text-yellow-700 space-y-1 ml-4 list-decimal">
                                        <li>Open WhatsApp on your phone</li>
                                        <li>Go to Settings → Linked Devices</li>
                                        <li>Tap "Link a Device"</li>
                                        <li>Scan this QR code</li>
                                    </ol>
                                </div>

                                <button
                                    onClick={fetchQRCode}
                                    disabled={refreshing}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    {refreshing ? <FaSpinner className="animate-spin" /> : <FaQrcode />}
                                    Refresh QR Code
                                </button>
                            </div>
                        ) : (
                            // Generate QR Button
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                                    <FaQrcode className="text-4xl text-gray-400" />
                                </div>
                                <p className="text-gray-600 mb-6">Click below to generate a QR code</p>

                                <button
                                    onClick={fetchQRCode}
                                    disabled={refreshing}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto disabled:opacity-50"
                                >
                                    {refreshing ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <FaQrcode />
                                            Generate QR Code
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Important Notes */}
                        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800 font-medium mb-2">⚠️ Important Notes:</p>
                            <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                                <li>Use a dedicated WhatsApp Business number (not your personal number)</li>
                                <li>Once connected, the session persists across server restarts</li>
                                <li>All your businesses will send messages from this WhatsApp number</li>
                                <li>Customer messages will include the business name for clarity</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default WhatsAppSetup;
