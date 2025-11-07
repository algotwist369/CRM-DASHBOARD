/**
 * Script to create multiple businesses (14 spas + hotels and salons)
 * Usage: node server/scripts/createBusinesses.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');

// Helper function to generate GST number
function generateGST(stateCode) {
    const pan = 'ABCDE' + Math.floor(Math.random() * 10000).toString().padStart(4, '0') + 'F';
    return `${stateCode}${pan}1Z5`;
}

// Helper function to generate PAN
function generatePAN() {
    return 'ABCDE' + Math.floor(Math.random() * 10000).toString().padStart(4, '0') + 'F';
}

// Helper function to generate phone number
function generatePhone() {
    const prefixes = ['6', '7', '8', '9'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 100000000).toString().padStart(9, '0');
    return `+91${prefix}${number}`;
}

// Helper function to generate IFSC
function generateIFSC() {
    const banks = ['HDFC', 'ICIC', 'SBIN', 'AXIS', 'PNB', 'BOFA', 'UTIB'];
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const code = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${bank}0${code}`;
}

// Indian cities with coordinates [lat, lng]
const indianCities = {
    'Mumbai': { state: 'Maharashtra', zip: '400001', coords: [19.0760, 72.8777] },
    'Delhi': { state: 'Delhi', zip: '110001', coords: [28.6139, 77.2090] },
    'Bangalore': { state: 'Karnataka', zip: '560001', coords: [12.9716, 77.5946] },
    'Hyderabad': { state: 'Telangana', zip: '500001', coords: [17.3850, 78.4867] },
    'Chennai': { state: 'Tamil Nadu', zip: '600001', coords: [13.0827, 80.2707] },
    'Kolkata': { state: 'West Bengal', zip: '700001', coords: [22.5726, 88.3639] },
    'Pune': { state: 'Maharashtra', zip: '411001', coords: [18.5204, 73.8567] },
    'Jaipur': { state: 'Rajasthan', zip: '302001', coords: [26.9124, 75.7873] },
    'Ahmedabad': { state: 'Gujarat', zip: '380001', coords: [23.0225, 72.5714] },
    'Surat': { state: 'Gujarat', zip: '395001', coords: [21.1702, 72.8311] },
    'Lucknow': { state: 'Uttar Pradesh', zip: '226001', coords: [26.8467, 80.9462] },
    'Kanpur': { state: 'Uttar Pradesh', zip: '208001', coords: [26.4499, 80.3319] },
    'Nagpur': { state: 'Maharashtra', zip: '440001', coords: [21.1458, 79.0882] },
    'Indore': { state: 'Madhya Pradesh', zip: '452001', coords: [22.7196, 75.8577] },
    'Thane': { state: 'Maharashtra', zip: '400601', coords: [19.2183, 72.9781] },
    'Bhopal': { state: 'Madhya Pradesh', zip: '462001', coords: [23.2599, 77.4126] },
    'Visakhapatnam': { state: 'Andhra Pradesh', zip: '530001', coords: [17.6868, 83.2185] },
    'Patna': { state: 'Bihar', zip: '800001', coords: [25.5941, 85.1376] },
    'Vadodara': { state: 'Gujarat', zip: '390001', coords: [22.3072, 73.1812] },
    'Ghaziabad': { state: 'Uttar Pradesh', zip: '201001', coords: [28.6692, 77.4538] }
};

// State codes for GST
const stateCodes = {
    'Maharashtra': '27',
    'Delhi': '07',
    'Karnataka': '29',
    'Telangana': '36',
    'Tamil Nadu': '33',
    'West Bengal': '19',
    'Rajasthan': '08',
    'Gujarat': '24',
    'Uttar Pradesh': '09',
    'Madhya Pradesh': '23',
    'Andhra Pradesh': '37',
    'Bihar': '10'
};

// Business data - 14 Spas + 4 Hotels + 2 Salons = 20 businesses
const businessesData = [
    // ==================== SPAS (14) ====================
    {
        type: 'spa',
        name: 'Serenity Wellness Spa',
        branch: 'Mumbai Central',
        city: 'Mumbai',
        address: '123, Marine Drive, Near Gateway of India',
        description: 'Premium wellness spa offering Ayurvedic treatments, aromatherapy, and relaxation therapies. Experience ultimate rejuvenation.',
        category: 'Wellness & Beauty',
        subCategory: 'Ayurvedic Spa',
        tags: ['Ayurvedic', 'Aromatherapy', 'Couples Spa', 'Luxury'],
        specialties: ['Deep Tissue Massage', 'Hot Stone Therapy', 'Facial Treatments', 'Body Wraps'],
        features: ['WiFi', 'AC', 'Parking', 'Changing Rooms', 'Steam Room', 'Sauna'],
        amenities: ['Reception Area', 'Waiting Lounge', 'Refreshments', 'Locker Facility'],
        languages: ['English', 'Hindi', 'Marathi'],
        capacity: {
            numberOfRooms: 8,
            numberOfFloors: 2,
            totalArea: '3500 sq ft',
            parkingSpaces: 10
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200',
            banner: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
                'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
                'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/serenitywellnessmumbai',
            instagram: 'https://instagram.com/serenitywellnessmumbai',
            whatsapp: '+919876543210'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '21:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.5,
            totalReviews: 127,
            fiveStars: 85,
            fourStars: 30,
            threeStars: 10,
            twoStars: 2,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Blissful Retreat Spa',
        branch: 'Connaught Place',
        city: 'Delhi',
        address: '45, Connaught Place, Block A',
        description: 'Luxury spa in the heart of Delhi offering traditional and modern spa treatments.',
        category: 'Wellness & Beauty',
        subCategory: 'Luxury Spa',
        tags: ['Luxury', 'Traditional', 'Couples', 'Corporate'],
        specialties: ['Swedish Massage', 'Thai Massage', 'Reflexology', 'Hair Spa'],
        features: ['WiFi', 'AC', 'Parking', 'Valet Service'],
        amenities: ['Café', 'Retail Shop', 'Membership Program'],
        languages: ['English', 'Hindi'],
        capacity: {
            numberOfRooms: 12,
            numberOfFloors: 3,
            totalArea: '5000 sq ft',
            parkingSpaces: 15
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: true
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=200',
            banner: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
                'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/blissfulretreatdelhi',
            instagram: 'https://instagram.com/blissfulretreatdelhi',
            whatsapp: '+919876543211'
        },
        settings: {
            workingHours: {
                open: '10:00',
                close: '22:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 45,
                slotDuration: 90,
                bufferTime: 20,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.7,
            totalReviews: 203,
            fiveStars: 150,
            fourStars: 45,
            threeStars: 8,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Tranquil Oasis Spa',
        branch: 'Koramangala',
        city: 'Bangalore',
        address: '78, 5th Block, Koramangala',
        description: 'Modern spa facility with state-of-the-art equipment and trained therapists.',
        category: 'Wellness & Beauty',
        subCategory: 'Modern Spa',
        tags: ['Modern', 'Tech-Enabled', 'Eco-Friendly'],
        specialties: ['Deep Tissue', 'Sports Massage', 'Prenatal Massage', 'Detox Treatments'],
        features: ['WiFi', 'AC', 'Parking', 'Digital Booking'],
        amenities: ['Juice Bar', 'Yoga Studio', 'Meditation Room'],
        languages: ['English', 'Hindi', 'Kannada'],
        capacity: {
            numberOfRooms: 10,
            numberOfFloors: 2,
            totalArea: '4000 sq ft',
            parkingSpaces: 12
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200',
            banner: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
                'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/tranquiloasisbangalore',
            instagram: 'https://instagram.com/tranquiloasisbangalore',
            whatsapp: '+919876543212'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '20:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.4,
            totalReviews: 89,
            fiveStars: 60,
            fourStars: 25,
            threeStars: 4,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Harmony Wellness Center',
        branch: 'Hitech City',
        city: 'Hyderabad',
        address: 'Sector 2, Hitech City, Near Cyber Towers',
        description: 'Holistic wellness center combining spa treatments with yoga and meditation.',
        category: 'Wellness & Beauty',
        subCategory: 'Holistic Spa',
        tags: ['Holistic', 'Yoga', 'Meditation', 'Wellness'],
        specialties: ['Ayurvedic Massage', 'Yoga Therapy', 'Meditation Sessions', 'Reiki'],
        features: ['WiFi', 'AC', 'Parking', 'Garden Area'],
        amenities: ['Yoga Hall', 'Meditation Room', 'Organic Café'],
        languages: ['English', 'Hindi', 'Telugu'],
        capacity: {
            numberOfRooms: 6,
            numberOfFloors: 2,
            totalArea: '3000 sq ft',
            parkingSpaces: 8
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: false,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200',
            banner: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/harmonywellnesshyderabad',
            instagram: 'https://instagram.com/harmonywellnesshyderabad',
            whatsapp: '+919876543213'
        },
        settings: {
            workingHours: {
                open: '08:00',
                close: '20:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 90,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.6,
            totalReviews: 156,
            fiveStars: 110,
            fourStars: 40,
            threeStars: 6,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Royal Touch Spa',
        branch: 'T Nagar',
        city: 'Chennai',
        address: '12, Usman Road, T Nagar',
        description: 'Premium spa offering traditional South Indian and international treatments.',
        category: 'Wellness & Beauty',
        subCategory: 'Traditional Spa',
        tags: ['Traditional', 'South Indian', 'Luxury', 'Herbal'],
        specialties: ['Abhyanga', 'Shirodhara', 'Udvartana', 'Pizhichil'],
        features: ['WiFi', 'AC', 'Parking', 'Traditional Décor'],
        amenities: ['Herbal Shop', 'Consultation Room'],
        languages: ['English', 'Hindi', 'Tamil'],
        capacity: {
            numberOfRooms: 8,
            numberOfFloors: 2,
            totalArea: '3500 sq ft',
            parkingSpaces: 10
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=200',
            banner: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/royaltouchchennai',
            instagram: 'https://instagram.com/royaltouchchennai',
            whatsapp: '+919876543214'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '21:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 20,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.5,
            totalReviews: 98,
            fiveStars: 70,
            fourStars: 25,
            threeStars: 3,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Zen Garden Spa',
        branch: 'Park Street',
        city: 'Kolkata',
        address: '56, Park Street, Near Flurys',
        description: 'Peaceful spa environment with Japanese-inspired treatments and ambiance.',
        category: 'Wellness & Beauty',
        subCategory: 'Japanese Spa',
        tags: ['Japanese', 'Zen', 'Relaxation', 'Minimalist'],
        specialties: ['Shiatsu', 'Hot Stone', 'Aromatherapy', 'Foot Reflexology'],
        features: ['WiFi', 'AC', 'Parking', 'Zen Garden'],
        amenities: ['Tea Lounge', 'Reading Corner'],
        languages: ['English', 'Hindi', 'Bengali'],
        capacity: {
            numberOfRooms: 7,
            numberOfFloors: 2,
            totalArea: '3200 sq ft',
            parkingSpaces: 8
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200',
            banner: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/zengardenspakolkata',
            instagram: 'https://instagram.com/zengardenspakolkata',
            whatsapp: '+919876543215'
        },
        settings: {
            workingHours: {
                open: '10:00',
                close: '20:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 75,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.3,
            totalReviews: 112,
            fiveStars: 75,
            fourStars: 30,
            threeStars: 7,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Aroma Bliss Spa',
        branch: 'Koregaon Park',
        city: 'Pune',
        address: '234, Koregaon Park, Lane 5',
        description: 'Aromatherapy-focused spa using essential oils and natural ingredients.',
        category: 'Wellness & Beauty',
        subCategory: 'Aromatherapy Spa',
        tags: ['Aromatherapy', 'Essential Oils', 'Natural', 'Organic'],
        specialties: ['Aromatherapy Massage', 'Essential Oil Facial', 'Herbal Body Wrap', 'Steam Therapy'],
        features: ['WiFi', 'AC', 'Parking', 'Natural Products'],
        amenities: ['Essential Oil Shop', 'Consultation'],
        languages: ['English', 'Hindi', 'Marathi'],
        capacity: {
            numberOfRooms: 6,
            numberOfFloors: 1,
            totalArea: '2800 sq ft',
            parkingSpaces: 6
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: false,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200',
            banner: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/aromablisspune',
            instagram: 'https://instagram.com/aromablisspune',
            whatsapp: '+919876543216'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '20:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.4,
            totalReviews: 76,
            fiveStars: 50,
            fourStars: 22,
            threeStars: 4,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Golden Touch Spa',
        branch: 'C Scheme',
        city: 'Jaipur',
        address: '89, C Scheme, Near Central Park',
        description: 'Royal spa experience with traditional Rajasthani and international treatments.',
        category: 'Wellness & Beauty',
        subCategory: 'Royal Spa',
        tags: ['Royal', 'Traditional', 'Luxury', 'Heritage'],
        specialties: ['Royal Massage', 'Herbal Facial', 'Body Scrub', 'Hair Treatment'],
        features: ['WiFi', 'AC', 'Parking', 'Royal Ambiance'],
        amenities: ['Royal Lounge', 'Heritage Décor'],
        languages: ['English', 'Hindi', 'Rajasthani'],
        capacity: {
            numberOfRooms: 9,
            numberOfFloors: 2,
            totalArea: '3800 sq ft',
            parkingSpaces: 12
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=200',
            banner: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/goldentouchjaipur',
            instagram: 'https://instagram.com/goldentouchjaipur',
            whatsapp: '+919876543217'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '21:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.6,
            totalReviews: 134,
            fiveStars: 95,
            fourStars: 35,
            threeStars: 4,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Ocean Breeze Spa',
        branch: 'Vastrapur',
        city: 'Ahmedabad',
        address: '45, Vastrapur Lake Road',
        description: 'Coastal-themed spa with refreshing treatments and modern facilities.',
        category: 'Wellness & Beauty',
        subCategory: 'Modern Spa',
        tags: ['Modern', 'Coastal', 'Refreshing', 'Contemporary'],
        specialties: ['Deep Tissue', 'Hot Stone', 'Facial', 'Body Polish'],
        features: ['WiFi', 'AC', 'Parking', 'Lake View'],
        amenities: ['Café', 'Lake View Lounge'],
        languages: ['English', 'Hindi', 'Gujarati'],
        capacity: {
            numberOfRooms: 8,
            numberOfFloors: 2,
            totalArea: '3600 sq ft',
            parkingSpaces: 10
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200',
            banner: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/oceanbreezeahmedabad',
            instagram: 'https://instagram.com/oceanbreezeahmedabad',
            whatsapp: '+919876543218'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '20:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.5,
            totalReviews: 91,
            fiveStars: 65,
            fourStars: 23,
            threeStars: 3,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Divine Relaxation Spa',
        branch: 'Adajan',
        city: 'Surat',
        address: '12, Adajan Gam, Near Dumas Beach',
        description: 'Beachside spa offering relaxation treatments with ocean views.',
        category: 'Wellness & Beauty',
        subCategory: 'Beach Spa',
        tags: ['Beach', 'Relaxation', 'Scenic', 'Peaceful'],
        specialties: ['Swedish Massage', 'Aromatherapy', 'Facial', 'Body Wrap'],
        features: ['WiFi', 'AC', 'Parking', 'Beach Access'],
        amenities: ['Beach View', 'Outdoor Seating'],
        languages: ['English', 'Hindi', 'Gujarati'],
        capacity: {
            numberOfRooms: 7,
            numberOfFloors: 2,
            totalArea: '3400 sq ft',
            parkingSpaces: 9
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200',
            banner: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/divinerelaxationsurat',
            instagram: 'https://instagram.com/divinerelaxationsurat',
            whatsapp: '+919876543219'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '20:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.4,
            totalReviews: 68,
            fiveStars: 45,
            fourStars: 20,
            threeStars: 3,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Elite Wellness Spa',
        branch: 'Gomti Nagar',
        city: 'Lucknow',
        address: '78, Gomti Nagar, Sector 5',
        description: 'Premium wellness spa with modern amenities and expert therapists.',
        category: 'Wellness & Beauty',
        subCategory: 'Elite Spa',
        tags: ['Elite', 'Premium', 'Modern', 'Expert'],
        specialties: ['Deep Tissue', 'Sports Massage', 'Facial', 'Hair Spa'],
        features: ['WiFi', 'AC', 'Parking', 'VIP Rooms'],
        amenities: ['VIP Lounge', 'Premium Products'],
        languages: ['English', 'Hindi', 'Urdu'],
        capacity: {
            numberOfRooms: 10,
            numberOfFloors: 2,
            totalArea: '4200 sq ft',
            parkingSpaces: 14
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: true
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=200',
            banner: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/elitewellnesslucknow',
            instagram: 'https://instagram.com/elitewellnesslucknow',
            whatsapp: '+919876543220'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '21:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.5,
            totalReviews: 145,
            fiveStars: 100,
            fourStars: 40,
            threeStars: 5,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Nature\'s Touch Spa',
        branch: 'Civil Lines',
        city: 'Kanpur',
        address: '34, Civil Lines, Near Phool Bagh',
        description: 'Eco-friendly spa using natural and organic products for all treatments.',
        category: 'Wellness & Beauty',
        subCategory: 'Eco Spa',
        tags: ['Eco-Friendly', 'Organic', 'Natural', 'Sustainable'],
        specialties: ['Organic Facial', 'Natural Body Wrap', 'Herbal Massage', 'Green Therapy'],
        features: ['WiFi', 'AC', 'Parking', 'Eco Products'],
        amenities: ['Organic Shop', 'Garden Area'],
        languages: ['English', 'Hindi'],
        capacity: {
            numberOfRooms: 6,
            numberOfFloors: 1,
            totalArea: '3000 sq ft',
            parkingSpaces: 7
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: false,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200',
            banner: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/naturestouchkanpur',
            instagram: 'https://instagram.com/naturestouchkanpur',
            whatsapp: '+919876543221'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '20:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.3,
            totalReviews: 82,
            fiveStars: 55,
            fourStars: 24,
            threeStars: 3,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Pristine Spa & Wellness',
        branch: 'Sitabuldi',
        city: 'Nagpur',
        address: '56, Sitabuldi, Near Railway Station',
        description: 'Comprehensive wellness center offering spa, fitness, and nutrition services.',
        category: 'Wellness & Beauty',
        subCategory: 'Wellness Center',
        tags: ['Wellness', 'Fitness', 'Nutrition', 'Holistic'],
        specialties: ['Therapeutic Massage', 'Wellness Consultation', 'Nutrition Planning', 'Fitness Training'],
        features: ['WiFi', 'AC', 'Parking', 'Fitness Area'],
        amenities: ['Gym', 'Nutritionist', 'Wellness Café'],
        languages: ['English', 'Hindi', 'Marathi'],
        capacity: {
            numberOfRooms: 8,
            numberOfFloors: 3,
            totalArea: '5000 sq ft',
            parkingSpaces: 12
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200',
            banner: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/pristinespanagpur',
            instagram: 'https://instagram.com/pristinespanagpur',
            whatsapp: '+919876543222'
        },
        settings: {
            workingHours: {
                open: '08:00',
                close: '20:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.5,
            totalReviews: 119,
            fiveStars: 80,
            fourStars: 35,
            threeStars: 4,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'spa',
        name: 'Revive & Rejuvenate Spa',
        branch: 'Vijay Nagar',
        city: 'Indore',
        address: '23, Vijay Nagar, Near Palasia',
        description: 'Modern spa facility focused on anti-aging and rejuvenation treatments.',
        category: 'Wellness & Beauty',
        subCategory: 'Anti-Aging Spa',
        tags: ['Anti-Aging', 'Rejuvenation', 'Modern', 'Youthful'],
        specialties: ['Anti-Aging Facial', 'Collagen Therapy', 'Lifting Massage', 'Youth Revival'],
        features: ['WiFi', 'AC', 'Parking', 'Modern Equipment'],
        amenities: ['Consultation Room', 'Product Display'],
        languages: ['English', 'Hindi'],
        capacity: {
            numberOfRooms: 7,
            numberOfFloors: 2,
            totalArea: '3300 sq ft',
            parkingSpaces: 9
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200',
            banner: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/reviverejuvenateindore',
            instagram: 'https://instagram.com/reviverejuvenateindore',
            whatsapp: '+919876543223'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '20:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 15,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.4,
            totalReviews: 95,
            fiveStars: 65,
            fourStars: 27,
            threeStars: 3,
            twoStars: 0,
            oneStar: 0
        }
    },
    // ==================== HOTELS (4) ====================
    {
        type: 'hotel',
        name: 'Grand Palace Hotel',
        branch: 'Marine Drive',
        city: 'Mumbai',
        address: '123, Marine Drive, Near Gateway of India',
        description: 'Luxury 5-star hotel with ocean views, fine dining, and world-class amenities.',
        category: 'Hospitality',
        subCategory: 'Luxury Hotel',
        tags: ['Luxury', '5-Star', 'Ocean View', 'Fine Dining'],
        specialties: ['Wedding Venue', 'Business Meetings', 'Spa Services', 'Fine Dining'],
        features: ['WiFi', 'AC', 'Parking', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service'],
        amenities: ['Swimming Pool', 'Fitness Center', 'Business Center', 'Concierge', 'Valet Parking'],
        languages: ['English', 'Hindi', 'Marathi'],
        capacity: {
            numberOfRooms: 150,
            numberOfFloors: 12,
            totalArea: '50000 sq ft',
            parkingSpaces: 100,
            seatingCapacity: 500
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: true
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
            banner: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                'https://images.unsplash.com/photo-1551882547-ec40ba7bca36?w=800',
                'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/grandpalacemumbai',
            instagram: 'https://instagram.com/grandpalacemumbai',
            twitter: 'https://twitter.com/grandpalacemumbai',
            linkedin: 'https://linkedin.com/company/grandpalacemumbai',
            youtube: 'https://youtube.com/grandpalacemumbai',
            whatsapp: '+919876543224'
        },
        settings: {
            workingHours: {
                open: '00:00',
                close: '23:59',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 365,
                slotDuration: 60,
                bufferTime: 0,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.7,
            totalReviews: 456,
            fiveStars: 350,
            fourStars: 95,
            threeStars: 10,
            twoStars: 1,
            oneStar: 0
        }
    },
    {
        type: 'hotel',
        name: 'Royal Heritage Hotel',
        branch: 'Connaught Place',
        city: 'Delhi',
        address: '45, Connaught Place, Block A',
        description: 'Heritage hotel combining traditional architecture with modern luxury.',
        category: 'Hospitality',
        subCategory: 'Heritage Hotel',
        tags: ['Heritage', 'Luxury', 'Traditional', 'Cultural'],
        specialties: ['Heritage Tours', 'Cultural Events', 'Traditional Cuisine', 'Wedding Venue'],
        features: ['WiFi', 'AC', 'Parking', 'Pool', 'Gym', 'Restaurant', 'Heritage Tours'],
        amenities: ['Heritage Museum', 'Cultural Center', 'Traditional Restaurant', 'Garden'],
        languages: ['English', 'Hindi'],
        capacity: {
            numberOfRooms: 80,
            numberOfFloors: 5,
            totalArea: '30000 sq ft',
            parkingSpaces: 50,
            seatingCapacity: 200
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: true
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1551882547-ec40ba7bca36?w=200',
            banner: 'https://images.unsplash.com/photo-1551882547-ec40ba7bca36?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1551882547-ec40ba7bca36?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1551882547-ec40ba7bca36?w=800',
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/royalheritagedelhi',
            instagram: 'https://instagram.com/royalheritagedelhi',
            whatsapp: '+919876543225'
        },
        settings: {
            workingHours: {
                open: '00:00',
                close: '23:59',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 365,
                slotDuration: 60,
                bufferTime: 0,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.6,
            totalReviews: 312,
            fiveStars: 240,
            fourStars: 65,
            threeStars: 7,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'hotel',
        name: 'Garden View Resort',
        branch: 'Whitefield',
        city: 'Bangalore',
        address: '78, Whitefield Main Road, Near IT Park',
        description: 'Serene resort hotel with garden views, perfect for business and leisure travelers.',
        category: 'Hospitality',
        subCategory: 'Resort Hotel',
        tags: ['Resort', 'Garden', 'Business', 'Leisure'],
        specialties: ['Business Meetings', 'Garden Events', 'Corporate Packages', 'Family Getaways'],
        features: ['WiFi', 'AC', 'Parking', 'Pool', 'Gym', 'Garden', 'Restaurant'],
        amenities: ['Garden Area', 'Conference Hall', 'Playground', 'Gym'],
        languages: ['English', 'Hindi', 'Kannada'],
        capacity: {
            numberOfRooms: 120,
            numberOfFloors: 4,
            totalArea: '40000 sq ft',
            parkingSpaces: 80,
            seatingCapacity: 300
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: true
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200',
            banner: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/gardenviewbangalore',
            instagram: 'https://instagram.com/gardenviewbangalore',
            whatsapp: '+919876543226'
        },
        settings: {
            workingHours: {
                open: '00:00',
                close: '23:59',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 365,
                slotDuration: 60,
                bufferTime: 0,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.5,
            totalReviews: 278,
            fiveStars: 200,
            fourStars: 70,
            threeStars: 8,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'hotel',
        name: 'Coastal Breeze Hotel',
        branch: 'Banjara Hills',
        city: 'Hyderabad',
        address: 'Sector 2, Banjara Hills, Near Cyber Towers',
        description: 'Modern business hotel with excellent connectivity and corporate facilities.',
        category: 'Hospitality',
        subCategory: 'Business Hotel',
        tags: ['Business', 'Modern', 'Corporate', 'Tech-Friendly'],
        specialties: ['Corporate Events', 'Business Meetings', 'Conference Facilities', 'Tech Support'],
        features: ['WiFi', 'AC', 'Parking', 'Business Center', 'Gym', 'Restaurant'],
        amenities: ['Conference Rooms', 'Business Center', 'High-Speed Internet', 'Printing Services'],
        languages: ['English', 'Hindi', 'Telugu'],
        capacity: {
            numberOfRooms: 100,
            numberOfFloors: 8,
            totalArea: '35000 sq ft',
            parkingSpaces: 60,
            seatingCapacity: 250
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: true
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
            banner: 'https://images.unsplash.com/photo-1551882547-ec40ba7bca36?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1551882547-ec40ba7bca36?w=800',
                'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/coastalbreezehyderabad',
            instagram: 'https://instagram.com/coastalbreezehyderabad',
            whatsapp: '+919876543227'
        },
        settings: {
            workingHours: {
                open: '00:00',
                close: '23:59',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 365,
                slotDuration: 60,
                bufferTime: 0,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.4,
            totalReviews: 189,
            fiveStars: 130,
            fourStars: 55,
            threeStars: 4,
            twoStars: 0,
            oneStar: 0
        }
    },
    // ==================== SALONS (2) ====================
    {
        type: 'salon',
        name: 'Elite Hair Studio',
        branch: 'Andheri West',
        city: 'Mumbai',
        address: '123, Andheri West, Near Versova Beach',
        description: 'Premium hair salon offering cutting-edge hairstyles, coloring, and grooming services.',
        category: 'Beauty & Grooming',
        subCategory: 'Hair Salon',
        tags: ['Hair', 'Styling', 'Coloring', 'Premium'],
        specialties: ['Hair Cutting', 'Hair Coloring', 'Hair Styling', 'Hair Treatment', 'Bridal Makeup'],
        features: ['WiFi', 'AC', 'Parking', 'Modern Equipment'],
        amenities: ['Waiting Area', 'Product Display', 'Consultation Room'],
        languages: ['English', 'Hindi', 'Marathi'],
        capacity: {
            numberOfRooms: 12,
            numberOfFloors: 1,
            totalArea: '2500 sq ft',
            parkingSpaces: 8,
            seatingCapacity: 20
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200',
            banner: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
                'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/elitehairstudiomumbai',
            instagram: 'https://instagram.com/elitehairstudiomumbai',
            whatsapp: '+919876543228'
        },
        settings: {
            workingHours: {
                open: '10:00',
                close: '20:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 60,
                bufferTime: 10,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.6,
            totalReviews: 234,
            fiveStars: 180,
            fourStars: 50,
            threeStars: 4,
            twoStars: 0,
            oneStar: 0
        }
    },
    {
        type: 'salon',
        name: 'Glamour Beauty Salon',
        branch: 'Rajouri Garden',
        city: 'Delhi',
        address: '45, Rajouri Garden, Main Market',
        description: 'Complete beauty salon offering hair, makeup, nail, and skincare services.',
        category: 'Beauty & Grooming',
        subCategory: 'Full Service Salon',
        tags: ['Beauty', 'Makeup', 'Hair', 'Nails', 'Skincare'],
        specialties: ['Hair Services', 'Bridal Makeup', 'Nail Art', 'Facial', 'Waxing', 'Threading'],
        features: ['WiFi', 'AC', 'Parking', 'Private Rooms'],
        amenities: ['Bridal Room', 'Product Counter', 'Waiting Lounge'],
        languages: ['English', 'Hindi'],
        capacity: {
            numberOfRooms: 15,
            numberOfFloors: 2,
            totalArea: '3000 sq ft',
            parkingSpaces: 10,
            seatingCapacity: 25
        },
        paymentMethods: {
            cash: true,
            card: true,
            upi: true,
            wallet: true,
            netBanking: false
        },
        images: {
            logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200',
            banner: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
            thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
            gallery: [
                'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'
            ]
        },
        socialMedia: {
            facebook: 'https://facebook.com/glamourbeautydelhi',
            instagram: 'https://instagram.com/glamourbeautydelhi',
            whatsapp: '+919876543229'
        },
        settings: {
            workingHours: {
                open: '09:00',
                close: '21:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            appointmentSettings: {
                advanceBookingDays: 30,
                slotDuration: 45,
                bufferTime: 10,
                allowOnlineBooking: true
            }
        },
        ratings: {
            average: 4.5,
            totalReviews: 198,
            fiveStars: 145,
            fourStars: 48,
            threeStars: 5,
            twoStars: 0,
            oneStar: 0
        }
    }
];

async function createBusinesses() {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        // Get admin ID
        const admin = await Admin.findOne({ email: 'dinesh@dishonlinesolution.com' });
        if (!admin) {
            console.error('❌ Admin not found. Please create admin first using createAdmin.js');
            process.exit(1);
        }

        console.log(`👤 Found Admin: ${admin.companyName} (${admin.name})\n`);
        console.log(`📦 Creating ${businessesData.length} businesses...\n`);

        let created = 0;
        let skipped = 0;

        for (let i = 0; i < businessesData.length; i++) {
            const businessData = businessesData[i];
            const cityInfo = indianCities[businessData.city];
            
            if (!cityInfo) {
                console.log(`⚠️  Skipping ${businessData.name} - City info not found`);
                skipped++;
                continue;
            }

            try {
                // Check if business already exists
                const existing = await Business.findOne({
                    name: businessData.name,
                    branch: businessData.branch,
                    city: businessData.city
                });

                if (existing) {
                    console.log(`⏭️  Skipped: ${businessData.name} - ${businessData.branch} (already exists)`);
                    skipped++;
                    continue;
                }

                // Generate additional data
                const phone = generatePhone();
                const stateCode = stateCodes[cityInfo.state] || '27';
                const gstNumber = generateGST(stateCode);
                const panNumber = generatePAN();
                const ifscCode = generateIFSC();
                const accountNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
                const email = `${businessData.name.toLowerCase().replace(/\s+/g, '')}@dishonlinesolution.com`;
                const website = `https://www.${businessData.name.toLowerCase().replace(/\s+/g, '')}.com`;
                const googleMapsUrl = `https://www.google.com/maps?q=${cityInfo.coords[0]},${cityInfo.coords[1]}`;

                // Prepare complete business object
                const business = {
                    admin: admin._id,
                    type: businessData.type,
                    name: businessData.name,
                    branch: businessData.branch,
                    address: businessData.address,
                    city: businessData.city,
                    state: cityInfo.state,
                    country: 'India',
                    zipCode: cityInfo.zipCode,
                    phone: phone,
                    alternatePhone: generatePhone(),
                    email: email,
                    website: website,
                    description: businessData.description,
                    googleMapsUrl: googleMapsUrl,
                    isActive: true,
                    
                    // Images
                    images: businessData.images,
                    
                    // Social Media
                    socialMedia: businessData.socialMedia || {},
                    
                    // Registration & Legal
                    registration: {
                        gstNumber: gstNumber,
                        panNumber: panNumber,
                        registrationNumber: `REG${Math.floor(Math.random() * 1000000)}`,
                        licenseNumber: `LIC${Math.floor(Math.random() * 100000)}`,
                        taxId: `TAX${Math.floor(Math.random() * 100000)}`,
                        registrationDate: new Date(2020, 0, 1),
                        expiryDate: new Date(2030, 11, 31)
                    },
                    
                    // Category & Tags
                    category: businessData.category,
                    subCategory: businessData.subCategory,
                    tags: businessData.tags,
                    specialties: businessData.specialties,
                    
                    // Payment Methods
                    paymentMethods: businessData.paymentMethods,
                    
                    // Bank Details
                    bankDetails: {
                        accountName: `${businessData.name} ${businessData.branch}`,
                        accountNumber: accountNumber,
                        bankName: 'HDFC Bank',
                        ifscCode: ifscCode,
                        branch: `${businessData.city} Branch`,
                        upiId: `${businessData.name.toLowerCase().replace(/\s+/g, '')}@paytm`,
                        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${businessData.name}`
                    },
                    
                    // Capacity
                    capacity: businessData.capacity,
                    
                    // Ratings
                    ratings: businessData.ratings,
                    
                    // Features & Amenities
                    features: businessData.features,
                    amenities: businessData.amenities,
                    
                    // Languages
                    languages: businessData.languages,
                    
                    // SEO
                    seo: {
                        metaTitle: `${businessData.name} - ${businessData.branch} | ${businessData.type.charAt(0).toUpperCase() + businessData.type.slice(1)} Services`,
                        metaDescription: businessData.description,
                        keywords: [...businessData.tags, businessData.city, businessData.type],
                        ogImage: businessData.images.banner
                    },
                    
                    // Subscription
                    subscription: {
                        plan: 'premium',
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                        isActive: true,
                        features: ['online_booking', 'analytics', 'campaigns', 'loyalty_program']
                    },
                    
                    // Statistics
                    stats: {
                        totalCustomers: Math.floor(Math.random() * 500) + 50,
                        totalAppointments: Math.floor(Math.random() * 1000) + 100,
                        totalRevenue: Math.floor(Math.random() * 5000000) + 500000,
                        totalOrders: Math.floor(Math.random() * 2000) + 200,
                        averageRating: businessData.ratings.average
                    },
                    
                    // Notification Preferences
                    notifications: {
                        emailNotifications: true,
                        smsNotifications: true,
                        whatsappNotifications: true,
                        pushNotifications: true
                    },
                    
                    // Custom Fields
                    customFields: [
                        { key: 'established', value: '2020', type: 'text' },
                        { key: 'certifications', value: ['ISO Certified', 'Quality Assured'], type: 'array' }
                    ],
                    
                    // Holidays
                    holidays: [
                        { name: 'Diwali', date: new Date(2024, 10, 1) },
                        { name: 'Holi', date: new Date(2024, 2, 25) }
                    ],
                    
                    // Settings
                    settings: businessData.settings
                };

                // Create business
                const createdBusiness = await Business.create(business);
                created++;
                
                console.log(`✅ [${i + 1}/${businessesData.length}] Created: ${businessData.name} - ${businessData.branch} (${businessData.city})`);
                console.log(`   Type: ${businessData.type} | Link: ${createdBusiness.businessLink}\n`);

            } catch (error) {
                console.error(`❌ Error creating ${businessData.name}:`, error.message);
                skipped++;
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Summary:');
        console.log(`   ✅ Created: ${created}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   📦 Total: ${businessesData.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Close database connection
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
createBusinesses();

