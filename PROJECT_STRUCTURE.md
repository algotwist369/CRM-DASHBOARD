# 🏗️ CRM DASHBOARD - CLEAR PROJECT STRUCTURE

## 📁 **FOLDER STRUCTURE**

```
server/
├── app.js                          # Main app configuration
├── server.js                       # Server startup
├── package.json                    # Dependencies
│
├── config/                         # Configuration files
│   ├── db.js                      # Database connection
│   ├── jwt.js                     # JWT configuration
│   └── mail.js                    # Email configuration
│
├── middleware/                     # Custom middleware
│   ├── authMiddleware.js          # Authentication middleware
│   ├── roleMiddleware.js          # Role-based access control
│   └── errorHandler.js            # Global error handler
│
├── models/                         # Database models
│   ├── Admin.js                   # Admin model
│   ├── Business.js                # Business model (Salon/Spa/Hotel)
│   ├── Manager.js                 # Manager model
│   ├── Staff.js                   # Staff model
│   ├── DailyBusiness.js           # Daily business records
│   ├── Transaction.js             # Individual transactions
│   └── OTP.js                     # OTP model
│
├── controllers/                    # Business logic controllers
│   ├── authController.js          # Authentication (register, login, OTP)
│   ├── adminController.js         # Admin dashboard operations
│   ├── businessController.js      # Business management (CRUD)
│   ├── managerController.js       # Manager operations
│   ├── staffController.js         # Staff management (CRUD)
│   ├── dailyBusinessController.js # Daily business operations
│   └── reportController.js        # Reports and analytics
│
├── routes/                         # API routes
│   ├── authRoutes.js              # Authentication routes
│   ├── adminRoutes.js             # Admin-only routes
│   ├── businessRoutes.js          # Business management routes
│   ├── managerRoutes.js           # Manager routes
│   ├── staffRoutes.js             # Staff management routes
│   ├── dailyBusinessRoutes.js     # Daily business routes
│   └── reportRoutes.js            # Report routes
│
└── utils/                          # Reusable utility functions
    ├── cache.js                   # Redis caching
    ├── generateToken.js           # JWT token generation
    ├── hashPassword.js            # Password hashing
    ├── sendMail.js                # Email sending
    ├── sendOTP.js                 # OTP generation & sending
    ├── sendSMS.js                 # SMS sending
    ├── validators.js              # Input validation
    ├── reportExport.js            # Report export utilities
    └── businessUtils.js           # Business-specific utilities
```

## 🔄 **CLEAR SEPARATION OF CONCERNS**

### **1. AUTHENTICATION FLOW**
- **Admin Registration**: Company details → Dashboard access
- **Manager Login**: Username + PIN → Business dashboard
- **OTP System**: Email/SMS verification

### **2. ADMIN DASHBOARD**
- View all businesses (Salons, Spas, Hotels)
- Add new business with type selection
- Create managers for each business
- Generate business links: `base_url/companyname_id`

### **3. MANAGER DASHBOARD**
- Staff management (CRUD operations)
- Daily business entry
- Transaction tracking
- Business analytics

### **4. BUSINESS TYPES**
- **Salon**: Hair cuts, styling, treatments
- **Spa**: Massages, facials, wellness
- **Hotel**: Room bookings, services, amenities

## 🚀 **API ENDPOINTS STRUCTURE**

```
/api/auth/                          # Authentication
├── POST /register                  # Admin registration
├── POST /login                     # Admin/Manager login
├── POST /otp/send                  # Send OTP
├── POST /otp/verify                # Verify OTP
├── POST /refresh                   # Refresh token
└── POST /logout                    # Logout

/api/admin/                         # Admin operations
├── GET /dashboard                  # Admin dashboard data
├── GET /businesses                 # List all businesses
├── POST /business                  # Create new business
├── PUT /business/:id               # Update business
├── DELETE /business/:id            # Delete business
├── POST /manager                   # Create manager
└── GET /business/:id/link          # Generate business link

/api/business/                      # Business management
├── GET /:id                        # Get business details
├── GET /:id/staff                  # Get business staff
├── GET /:id/daily-business         # Get daily business records
└── GET /:id/analytics              # Business analytics

/api/manager/                       # Manager operations
├── GET /dashboard                  # Manager dashboard
├── GET /staff                      # List staff
├── POST /staff                     # Add staff
├── PUT /staff/:id                  # Update staff
├── DELETE /staff/:id               # Remove staff
├── POST /daily-business            # Add daily business
├── GET /daily-business             # Get daily records
└── GET /analytics                  # Business analytics

/api/staff/                         # Staff management
├── GET /                           # List all staff
├── POST /                          # Create staff
├── PUT /:id                        # Update staff
└── DELETE /:id                     # Delete staff

/api/daily-business/                # Daily business operations
├── POST /                          # Add daily business record
├── GET /                           # Get daily records
├── PUT /:id                        # Update record
└── DELETE /:id                     # Delete record

/api/reports/                       # Reports and analytics
├── GET /business/:id/summary       # Business summary
├── GET /business/:id/export        # Export business data
└── GET /analytics/dashboard        # Overall analytics
```

## 🎯 **KEY FEATURES TO IMPLEMENT**

### **Admin Features:**
1. Company registration and dashboard
2. Multi-business management (Salon/Spa/Hotel)
3. Manager creation and management
4. Business link generation
5. Overall analytics and reports

### **Manager Features:**
1. Staff management (CRUD)
2. Daily business entry
3. Transaction tracking
4. Business-specific analytics
5. Customer management

### **Additional Features:**
1. **Customer Management**: Customer profiles, history
2. **Appointment System**: Booking management
3. **Inventory Management**: Product/service tracking
4. **Payment Integration**: Multiple payment methods
5. **Notification System**: Email/SMS alerts
6. **Multi-language Support**: Localization
7. **Mobile App API**: Mobile application support
8. **Advanced Analytics**: Charts, graphs, insights
9. **Backup & Export**: Data backup and export
10. **Role-based Permissions**: Granular access control
