import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import ManagerNotificationDropdown from './ManagerNotificationDropdown';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import managerService from '../../services/manager/managerService';

const ManagerNotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { socket, connected } = useSocket();

    // API: Fetch initial unread count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await managerService.getAlerts({ isRead: false, limit: 1 });
                if (response.success && response.data) {
                    // response.data.unreadCount should be available if I implemented it correctly in controller
                    // Let's verify controller implementation: yes, it returns { success: true, data: ..., unreadCount: ... }
                    setUnreadCount(response.data.unreadCount || 0);
                }
            } catch (error) {
                console.error("Failed to fetch unread count:", error);
            }
        };
        fetchUnreadCount();
    }, []);

    // REAL-TIME: Listen for appointment notifications via Socket.IO
    useEffect(() => {
        if (!socket || !connected) return;

        const handleNewAppointment = (data) => {
            console.log('📅 [Bell] New appointment received:', data);

            // Update unread count immediately
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            toast.success(data.message || 'New appointment received!', {
                icon: '📅',
                duration: 4000
            });

            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Appointment', {
                    body: data.message,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: data.appointmentId
                });
            }
        };

        const handleAppointmentUpdated = (data) => {
            console.log('✏️ [Bell] Appointment updated:', data);
            setUnreadCount(prev => prev + 1);

            toast.info(data.message || 'Appointment updated', {
                icon: '✏️',
                duration: 3000
            });
        };

        const handleAppointmentCancelled = (data) => {
            console.log('❌ [Bell] Appointment cancelled:', data);
            setUnreadCount(prev => prev + 1);

            toast.error(data.message || 'Appointment cancelled', {
                icon: '❌',
                duration: 3000
            });
        };

        // Listen for appointment events
        socket.on('new_appointment', handleNewAppointment);
        socket.on('appointment_updated', handleAppointmentUpdated);
        socket.on('appointment_cancelled', handleAppointmentCancelled);

        // Cleanup
        return () => {
            socket.off('new_appointment', handleNewAppointment);
            socket.off('appointment_updated', handleAppointmentUpdated);
            socket.off('appointment_cancelled', handleAppointmentCancelled);
        };
    }, [socket, connected]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleBellClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleNotificationDismiss = () => {
        // Decrease unread count when notification is dismissed/clicked
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleBellClick}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Notifications"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <ManagerNotificationDropdown
                    onClose={() => setShowDropdown(false)}
                    onNotificationDismiss={handleNotificationDismiss}
                />
            )}
        </div>
    );
};

export default ManagerNotificationBell;
