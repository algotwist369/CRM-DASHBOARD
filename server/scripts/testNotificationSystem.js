require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const AdminNotification = require('../models/AdminNotification');
const { emitToUser, getIO } = require('../config/socket');

// Comprehensive test script for notification system
const testNotificationSystem = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find the first admin
        const admin = await Admin.findOne();
        
        if (!admin) {
            console.log('❌ No admin found. Please create an admin first.');
            process.exit(1);
        }

        console.log(`👤 Found admin: ${admin.email}`);
        console.log(`   Admin ID: ${admin._id}\n`);

        // Test 1: Check Socket.IO
        console.log('📡 Test 1: Checking Socket.IO Status...');
        try {
            const io = getIO();
            const connectedClients = io.engine.clientsCount;
            console.log(`✅ Socket.IO is initialized`);
            console.log(`   Connected clients: ${connectedClients}`);
            if (connectedClients === 0) {
                console.log(`   ⚠️  No clients connected. Make sure frontend is running.`);
            }
        } catch (error) {
            console.log(`❌ Socket.IO Error: ${error.message}`);
            console.log(`   Make sure server is running with Socket.IO initialized`);
        }
        console.log('');

        // Test 2: Check existing notifications
        console.log('📋 Test 2: Checking Existing Notifications...');
        const existingNotifications = await AdminNotification.find({ admin: admin._id }).sort({ createdAt: -1 }).limit(5);
        console.log(`   Total notifications: ${existingNotifications.length}`);
        const unreadCount = await AdminNotification.countDocuments({ admin: admin._id, isRead: false });
        console.log(`   Unread count: ${unreadCount}`);
        if (existingNotifications.length > 0) {
            console.log('   Recent notifications:');
            existingNotifications.forEach((notif, index) => {
                console.log(`   ${index + 1}. ${notif.title} (${notif.isRead ? 'Read' : 'Unread'})`);
            });
        }
        console.log('');

        // Test 3: Create a new notification
        console.log('🔔 Test 3: Creating New Notification...');
        const newNotification = await AdminNotification.create({
            admin: admin._id,
            title: '🧪 Test Notification',
            message: `Real-time test created at ${new Date().toLocaleString()}`,
            type: 'system',
            priority: 'high',
            metadata: {
                source: 'test_script',
                timestamp: new Date().toISOString()
            }
        });
        console.log(`✅ Notification created: ${newNotification._id}`);
        console.log(`   Title: ${newNotification.title}`);
        console.log(`   Message: ${newNotification.message}`);
        console.log('');

        // Test 4: Emit Socket.IO event
        console.log('📤 Test 4: Emitting Socket.IO Event...');
        try {
            const newUnreadCount = await AdminNotification.countDocuments({ admin: admin._id, isRead: false });
            emitToUser(admin._id.toString(), 'admin:notification:new', {
                notification: newNotification.toObject(),
                unreadCount: newUnreadCount
            });
            console.log(`✅ Socket.IO event emitted`);
            console.log(`   Event: admin:notification:new`);
            console.log(`   Target: user:${admin._id}`);
            console.log(`   Unread Count: ${newUnreadCount}`);
            console.log('');
            console.log('💡 Check your browser - notification should appear instantly!');
        } catch (error) {
            console.log(`❌ Failed to emit event: ${error.message}`);
        }
        console.log('');

        // Test 5: Mark as read
        console.log('📝 Test 5: Testing Mark as Read...');
        if (existingNotifications.length > 0 && !existingNotifications[0].isRead) {
            const notifToMark = existingNotifications[0];
            notifToMark.isRead = true;
            notifToMark.readAt = new Date();
            await notifToMark.save();
            
            const updatedUnreadCount = await AdminNotification.countDocuments({ admin: admin._id, isRead: false });
            
            console.log(`✅ Marked notification as read: ${notifToMark.title}`);
            console.log(`   Updated unread count: ${updatedUnreadCount}`);
            
            // Emit read event
            try {
                emitToUser(admin._id.toString(), 'admin:notification:read', {
                    notificationId: notifToMark._id.toString(),
                    unreadCount: updatedUnreadCount
                });
                console.log(`✅ Socket.IO read event emitted`);
            } catch (error) {
                console.log(`❌ Failed to emit read event: ${error.message}`);
            }
        } else {
            console.log('   ℹ️  No unread notifications to mark as read');
        }
        console.log('');

        // Summary
        console.log('📊 Test Summary:');
        console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   ✅ Database: Connected');
        console.log('   ✅ Admin: Found');
        console.log('   ✅ Notification: Created');
        try {
            getIO();
            console.log('   ✅ Socket.IO: Initialized');
        } catch {
            console.log('   ❌ Socket.IO: Not Initialized');
        }
        console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('   1. Make sure backend server is running');
        console.log('   2. Make sure frontend is running and logged in');
        console.log('   3. Check browser console for Socket.IO connection');
        console.log('   4. Run this script again to test real-time updates');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// Run the test
testNotificationSystem();

