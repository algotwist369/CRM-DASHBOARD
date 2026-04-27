// socket.js - Socket.IO configuration for real-time notifications
const socketIO = require('socket.io');
const { verifyAccessToken } = require('../utils/generateToken');

const { createAdapter } = require('@socket.io/redis-adapter');
const { redis, createTrackedDuplicate } = require('./redis');

let io = null;
let redisSubClient = null; // Store reference for cleanup

const initializeSocket = (server) => {
    let adapter;

    // Only attempt to use Redis adapter if Redis is configured and not explicitly disabled
    try {
        const pubClient = redis;
        redisSubClient = createTrackedDuplicate(redis); // Use tracked duplicate

        // CRITICAL: Handle errors on the subClient to prevent crashing
        redisSubClient.on('error', (err) => {
            console.error('[Socket.IO] Redis Sub Client Error:', err.message);
        });

        adapter = createAdapter(pubClient, redisSubClient);
    } catch (err) {
        console.warn('[Socket.IO] Failed to initialize Redis Adapter, falling back to memory adapter:', err.message);
    }

    io = socketIO(server, {
        adapter: adapter, // Will be undefined if failed, triggering default memory adapter
        cors: {
            origin: [
                process.env.CLIENT_URL,
                'https://spaadvisor.in',
                'https://admin.spaadvisor.in', // Added likely admin domain
                'http://localhost:5173',
                'http://localhost:3000'
            ].filter(Boolean),
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Authentication middleware
    io.use((socket, next) => {
        try {
            let token = socket.handshake.auth.token || socket.handshake.query.token;

            if (!token) {
                console.error('Socket auth failed: No token provided');
                return next(new Error('No token provided'));
            }

            // Remove 'Bearer ' prefix if exists
            token = token.replace(/^Bearer\s+/i, '').trim();

            // Verify JWT token using the same method as HTTP auth
            let decoded;
            try {
                decoded = verifyAccessToken(token);
            } catch (err) {
                console.error('Socket token verification failed:', err.message);
                if (err.name === 'TokenExpiredError') {
                    return next(new Error('Token expired'));
                }
                return next(new Error('Invalid token'));
            }

            if (!decoded || !decoded.id) {
                console.error('Socket auth failed: Invalid token payload');
                return next(new Error('Invalid token payload'));
            }

            socket.userId = decoded.id;
            socket.userRole = decoded.role || 'user';

            console.log(`Socket authenticated: User ${socket.userId} (${socket.userRole})`);
            next();
        } catch (error) {
            console.error('Socket authentication error:', error.message);
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId} (${socket.userRole})`);

        // Join user-specific room
        socket.join(`user:${socket.userId}`);
        socket.join(`role:${socket.userRole}`);

        // Handle disconnect
        socket.on('disconnect', (reason) => {
            console.log(`User disconnected: ${socket.userId} (${reason})`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Ping/pong for connection health
        socket.on('ping', () => {
            socket.emit('pong');
        });
    });

    console.log('Socket.IO initialized');
    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initializeSocket first.');
    }
    return io;
};

// Emit notification to specific user
const emitToUser = (userId, event, data) => {
    if (!io) {
        console.warn('Socket.IO not initialized');
        return;
    }
    io.to(`user:${userId}`).emit(event, data);
    console.log(`📤 Emitted "${event}" to user: ${userId}`);
};

// Emit notification to specific role
const emitToRole = (role, event, data) => {
    if (!io) {
        console.warn('Socket.IO not initialized');
        return;
    }
    io.to(`role:${role}`).emit(event, data);
    console.log(`📤 Emitted "${event}" to role: ${role}`);
};

// Emit notification to all connected clients
const emitToAll = (event, data) => {
    if (!io) {
        console.warn('Socket.IO not initialized');
        return;
    }
    io.emit(event, data);
    console.log(`📤 Emitted "${event}" to all`);
};

// Get connected users count
const getConnectedUsersCount = () => {
    if (!io) return 0;
    return io.engine.clientsCount;
};

// Shutdown Socket.IO and close Redis connections
const shutdown = async () => {
    console.log('[Socket.IO] Shutting down...');

    if (io) {
        // Close all socket connections
        io.close();
        io = null;
    }

    // Close Redis sub client
    if (redisSubClient && redisSubClient.status !== 'end') {
        try {
            await redisSubClient.quit();
        } catch (err) {
            console.error('[Socket.IO] Error closing Redis sub client:', err.message);
            await redisSubClient.disconnect();
        }
        redisSubClient = null;
    }

    console.log('[Socket.IO] Shutdown complete');
};

module.exports = {
    initializeSocket,
    getIO,
    emitToUser,
    emitToRole,
    emitToAll,
    getConnectedUsersCount,
    shutdown
};

