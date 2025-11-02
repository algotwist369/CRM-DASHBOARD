require('dotenv').config();
const mongoose = require('mongoose');
const Manager = require('../models/Manager');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');
const Business = require('../models/Business');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb+srv://infoalgotwist_db_user:55zhwdorMn07uanx@cluster0.ejdcjld.mongodb.net/crm_dashboard';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Database connection error:', error);
        process.exit(1);
    }
};

// Generate random date within range
const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Seed customer data
const seedCustomerData = async () => {
    try {
        console.log('🔍 Finding manager with username: ankit, pin: 9125...');
        
        // Find the manager
        const manager = await Manager.findOne({ username: 'ankit', pin: '9125' }).populate('business');
        
        if (!manager) {
            console.error('❌ Manager not found with username: ankit, pin: 9125');
            process.exit(1);
        }

        console.log(`✅ Found manager: ${manager.name}`);
        console.log(`✅ Business: ${manager.business.name}`);

        const businessId = manager.business._id;
        const managerId = manager._id;

        // Get staff for assigning to customers
        const staffMembers = await Staff.find({ business: businessId, isActive: true });
        if (staffMembers.length === 0) {
            console.log('⚠️  No staff found. Please seed staff data first.');
            process.exit(1);
        }

        // Check existing customers
        const existingCustomers = await Customer.countDocuments({ business: businessId });
        console.log(`📊 Existing customers: ${existingCustomers}`);

        // Sample Customer Data - New Customers
        const newCustomers = [
            {
                name: 'Aarav Mehta',
                email: 'aarav.mehta@example.com',
                phone: '9876512345',
                dateOfBirth: new Date('1995-03-15'),
                gender: 'male',
                address: {
                    street: '123 MG Road',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Haircut', 'Hair Spa'],
                    preferredTimeSlots: ['morning', 'afternoon']
                },
                stats: {
                    totalVisits: 1,
                    totalSpent: 800,
                    lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    averageRating: 4.5,
                    loyaltyPoints: 8
                },
                status: 'active',
                communication: {
                    smsNotifications: true,
                    emailNotifications: true,
                    whatsappNotifications: true
                }
            },
            {
                name: 'Ananya Desai',
                email: 'ananya.desai@example.com',
                phone: '9876512346',
                dateOfBirth: new Date('1998-07-22'),
                gender: 'female',
                address: {
                    street: '456 Park Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400002',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Facial', 'Hair Spa'],
                    preferredTimeSlots: ['afternoon', 'evening']
                },
                stats: {
                    totalVisits: 1,
                    totalSpent: 1200,
                    lastVisit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                    averageRating: 4.8,
                    loyaltyPoints: 12
                },
                status: 'active',
                communication: {
                    smsNotifications: true,
                    emailNotifications: true,
                    whatsappNotifications: false
                }
            },
            {
                name: 'Rohan Verma',
                email: 'rohan.verma@example.com',
                phone: '9876512347',
                dateOfBirth: new Date('1992-11-08'),
                gender: 'male',
                address: {
                    street: '789 Bandra West',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400050',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Haircut', 'Beard Trim'],
                    preferredTimeSlots: ['morning']
                },
                stats: {
                    totalVisits: 1,
                    totalSpent: 600,
                    lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    averageRating: 4.0,
                    loyaltyPoints: 6
                },
                status: 'active'
            }
        ];

        // Sample Customer Data - Returning Customers (2-4 visits)
        const returningCustomers = [
            {
                name: 'Kavya Nair',
                email: 'kavya.nair@example.com',
                phone: '9876512348',
                dateOfBirth: new Date('1996-05-20'),
                gender: 'female',
                address: {
                    street: '321 Colaba Causeway',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400005',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Hair Spa', 'Facial', 'Manicure'],
                    preferredTimeSlots: ['afternoon']
                },
                stats: {
                    totalVisits: 3,
                    totalSpent: 4500,
                    lastVisit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                    averageRating: 4.6,
                    loyaltyPoints: 45
                },
                status: 'active',
                emergencyContact: {
                    name: 'Rajesh Nair',
                    phone: '9876599999',
                    relationship: 'Father'
                }
            },
            {
                name: 'Vikram Singh',
                email: 'vikram.singh@example.com',
                phone: '9876512349',
                dateOfBirth: new Date('1990-09-12'),
                gender: 'male',
                address: {
                    street: '654 Andheri West',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400053',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Haircut', 'Hair Color'],
                    preferredTimeSlots: ['evening']
                },
                stats: {
                    totalVisits: 2,
                    totalSpent: 2500,
                    lastVisit: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                    averageRating: 4.3,
                    loyaltyPoints: 25
                },
                status: 'active'
            },
            {
                name: 'Divya Patel',
                email: 'divya.patel@example.com',
                phone: '9876512350',
                dateOfBirth: new Date('1994-02-14'),
                gender: 'female',
                address: {
                    street: '987 Powai',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400076',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Facial', 'Hair Spa', 'Pedicure'],
                    preferredTimeSlots: ['morning', 'afternoon']
                },
                stats: {
                    totalVisits: 4,
                    totalSpent: 6800,
                    lastVisit: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                    averageRating: 4.7,
                    loyaltyPoints: 68
                },
                status: 'active'
            },
            {
                name: 'Aditya Kumar',
                email: 'aditya.kumar@example.com',
                phone: '9876512351',
                dateOfBirth: new Date('1993-08-30'),
                gender: 'male',
                address: {
                    street: '147 Vashi',
                    city: 'Navi Mumbai',
                    state: 'Maharashtra',
                    pincode: '400703',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Haircut', 'Massage'],
                    preferredTimeSlots: ['weekend']
                },
                stats: {
                    totalVisits: 2,
                    totalSpent: 1800,
                    lastVisit: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
                    averageRating: 4.2,
                    loyaltyPoints: 18
                },
                status: 'active'
            }
        ];

        // Sample Customer Data - Loyal Customers (5+ visits)
        const loyalCustomers = [
            {
                name: 'Priya Reddy',
                email: 'priya.reddy@example.com',
                phone: '9876512352',
                dateOfBirth: new Date('1991-12-25'),
                gender: 'female',
                address: {
                    street: '258 Juhu',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400049',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Hair Spa', 'Facial', 'Manicure', 'Pedicure', 'Hair Color'],
                    preferredStaff: staffMembers[0]?._id,
                    preferredTimeSlots: ['afternoon', 'evening']
                },
                stats: {
                    totalVisits: 8,
                    totalSpent: 15000,
                    lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    averageRating: 4.9,
                    loyaltyPoints: 150
                },
                status: 'active',
                emergencyContact: {
                    name: 'Suresh Reddy',
                    phone: '9876588888',
                    relationship: 'Husband'
                },
                medicalInfo: {
                    allergies: ['None'],
                    medicalConditions: []
                }
            },
            {
                name: 'Rajesh Khanna',
                email: 'rajesh.khanna@example.com',
                phone: '9876512353',
                dateOfBirth: new Date('1988-04-18'),
                gender: 'male',
                address: {
                    street: '369 Dadar',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400014',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Haircut', 'Beard Trim', 'Hair Spa'],
                    preferredStaff: staffMembers[0]?._id,
                    preferredTimeSlots: ['morning']
                },
                stats: {
                    totalVisits: 12,
                    totalSpent: 18000,
                    lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    averageRating: 4.8,
                    loyaltyPoints: 180
                },
                status: 'active'
            },
            {
                name: 'Meera Iyer',
                email: 'meera.iyer@example.com',
                phone: '9876512354',
                dateOfBirth: new Date('1997-06-10'),
                gender: 'female',
                address: {
                    street: '741 Thane',
                    city: 'Thane',
                    state: 'Maharashtra',
                    pincode: '400601',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Facial', 'Hair Spa', 'Manicure', 'Pedicure'],
                    preferredStaff: staffMembers[1]?._id,
                    preferredTimeSlots: ['morning', 'afternoon']
                },
                stats: {
                    totalVisits: 6,
                    totalSpent: 12000,
                    lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    averageRating: 4.7,
                    loyaltyPoints: 120
                },
                status: 'active'
            },
            {
                name: 'Arjun Malhotra',
                email: 'arjun.malhotra@example.com',
                phone: '9876512355',
                dateOfBirth: new Date('1989-10-05'),
                gender: 'male',
                address: {
                    street: '852 Borivali',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400092',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Haircut', 'Hair Color', 'Massage'],
                    preferredTimeSlots: ['evening', 'weekend']
                },
                stats: {
                    totalVisits: 10,
                    totalSpent: 22000,
                    lastVisit: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
                    averageRating: 4.6,
                    loyaltyPoints: 220
                },
                status: 'active'
            },
            {
                name: 'Sanjana Rao',
                email: 'sanjana.rao@example.com',
                phone: '9876512356',
                dateOfBirth: new Date('1995-01-28'),
                gender: 'female',
                address: {
                    street: '963 Worli',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400018',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Facial', 'Hair Spa', 'Hair Color', 'Manicure'],
                    preferredStaff: staffMembers[1]?._id,
                    preferredTimeSlots: ['afternoon']
                },
                stats: {
                    totalVisits: 7,
                    totalSpent: 13500,
                    lastVisit: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                    averageRating: 4.8,
                    loyaltyPoints: 135
                },
                status: 'active'
            }
        ];

        // Sample Customer Data - High Value Customers
        const highValueCustomers = [
            {
                name: 'Neha Shah',
                email: 'neha.shah@example.com',
                phone: '9876512357',
                dateOfBirth: new Date('1987-03-17'),
                gender: 'female',
                address: {
                    street: '159 Malabar Hill',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400006',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Premium Facial', 'Hair Spa', 'Manicure', 'Pedicure', 'Hair Color', 'Hair Treatment'],
                    preferredStaff: staffMembers[0]?._id,
                    preferredTimeSlots: ['afternoon', 'evening']
                },
                stats: {
                    totalVisits: 15,
                    totalSpent: 65000,
                    lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    averageRating: 5.0,
                    loyaltyPoints: 650
                },
                status: 'active',
                emergencyContact: {
                    name: 'Amit Shah',
                    phone: '9876577777',
                    relationship: 'Husband'
                },
                medicalInfo: {
                    allergies: ['None'],
                    notes: 'Prefers organic products'
                }
            },
            {
                name: 'Rohan Kapoor',
                email: 'rohan.kapoor@example.com',
                phone: '9876512358',
                dateOfBirth: new Date('1985-07-22'),
                gender: 'male',
                address: {
                    street: '357 Peddar Road',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400026',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Premium Haircut', 'Hair Spa', 'Beard Trim', 'Massage'],
                    preferredStaff: staffMembers[0]?._id,
                    preferredTimeSlots: ['morning', 'weekend']
                },
                stats: {
                    totalVisits: 20,
                    totalSpent: 85000,
                    lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    averageRating: 4.9,
                    loyaltyPoints: 850
                },
                status: 'active'
            },
            {
                name: 'Isha Agarwal',
                email: 'isha.agarwal@example.com',
                phone: '9876512359',
                dateOfBirth: new Date('1992-09-11'),
                gender: 'female',
                address: {
                    street: '468 Breach Candy',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400026',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Premium Facial', 'Hair Spa', 'Hair Treatment', 'Manicure', 'Pedicure'],
                    preferredStaff: staffMembers[1]?._id,
                    preferredTimeSlots: ['afternoon']
                },
                stats: {
                    totalVisits: 18,
                    totalSpent: 72000,
                    lastVisit: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                    averageRating: 4.9,
                    loyaltyPoints: 720
                },
                status: 'active'
            }
        ];

        // Sample Customer Data - Inactive Customers
        const inactiveCustomers = [
            {
                name: 'Siddharth Joshi',
                email: 'siddharth.joshi@example.com',
                phone: '9876512360',
                dateOfBirth: new Date('1993-11-30'),
                gender: 'male',
                address: {
                    street: '753 Ghatkopar',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400077',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Haircut'],
                    preferredTimeSlots: ['evening']
                },
                stats: {
                    totalVisits: 2,
                    totalSpent: 1400,
                    lastVisit: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
                    averageRating: 4.0,
                    loyaltyPoints: 14
                },
                status: 'inactive'
            },
            {
                name: 'Pooja Nanda',
                email: 'pooja.nanda@example.com',
                phone: '9876512361',
                dateOfBirth: new Date('1996-04-15'),
                gender: 'female',
                address: {
                    street: '951 Kurla',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400070',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Facial', 'Hair Spa'],
                    preferredTimeSlots: ['afternoon']
                },
                stats: {
                    totalVisits: 1,
                    totalSpent: 900,
                    lastVisit: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 150 days ago
                    averageRating: 4.2,
                    loyaltyPoints: 9
                },
                status: 'inactive'
            },
            {
                name: 'Karan Gupta',
                email: 'karan.gupta@example.com',
                phone: '9876512362',
                dateOfBirth: new Date('1994-08-07'),
                gender: 'male',
                address: {
                    street: '147 Chembur',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400071',
                    country: 'India'
                },
                preferences: {
                    preferredServices: ['Haircut', 'Beard Trim'],
                    preferredTimeSlots: ['morning']
                },
                stats: {
                    totalVisits: 3,
                    totalSpent: 2700,
                    lastVisit: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000), // 110 days ago
                    averageRating: 4.1,
                    loyaltyPoints: 27
                },
                status: 'inactive'
            }
        ];

        // Combine all customers
        const allCustomers = [
            ...newCustomers,
            ...returningCustomers,
            ...loyalCustomers,
            ...highValueCustomers,
            ...inactiveCustomers
        ];

        // Add business to each customer
        const customersToInsert = allCustomers.map(customer => ({
            ...customer,
            business: businessId
        }));

        // Insert customers
        console.log(`\n📝 Inserting ${customersToInsert.length} customers...`);
        const insertedCustomers = await Customer.insertMany(customersToInsert);
        console.log(`✅ Successfully inserted ${insertedCustomers.length} customers`);

        // Create transactions for some customers
        console.log('\n💰 Creating transactions...');
        const transactions = [];
        
        // Create transactions for loyal and high value customers
        const activeCustomers = [...loyalCustomers, ...highValueCustomers, ...returningCustomers.slice(0, 2)];
        
        for (let i = 0; i < insertedCustomers.length; i++) {
            const customer = insertedCustomers[i];
            const customerData = allCustomers[i];
            const visits = customerData.stats.totalVisits || 1;
            
            // Create transactions based on visit count
            for (let j = 0; j < visits; j++) {
                const transactionDate = new Date(customerData.stats.lastVisit);
                transactionDate.setDate(transactionDate.getDate() - (visits - j - 1) * 7); // Spread over weeks
                
                const services = customerData.preferences?.preferredServices || ['Haircut'];
                // Create a transaction for each service (or combine for one transaction)
                const serviceName = services[0]; // Use first service
                const serviceType = serviceName.toLowerCase().includes('hair') ? 'hair' : 
                                   serviceName.toLowerCase().includes('facial') ? 'facial' : 
                                   serviceName.toLowerCase().includes('massage') ? 'massage' : 
                                   serviceName.toLowerCase().includes('nail') ? 'nail' : 
                                   serviceName.toLowerCase().includes('spa') ? 'spa' : 'other';
                
                const basePrice = Math.round(400 + (Math.random() * 600)); // 400-1000
                const discount = j === 0 ? Math.round(basePrice * 0.1) : 0; // 10% discount on first visit
                const tax = Math.round(basePrice * 0.18); // 18% tax
                const finalPrice = basePrice - discount + tax;
                
                const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
                
                transactions.push({
                    business: businessId,
                    manager: managerId,
                    customer: customer._id,
                    customerName: customer.name,
                    customerPhone: customer.phone,
                    customerEmail: customer.email,
                    staff: randomStaff?._id,
                    serviceName: serviceName,
                    serviceType: serviceType,
                    serviceCategory: serviceName,
                    basePrice: basePrice,
                    discount: discount,
                    tax: tax,
                    finalPrice: Math.round(finalPrice),
                    paymentStatus: 'completed', // Use 'completed' not 'paid'
                    paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)],
                    transactionDate: transactionDate,
                    isNewCustomer: j === 0, // First transaction is new customer
                    duration: 60,
                    serviceStartTime: new Date(transactionDate.getTime() + 9 * 60 * 60 * 1000), // 9 AM
                    serviceEndTime: new Date(transactionDate.getTime() + 10 * 60 * 60 * 1000), // 10 AM
                    rating: customerData.stats.averageRating ? Math.round(customerData.stats.averageRating) : 4
                });
            }
        }
        
        if (transactions.length > 0) {
            await Transaction.insertMany(transactions);
            console.log(`✅ Created ${transactions.length} transactions`);
        }

        // Create appointments for some customers
        console.log('\n📅 Creating appointments...');
        const appointments = [];
        
        for (let i = 0; i < Math.min(insertedCustomers.length, 10); i++) {
            const customer = insertedCustomers[i];
            const customerData = allCustomers[i];
            
            if (customer.status === 'active' && customerData.stats.lastVisit) {
                const appointmentDate = new Date(customerData.stats.lastVisit);
                appointmentDate.setHours(14, 0, 0, 0); // 2 PM
                
                const services = customerData.preferences?.preferredServices?.slice(0, 2) || ['Haircut'];
                const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
                
                const totalPrice = services.length * 500;
                const tax = Math.round(totalPrice * 0.18);
                const finalPrice = totalPrice + tax;
                
                // Generate unique confirmation code
                const confirmationCode = `APT${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                
                appointments.push({
                    business: businessId,
                    customer: customer._id,
                    staff: randomStaff?._id,
                    appointmentDate: appointmentDate,
                    startTime: '14:00',
                    endTime: '15:00',
                    duration: 60,
                    services: services.map(s => ({
                        serviceName: s,
                        serviceType: s.toLowerCase().includes('hair') ? 'hair' : 
                                   s.toLowerCase().includes('facial') ? 'facial' : 
                                   s.toLowerCase().includes('massage') ? 'massage' :
                                   s.toLowerCase().includes('nail') ? 'nail' :
                                   s.toLowerCase().includes('spa') ? 'spa' : 'other',
                        serviceCategory: s,
                        price: 500,
                        duration: 60
                    })),
                    totalPrice: totalPrice,
                    discount: 0,
                    tax: tax,
                    finalPrice: finalPrice,
                    status: ['completed', 'confirmed'][Math.floor(Math.random() * 2)],
                    bookingSource: ['online', 'phone', 'walk_in'][Math.floor(Math.random() * 3)],
                    bookingNotes: `Appointment for ${services.join(', ')}`,
                    confirmationCode: confirmationCode
                });
            }
        }
        
        if (appointments.length > 0) {
            await Appointment.insertMany(appointments);
            console.log(`✅ Created ${appointments.length} appointments`);
        }

        // Update customer stats based on transactions
        console.log('\n🔄 Updating customer statistics...');
        for (const customer of insertedCustomers) {
            const customerTransactions = transactions.filter(t => 
                t.customer.toString() === customer._id.toString()
            );
            
            if (customerTransactions.length > 0) {
                const totalSpent = customerTransactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
                const lastTransaction = customerTransactions.sort((a, b) => 
                    new Date(b.transactionDate) - new Date(a.transactionDate)
                )[0];
                
                await Customer.findByIdAndUpdate(customer._id, {
                    'stats.totalVisits': customerTransactions.length,
                    'stats.totalSpent': totalSpent,
                    'stats.lastVisit': lastTransaction.transactionDate,
                    'stats.loyaltyPoints': Math.floor(totalSpent / 100)
                });
            }
        }

        console.log('\n✅ Customer data seeding completed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   - Total Customers: ${insertedCustomers.length}`);
        console.log(`   - New Customers: ${newCustomers.length}`);
        console.log(`   - Returning Customers: ${returningCustomers.length}`);
        console.log(`   - Loyal Customers: ${loyalCustomers.length}`);
        console.log(`   - High Value Customers: ${highValueCustomers.length}`);
        console.log(`   - Inactive Customers: ${inactiveCustomers.length}`);
        console.log(`   - Transactions Created: ${transactions.length}`);
        console.log(`   - Appointments Created: ${appointments.length}`);

    } catch (error) {
        console.error('❌ Error seeding customer data:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        await seedCustomerData();
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

main();

