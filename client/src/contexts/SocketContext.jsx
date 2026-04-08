import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Determine Socket URL based on environment or fallback
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://api.sa.ramaai.cloud');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || socketRef.current) return;

    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

    console.log('🔌 Connecting to Socket.IO server:', SOCKET_URL);

    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: cleanToken },
      secure: true,
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connect error:', err.message);
      setError(err.message);
    });

    return () => {
      console.log('🔌 Cleaning up socket connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        error
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
