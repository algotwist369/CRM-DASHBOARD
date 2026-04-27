/**
 * Script to create Notifications for each business
 * Usage: node server/scripts/createNotifications.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Manager = require('../models/Manager');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');

const notificationTemplates = [
    {
        type: 'promotion',
        title: (business) => `Exclusive Offer at ${business.name}`,
        message: (business) => `Enjoy 20% off on our premium services at ${business.name}. Limited time offer!`,
        campaignName: 'Premium Promotion',
        actionText: 'Book Now'
    },
    {
        type: 'reminder',
        title: () => 'Time for a Relaxing Visit',
        message: (business) => `We miss you at ${business.name}! Schedule your next appointment today and enjoy a complimentary add-on service.`,
        campaignName: 'Winback Reminder',
        actionText: 'Schedule Visit'
    },
    {
        type: 'announcement',
        title: () => 'New Services Just Arrived!',
        message: (business) => `${business.name} just launched new seasonal services curated for you. Explore and experience them this week.`,
        campaignName: 'Service Launch',
        actionText: 'Explore Now'
    }
];

const channelOptions = ['sms', 'email', 'whatsapp'];
const notificationImages = [
    'https://images.pexels.com/photos/374148/pexels-photo-374148.jpeg',
    'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
    'https://images.pexels.com/photos/6628895/pexels-photo-6628895.jpeg',
    'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg'
];

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
}

function generateDeliveries(customers, channels) {
    return customers.map(customer => {
        const channel = getRandomItem(channels);
        const statusOptions = ['sent', 'delivered', 'opened', 'clicked'];
        const status = getRandomItem(statusOptions);
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 10));

        const record = {
            customer: customer._id,
            channel,
            status,
            sentAt: baseDate,
            deliveredAt: ['delivered', 'opened', 'clicked'].includes(status) ? new Date(baseDate.getTime() + 30 * 60000) : null,
            openedAt: ['opened', 'clicked'].includes(status) ? new Date(baseDate.getTime() + 60 * 60000) : null,
            clickedAt: status === 'clicked' ? new Date(baseDate.getTime() + 90 * 60000) : null
        };

        if (status === 'failed') {
            record.failedAt = new Date(baseDate.getTime() + 15 * 60000);
            record.failureReason = 'Network issue';
        }

        return record;
    });
}

function calculateStats(deliveries) {
    const stats = {
        totalRecipients: deliveries.length,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
        bounced: 0
    };

    deliveries.forEach(delivery => {
        if (delivery.status !== 'pending') stats.sent += 1;
        if (['delivered', 'opened', 'clicked'].includes(delivery.status)) stats.delivered += 1;
        if (['opened', 'clicked'].includes(delivery.status)) stats.opened += 1;
        if (delivery.status === 'clicked') stats.clicked += 1;
        if (delivery.status === 'failed') stats.failed += 1;
        if (delivery.status === 'bounced') stats.bounced += 1;
    });

    return stats;
}

function calculateAnalytics(stats, statsRevenue = 0) {
    const { delivered, opened, clicked, totalRecipients } = stats;

    return {
        openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
        clickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0,
        conversionRate: clicked > 0 ? Math.round((clicked / stats.sent) * 100) : 0,
        revenue: statsRevenue,
        newBookings: Math.floor(clicked * (0.3 + Math.random() * 0.4))
    };
}

async function createNotifications() {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        const admin = await Admin.findOne({ email: 'dinesh@dishonlinesolution.com' });
        if (!admin) {
            console.error('❌ Admin not found. Please run createAdmin.js first.');
            process.exit(1);
        }

        console.log(`👤 Found Admin: ${admin.companyName} (${admin.name})\n`);

        const businesses = await Business.find({ admin: admin._id, isActive: true })
            .populate('managers')
            .select('_id name branch type city managers')
            .sort({ createdAt: 1 });

        if (!businesses.length) {
            console.error('❌ No businesses found. Please run createBusinesses.js first.');
            process.exit(1);
        }

        console.log(`📦 Found ${businesses.length} businesses\n`);
        console.log('📣 Creating notifications for marketing workflows...\n');

        let totalCreated = 0;
        let totalErrors = 0;
        const summaryPerBusiness = [];

        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            const manager = business.managers && business.managers.length ? business.managers[0] : null;

            if (!manager) {
                console.log(`⚠️  [${i + 1}/${businesses.length}] Skipped ${business.name} - no manager found`);
                continue;
            }

            const customers = await Customer.find({ business: business._id })
                .select('_id firstName lastName email phone totalSpent totalVisits customerType membershipTier marketingConsent');

            if (!customers.length) {
                console.log(`⚠️  [${i + 1}/${businesses.length}] Skipped ${business.name} - no customers found`);
                continue;
            }

            console.log(`\n🏢 [${i + 1}/${businesses.length}] ${business.name} - ${business.branch} (${business.type})`);

            let createdForBusiness = 0;

            for (let templateIdx = 0; templateIdx < notificationTemplates.length; templateIdx++) {
                const template = notificationTemplates[templateIdx];
                const targetAudienceType = template.type === 'promotion' ? 'segment' : template.type === 'reminder' ? 'inactive' : 'all';
                const channels = getRandomItems(channelOptions, 2 + Math.floor(Math.random() * 2));
                const targetCustomers = getRandomItems(customers, 12 + Math.floor(Math.random() * 8));
                const deliveries = generateDeliveries(targetCustomers, channels);
                const stats = calculateStats(deliveries);
                const revenue = stats.clicked * (2000 + Math.floor(Math.random() * 2000));
                const analytics = calculateAnalytics(stats, revenue);

                const scheduledAt = new Date();
                scheduledAt.setDate(scheduledAt.getDate() - (templateIdx + Math.floor(Math.random() * 5)));
                scheduledAt.setHours(10 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60), 0, 0);

                const notificationData = {
                    business: business._id,
                    sender: manager._id,
                    title: template.title(business),
                    message: template.message(business),
                    type: template.type,
                    targetAudience: {
                        type: targetAudienceType,
                        segments: targetAudienceType === 'segment' ? [{
                            name: 'High Value Customers',
                            criteria: {
                                minVisits: 3,
                                minSpent: 10000,
                                lastVisitDays: 60,
                                preferredServices: business.type === 'spa' ? ['massage', 'facial'] : business.type === 'hotel' ? ['room', 'spa'] : ['hair']
                            }
                        }] : [],
                        individualCustomers: targetAudienceType === 'individual' ? getRandomItems(customers, 3).map(c => c._id) : []
                    },
                    content: {
                        imageUrl: getRandomItem(notificationImages),
                        actionUrl: 'https://crm-dashboard.example.com/book-now',
                        actionText: template.actionText,
                        expiryDate: template.type === 'promotion' ? new Date(scheduledAt.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
                        discountCode: template.type === 'promotion' ? `SAVE${10 + Math.floor(Math.random() * 20)}` : null,
                        discountPercentage: template.type === 'promotion' ? 10 + Math.floor(Math.random() * 15) : null,
                        discountAmount: template.type === 'promotion' ? 500 + Math.floor(Math.random() * 500) : null
                    },
                    delivery: {
                        channels,
                        scheduledAt,
                        timezone: 'Asia/Kolkata',
                        priority: template.type === 'announcement' ? 'normal' : 'high'
                    },
                    campaign: {
                        name: `${template.campaignName} - ${scheduledAt.toLocaleDateString('en-IN')}`,
                        description: `${template.campaignName} targeting ${targetAudienceType} customers`,
                        tags: [template.type, business.type, 'automation']
                    },
                    status: 'sent',
                    stats,
                    deliveries,
                    analytics,
                    metadata: {
                        createdBy: manager.name,
                        approvedBy: manager._id,
                        approvedAt: scheduledAt,
                        notes: `Auto-generated notification for ${business.name}`
                    }
                };

                try {
                    const notification = await Notification.create(notificationData);
                    createdForBusiness += 1;
                    totalCreated += 1;

                    if (templateIdx < 2) {
                        console.log(`   ✅ ${template.type.toUpperCase()} - ${notification.title}`);
                        console.log(`      Recipients: ${stats.totalRecipients} | Open Rate: ${analytics.openRate}% | Click Rate: ${analytics.clickRate}%`);
                    }
                } catch (error) {
                    totalErrors += 1;
                    console.error(`   ❌ Failed to create ${template.type} notification: ${error.message}`);
                }
            }

            summaryPerBusiness.push({
                business: business.name,
                branch: business.branch,
                created: createdForBusiness
            });

            console.log(`   📊 Notifications Created: ${createdForBusiness}`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Overall Summary:');
        console.log(`   ✅ Total Notifications Created: ${totalCreated}`);
        console.log(`   ❌ Total Errors: ${totalErrors}`);
        console.log(`   📦 Businesses Processed: ${summaryPerBusiness.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📋 Per-Business Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        summaryPerBusiness.forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.business} - ${item.branch}: ${item.created} notifications`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const totalStats = await Notification.aggregate([
            { $match: { business: { $in: businesses.map(b => b._id) } } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    recipients: { $sum: '$stats.totalRecipients' },
                    delivered: { $sum: '$stats.delivered' },
                    opened: { $sum: '$stats.opened' },
                    clicked: { $sum: '$stats.clicked' }
                }
            }
        ]);

        console.log('📈 Notification Statistics by Type:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        totalStats.forEach(stat => {
            const openRate = stat.delivered > 0 ? Math.round((stat.opened / stat.delivered) * 100) : 0;
            const clickRate = stat.delivered > 0 ? Math.round((stat.clicked / stat.delivered) * 100) : 0;
            console.log(`- ${stat._id.toUpperCase()}: ${stat.count} notifications | Recipients: ${stat.recipients} | Open Rate: ${openRate}% | Click Rate: ${clickRate}%`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

createNotifications();
