import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import adminService from '../../services/admin/adminService';
import AdminNotificationDropdown from './AdminNotificationDropdown';
import { useSocket } from '../../contexts/SocketContext';

const AdminNotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { socket, connected } = useSocket();

  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      const result = await adminService.getUnreadNotificationCount();
      console.log('🔔 Unread count result:', result); // Debug log
      if (result.success) {
        setUnreadCount(result.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch count only once on mount (no polling, Socket.IO will handle real-time updates)
  useEffect(() => {
    fetchUnreadCount();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 🔥 REAL-TIME: Listen for new notifications via Socket.IO
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewNotification = (data) => {
      console.log('🔔 [Bell] Real-time notification received:', data);
      
      // Update unread count immediately
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      } else {
        // If unreadCount not provided, increment by 1
        setUnreadCount(prev => prev + 1);
      }

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.notification?.title || 'New Notification', {
          body: data.notification?.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: data.notification?._id
        });
      }
    };

    const handleNotificationRead = (data) => {
      console.log('🔔 [Bell] Notification marked as read:', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };

    const handleAllRead = (data) => {
      console.log('🔔 [Bell] All notifications marked as read');
      setUnreadCount(0);
    };

    const handleNotificationDeleted = (data) => {
      console.log('🔔 [Bell] Notification deleted:', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    };

    const handleAllDeleted = (data) => {
      console.log('🔔 [Bell] All notifications deleted');
      setUnreadCount(0);
    };

    // Listen for admin notifications
    socket.on('admin:notification:new', handleNewNotification);
    socket.on('notification:new', handleNewNotification); // Fallback
    socket.on('admin:notification:read', handleNotificationRead);
    socket.on('admin:notification:all-read', handleAllRead);
    socket.on('admin:notification:deleted', handleNotificationDeleted);
    socket.on('admin:notification:all-deleted', handleAllDeleted);

    // Cleanup
    return () => {
      socket.off('admin:notification:new', handleNewNotification);
      socket.off('notification:new', handleNewNotification);
      socket.off('admin:notification:read', handleNotificationRead);
      socket.off('admin:notification:all-read', handleAllRead);
      socket.off('admin:notification:deleted', handleNotificationDeleted);
      socket.off('admin:notification:all-deleted', handleAllDeleted);
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

  const handleNotificationRead = () => {
    // Refresh unread count after marking as read
    fetchUnreadCount();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
        <AdminNotificationDropdown
          onClose={() => setShowDropdown(false)}
          onNotificationRead={handleNotificationRead}
        />
      )}
    </div>
  );
};

export default AdminNotificationBell;

