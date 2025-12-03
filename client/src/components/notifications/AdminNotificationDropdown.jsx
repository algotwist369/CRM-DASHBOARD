import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import adminService from '../../services/admin/adminService';
import { useSocket } from '../../contexts/SocketContext';

const NotificationIcon = ({ type }) => {
  const icons = {
    success: <FaCheckCircle className="text-green-500" />,
    info: <FaInfoCircle className="text-blue-500" />,
    warning: <FaExclamationTriangle className="text-yellow-500" />,
    error: <FaTimesCircle className="text-red-500" />,
  };
  return icons[type] || icons.info;
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const [marking, setMarking] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleMarkAsRead = async (e) => {
    e.preventDefault();
    const isAlreadyRead = notification.read || notification.isRead;
    if (isAlreadyRead || marking) return;

    try {
      setMarking(true);
      setRemoving(true); // Start fade-out animation
      await adminService.markNotificationAsRead(notification._id);
      onMarkAsRead();
      // Socket.IO will remove it from the list after a short delay
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      setRemoving(false);
    } finally {
      setMarking(false);
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

  const isUnread = !notification.read && !notification.isRead;

  return (
    <div
      onClick={handleMarkAsRead}
      className={`p-3 hover:bg-gray-50 transition-all duration-300 cursor-pointer border-b border-gray-100 ${
        isUnread ? 'bg-blue-50' : ''
      } ${removing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <NotificationIcon type={notification.type || 'info'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'} text-gray-900 line-clamp-2`}>
            {notification.title}
          </p>
          {notification.message && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
            {isUnread && (
              <span className="text-xs text-blue-600 font-medium">
                {marking ? 'Marking...' : 'Mark as read'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminNotificationDropdown = ({ onClose, onNotificationRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const { socket, connected } = useSocket();

  const fetchRecentNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const result = await adminService.getRecentNotifications(10); // Fetch more to show unread
      if (result.success) {
        // Show only unread notifications in dropdown
        // Check both 'read' and 'isRead' fields for compatibility
        const unreadNotifs = (result.data || []).filter(n => !n.read && !n.isRead);
        setNotifications(unreadNotifs);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentNotifications();
  }, [fetchRecentNotifications]);

  // 🔥 REAL-TIME: Listen for new notifications and updates
  useEffect(() => {
    if (!socket || !connected) return;

    // Add new notification to the top
    const handleNewNotification = (data) => {
      console.log('🔔 [Dropdown] New notification received:', data);
      if (data.notification && !data.notification.read) {
        setNotifications(prev => [data.notification, ...prev].slice(0, 10)); // Keep max 10
      }
    };

    // Remove notification when marked as read
    const handleNotificationRead = (data) => {
      console.log('🔔 [Dropdown] Notification marked as read:', data);
      if (data.notificationId) {
        setNotifications(prev => prev.filter(n => n._id !== data.notificationId));
      }
    };

    // Clear all notifications when all marked as read
    const handleAllRead = () => {
      console.log('🔔 [Dropdown] All notifications marked as read');
      setNotifications([]);
    };

    // Remove notification when deleted
    const handleNotificationDeleted = (data) => {
      console.log('🔔 [Dropdown] Notification deleted:', data);
      if (data.notificationId) {
        setNotifications(prev => prev.filter(n => n._id !== data.notificationId));
      }
    };

    // Clear all notifications when all deleted
    const handleAllDeleted = () => {
      console.log('🔔 [Dropdown] All notifications deleted');
      setNotifications([]);
    };

    socket.on('admin:notification:new', handleNewNotification);
    socket.on('notification:new', handleNewNotification);
    socket.on('admin:notification:read', handleNotificationRead);
    socket.on('admin:notification:all-read', handleAllRead);
    socket.on('admin:notification:deleted', handleNotificationDeleted);
    socket.on('admin:notification:all-deleted', handleAllDeleted);

    return () => {
      socket.off('admin:notification:new', handleNewNotification);
      socket.off('notification:new', handleNewNotification);
      socket.off('admin:notification:read', handleNotificationRead);
      socket.off('admin:notification:all-read', handleAllRead);
      socket.off('admin:notification:deleted', handleNotificationDeleted);
      socket.off('admin:notification:all-deleted', handleAllDeleted);
    };
  }, [socket, connected]);

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await adminService.markAllNotificationsAsRead();
      // Socket.IO will handle clearing the list
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = () => {
    // Socket.IO will handle removing the notification from the list
    onNotificationRead();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white  shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {notifications.some(n => !n.read && !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
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
              onMarkAsRead={handleNotificationClick}
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
        <Link
          to="/admin/notifications"
          onClick={onClose}
          className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default AdminNotificationDropdown;

