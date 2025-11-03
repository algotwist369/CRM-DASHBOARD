import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(() => {
    let token = localStorage.getItem('authToken');
    
    if (!token) {
      console.warn('⚠️ No auth token found. Socket connection skipped.');
      return;
    }

    // Remove 'Bearer ' prefix if exists
    token = token.replace(/^Bearer\s+/i, '').trim();

    try {
      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
      
      console.log('🔌 Connecting to Socket.IO server:', SOCKET_URL);
      
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        query: { token }, // Fallback
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setError(err.message);
        setConnected(false);
      });

      newSocket.on('error', (err) => {
        console.error('Socket error:', err);
        setError(err.message || 'Socket error occurred');
      });

      setSocket(newSocket);

      return newSocket;
    } catch (err) {
      console.error('Socket initialization error:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      console.log('Socket manually disconnected');
    }
  }, [socket]);

  // Initialize socket on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    socket,
    connected,
    error,
    connect,
    disconnect
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;

