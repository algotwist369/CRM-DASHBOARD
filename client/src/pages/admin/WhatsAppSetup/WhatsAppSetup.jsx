import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FaWhatsapp, FaQrcode, FaCheckCircle, FaTimesCircle, FaSpinner, FaSignOutAlt, FaRedo } from 'react-icons/fa';
import adminService from '../../../services/admin/adminService';

const WhatsAppSetup = () => {
    const [qrCode, setQrCode] = useState(null);
    const [status, setStatus] = useState({
        connected: false,
        state: 'LOADING',
        loading: true
    });
    const [refreshing, setRefreshing] = useState(false);

    // Prevent state updates on unmount
    const isMounted = useRef(false);

    // Track if a request is already in progress to prevent dupes
    const isFetching = useRef(false);

    // Fetch connection status
    const fetchStatus = useCallback(async () => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            const response = await adminService.getWhatsAppStatus();
            if (isMounted.current && response.success) {
                setStatus({
                    connected: response.state === 'CONNECTED',
                    state: response.state,
                    loading: false
                });

                if (response.state === 'CONNECTED') {
                    setQrCode(null);
                }
            }
        } catch (error) {
            console.error('Failed to fetch status:', error);
            if (isMounted.current) setStatus(prev => ({ ...prev, loading: false }));
        } finally {
            isFetching.current = false;
        }
    }, []);

    // Fetch QR code
    const fetchQRCode = useCallback(async (isRetry = false) => {
        if (!isRetry && refreshing) return; // Prevent double click

        if (isMounted.current) setRefreshing(true);

        try {
            const response = await adminService.getWhatsAppQR();
            if (!isMounted.current) return;

            if (response.success) {
                if (response.alreadyConnected) {
                    toast.success('WhatsApp is already connected!');
                    fetchStatus();
                } else if (response.qrCode) {
                    setQrCode(response.qrCode);
                    toast.success('QR Code loaded. Scan with your WhatsApp.');
                }
            } else {
                if (response.shouldRetry) {
                    // 503 Handling
                    // Don't toast if it's an auto-retry loop to avoid spam
                    if (!isRetry) toast("Service reloading... please wait 15s", { icon: '⏳' });

                    setTimeout(() => {
                        if (isMounted.current && !status.connected) fetchQRCode(true);
                    }, 15000);

                } else {
                    toast.error(response.message || 'Failed to get QR code');
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 503) {
                if (!isRetry) toast("Service is reloading... retrying in 15s", { icon: '🔄' });
                setTimeout(() => {
                    if (isMounted.current) fetchQRCode(true);
                }, 15000);
            } else {
                toast.error('Failed to load QR code');
                console.error(error);
            }
        } finally {
            if (isMounted.current) setRefreshing(false);
        }
    }, [fetchStatus, refreshing, status.connected]);

    // Initial load
    useEffect(() => {
        isMounted.current = true;
        fetchStatus();
        return () => {
            isMounted.current = false;
        };
    }, [fetchStatus]);

    // Manual Refresh Handler
    const handleRefreshStatus = () => {
        if (status.loading) return;
        setStatus(prev => ({ ...prev, loading: true }));
        fetchStatus();
    };

    // Reset Handler
    const handleReset = async () => {
        if (window.confirm('This will disconnect the current session and restart the service completely. Are you sure?')) {
            setStatus({ connected: false, state: 'RESETTING', loading: true });
            setQrCode(null);

            toast.loading('Resetting service... please wait', { duration: 5000 });

            await adminService.resetWhatsApp();

            setTimeout(() => {
                if (isMounted.current) {
                    toast.dismiss();
                    toast.success('Service reset! Fetching new QR...');
                    fetchQRCode();
                }
            }, 15000);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                            <FaWhatsapp className="text-3xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">WhatsApp Integration</h1>
                            <p className="text-sm text-gray-500">Manage your WhatsApp Business connection</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        {status.loading ? (
                            <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium border border-gray-100">
                                <FaSpinner className="animate-spin text-gray-400" />
                                Checking...
                            </span>
                        ) : status.connected ? (
                            <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100">
                                <FaCheckCircle />
                                Connected
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                                <FaTimesCircle />
                                Not Connected
                            </span>
                        )}

                        {/* Refresh Button */}
                        <button
                            onClick={handleRefreshStatus}
                            disabled={status.loading}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh Status"
                        >
                            <FaRedo className={status.loading ? 'animate-spin' : ''} />
                        </button>

                        {/* Connect New / Reset Button */}
                        <button
                            onClick={handleReset}
                            disabled={status.state === 'RESETTING'}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaSignOutAlt className="text-gray-400" />
                            Connect New
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                {status.connected ? (
                    // Connected State
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                            <FaCheckCircle className="text-5xl text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">System Operational</h2>
                        <p className="text-gray-500 mb-8 max-w-md text-center">
                            Your WhatsApp connection is active and stable. All inquiry notifications will be sent automatically.
                        </p>

                        {/* Status Card */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                                <span className="text-xs text-gray-400 uppercase font-semibold">Status</span>
                                <p className="text-gray-700 font-medium mt-1">{status.state}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                                <span className="text-xs text-gray-400 uppercase font-semibold">Session</span>
                                <p className="text-green-600 font-medium mt-1">Active</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Not Connected State
                    <div className="flex flex-col items-center">
                        {!qrCode && !refreshing && (
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaQrcode className="text-3xl text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Scan to Connect</h3>
                                <p className="text-gray-500 mt-2">Generate a QR code to link your WhatsApp Business account</p>
                            </div>
                        )}

                        {qrCode ? (
                            <div className="text-center animate-fade-in">
                                <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm mb-6">
                                    <img src={qrCode} alt="WhatsApp QR" className="w-64 h-64 object-contain" />
                                </div>
                                <p className="text-sm text-gray-500 mb-6">Open WhatsApp &gt; Linked Devices &gt; Link a Device</p>
                                <button
                                    onClick={() => fetchQRCode(false)}
                                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-2 mx-auto"
                                >
                                    <FaRedo className={refreshing ? 'animate-spin' : ''} />
                                    Regenerate QR Code
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fetchQRCode(false)}
                                disabled={refreshing}
                                className="group relative overflow-hidden px-8 py-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    {refreshing ? <FaSpinner className="animate-spin" /> : <FaQrcode />}
                                    <span className="font-medium">Generate QR Code</span>
                                </div>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WhatsAppSetup;
