import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import adminService from '../../services/admin/adminService';

const SocketDebugPanel = () => {
  const { socket, connected, error } = useSocket();
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [events, setEvents] = useState([]);

  // Fetch unread count
  const fetchCount = async () => {
    const result = await adminService.getUnreadNotificationCount();
    if (result.success) {
      setUnreadCount(result.count || 0);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  // Listen to all notification events
  useEffect(() => {
    if (!socket || !connected) return;

    const addEvent = (eventName, data) => {
      const timestamp = new Date().toLocaleTimeString();
      setEvents(prev => [{ time: timestamp, event: eventName, data }, ...prev].slice(0, 10));
    };

    socket.on('admin:notification:new', (data) => {
      addEvent('admin:notification:new', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });

    socket.on('notification:new', (data) => {
      addEvent('notification:new', data);
    });

    socket.on('admin:notification:read', (data) => {
      addEvent('admin:notification:read', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });

    socket.on('admin:notification:all-read', (data) => {
      addEvent('admin:notification:all-read', data);
      setUnreadCount(0);
    });

    // Listen to any event for debugging
    socket.onAny((eventName, ...args) => {
      console.log(`📨 Socket Event: ${eventName}`, args);
    });

    return () => {
      socket.off('admin:notification:new');
      socket.off('notification:new');
      socket.off('admin:notification:read');
      socket.off('admin:notification:all-read');
      socket.offAny();
    };
  }, [socket, connected]);

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 z-50 text-sm font-medium"
      >
        🐛 Debug Socket.IO
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-[600px] flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Socket.IO Debug Panel</h3>
        <button
          onClick={() => setShowPanel(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {/* Connection Status */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="font-semibold text-gray-900">Connection Status</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {connected ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
            {socket && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Socket ID:</span>
                  <span className="font-mono text-gray-900">{socket.id || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Transport:</span>
                  <span className="font-mono text-gray-900">
                    {socket.io?.engine?.transport?.name || 'N/A'}
                  </span>
                </div>
              </>
            )}
            {error && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Error:</span>
                <span className="font-medium text-red-600">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notification Count */}
        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
          <div className="font-semibold text-gray-900">Notification Count</div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs">Unread Count:</span>
            <span className="text-2xl font-bold text-blue-600">{unreadCount}</span>
          </div>
          <button
            onClick={fetchCount}
            className="w-full text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            Refresh Count
          </button>
        </div>

        {/* Recent Events */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="font-semibold text-gray-900">Recent Events ({events.length})</div>
          {events.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">
              No events received yet
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {events.map((event, index) => (
                <div key={index} className="bg-white rounded p-2 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-blue-600">{event.event}</span>
                    <span className="text-xs text-gray-500">{event.time}</span>
                  </div>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="font-semibold text-gray-900">Actions</div>
          <div className="space-y-2">
            <button
              onClick={() => {
                if (socket) {
                  socket.emit('ping');
                  console.log('📤 Sent ping to server');
                }
              }}
              className="w-full text-xs bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700"
            >
              Send Ping
            </button>
            <button
              onClick={() => {
                console.log('📊 Socket Debug Info:');
                console.log('- Connected:', connected);
                console.log('- Socket:', socket);
                console.log('- Unread Count:', unreadCount);
                console.log('- Recent Events:', events);
              }}
              className="w-full text-xs bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700"
            >
              Log to Console
            </button>
            <button
              onClick={() => setEvents([])}
              className="w-full text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
            >
              Clear Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocketDebugPanel;

