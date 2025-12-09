import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaSpinner, FaCalendarAlt, FaBug } from 'react-icons/fa';
import { useSocket } from '../../contexts/SocketContext';
import managerService from '../../services/manager/managerService';

const NotificationIcon = ({ type }) => {
    const icons = {
        appointment: <FaCalendarAlt className="text-primary-600" />,
        success: <FaCheckCircle className="text-green-500" />,
        info: <FaInfoCircle className="text-blue-500" />,
        warning: <FaExclamationTriangle className="text-yellow-500" />,
        error: <FaTimesCircle className="text-red-500" />,
    };
    return icons[type] || icons.info;
};

const NotificationItem = ({ notification, onDismiss }) => {
    const [removing, setRemoving] = useState(false);
    const navigate = useNavigate();

    const handleClick = async (e) => {
        e.preventDefault();

        try {
            setRemoving(true);

            // Navigate to appointment details if it's an appointment notification
            const appointmentId = notification.appointmentId || notification.relatedAppointment;
            if (notification.type === 'appointment' && appointmentId) {
                setTimeout(() => {
                    navigate(`/manager/appointments/${appointmentId}`);
                    // Mark as read if it has an ID
                    if (notification._id && !notification._id.startsWith('appointment_')) {
                        managerService.markAlertAsRead(notification._id);
                    }
                    onDismiss();
                }, 300);
            }
        } catch (error) {
            console.error('Failed to handle notification click:', error);
            setRemoving(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    return (
        <div
            onClick={handleClick}
            className={`p-3 hover:bg-gray-50 transition-all duration-300 cursor-pointer border-b border-gray-100 bg-blue-50 ${removing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
        >
            <div className="flex items-start gap-3">
                <div className="mt-1">
                    <NotificationIcon type={notification.type || 'appointment'} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {notification.title}
                    </p>
                    {notification.message && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{formatTime(notification.sentAt || notification.createdAt)}</span>
                        <span className="text-xs text-primary-600 font-medium">View details →</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ManagerNotificationDropdown = ({ onClose, onNotificationDismiss }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const { socket, connected } = useSocket();
    const navigate = useNavigate();

    // 🔥 Fetch existing notifications from API on mount
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            // Use getAlerts for system notifications/appointments
            const result = await managerService.getAlerts({ page: 1, limit: 10 });

            if (result.success && result.data?.data) {
                console.log('📥 [Dropdown] Loaded alerts from API:', result.data.data);
                setNotifications(result.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // 🔥 REAL-TIME: Listen for new appointment notifications via Socket.IO
    useEffect(() => {
        if (!socket || !connected) return;

        // Add new notification to the top
        const handleNewAppointment = (data) => {
            console.log('📅 [Dropdown] New appointment received:', data);
            const newNotification = {
                _id: `appointment_${data.appointmentId}_${Date.now()}`,
                title: 'New Appointment',
                message: data.message || `New appointment from ${data.customerName}`,
                type: 'appointment',
                appointmentId: data.appointmentId,
                createdAt: new Date().toISOString(),
            };
            setNotifications(prev => [newNotification, ...prev].slice(0, 10));
        };

        const handleAppointmentUpdated = (data) => {
            console.log('✏️ [Dropdown] Appointment updated:', data);
            const newNotification = {
                _id: `appointment_update_${data.appointmentId}_${Date.now()}`,
                title: 'Appointment Updated',
                message: data.message || 'An appointment has been updated',
                type: 'appointment',
                appointmentId: data.appointmentId,
                createdAt: new Date().toISOString(),
            };
            setNotifications(prev => [newNotification, ...prev].slice(0, 10));
        };

        const handleAppointmentCancelled = (data) => {
            console.log('❌ [Dropdown] Appointment cancelled:', data);
            const newNotification = {
                _id: `appointment_cancel_${data.appointmentId}_${Date.now()}`,
                title: 'Appointment Cancelled',
                message: data.message || 'An appointment has been cancelled',
                type: 'appointment',
                appointmentId: data.appointmentId,
                createdAt: new Date().toISOString(),
            };
            setNotifications(prev => [newNotification, ...prev].slice(0, 10));
        };

        socket.on('new_appointment', handleNewAppointment);
        socket.on('appointment_updated', handleAppointmentUpdated);
        socket.on('appointment_cancelled', handleAppointmentCancelled);

        return () => {
            socket.off('new_appointment', handleNewAppointment);
            socket.off('appointment_updated', handleAppointmentUpdated);
            socket.off('appointment_cancelled', handleAppointmentCancelled);
        };
    }, [socket, connected]);

    const handleClearAll = async () => {
        try {
            // Optimistic update
            setNotifications([]);
            await managerService.markAllAlertsAsRead();
        } catch (error) {
            console.error("Failed to clear notifications", error);
        }
    };

    const handleViewAll = () => {
        navigate('/manager/appointments');
        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col rounded-lg">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <div className="flex gap-2">
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <FaSpinner className="text-2xl text-gray-400 animate-spin" />
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification._id}
                            notification={notification}
                            onDismiss={onNotificationDismiss}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <FaBell className="text-4xl text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500 text-center">No notifications</p>
                        <p className="text-xs text-gray-400 text-center mt-1">You're all caught up!</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <button
                    onClick={handleViewAll}
                    className="block w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
                >
                    View all appointments
                </button>
            </div>
        </div>
    );
};

export default ManagerNotificationDropdown;
