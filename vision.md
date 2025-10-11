# 🏢 CRM Dashboard - Business Management System

## 📋 **Project Overview**

This is a comprehensive **Customer Relationship Management (CRM) Dashboard** designed specifically for **salons, spas, and hotels**. It's a complete business management system that helps business owners manage their operations, staff, customers, and marketing campaigns all in one place.

---

## 🎯 **What This System Does**

### **For Business Owners (Admins)**
- **Register and manage multiple businesses** (salons, spas, hotels)
- **Create and manage business managers** for each location
- **Monitor overall business performance** across all locations
- **Generate business links** for customer booking

### **For Business Managers**
- **Manage staff members** (add, edit, remove staff)
- **Record daily business transactions** and track revenue
- **Handle customer appointments** and bookings
- **Send targeted marketing campaigns** to customers
- **Monitor customer analytics** and insights

### **For Staff Members**
- **View their profile** and work schedule
- **Access business information** and customer details
- **Track their performance** and earnings

### **For Customers**
- **Book appointments online** 24/7
- **View business information** and available services
- **Receive confirmation codes** and booking details
- **Cancel or reschedule** appointments

---

## 🏗️ **System Architecture**

### **Backend Structure**
```
server/
├── models/           # Database schemas
├── controllers/      # Business logic
├── routes/          # API endpoints
├── middleware/      # Authentication & validation
├── utils/           # Helper functions
└── app.js          # Main application file
```

### **Key Components**

#### **1. Authentication System**
- **Admin Registration/Login** with company details
- **Manager Creation** by admins with unique credentials
- **Staff Management** with role-based access
- **JWT Token Authentication** for secure access
- **OTP Verification** for enhanced security

#### **2. Business Management**
- **Multi-business support** (salon, spa, hotel)
- **Branch management** with location details
- **Business settings** (working hours, currency, timezone)
- **Appointment configuration** (booking rules, cancellation policies)

#### **3. Customer Management**
- **Customer profiles** with detailed information
- **Customer segmentation** (new, returning, loyal, inactive)
- **Customer analytics** and insights
- **Loyalty points system**
- **Customer communication preferences**

#### **4. Appointment System**
- **Online booking** with real-time availability
- **Time slot management** with conflict prevention
- **Service selection** with pricing
- **Confirmation system** with unique codes
- **Cancellation and rescheduling**

#### **5. Staff Management**
- **Staff profiles** with roles and specializations
- **Performance tracking** and analytics
- **Working hours** and schedule management
- **Commission tracking**

#### **6. Transaction Recording**
- **Daily business records** with detailed metrics
- **Service tracking** and pricing
- **Expense management**
- **Revenue analytics**

#### **7. Marketing & Notifications**
- **Targeted campaigns** based on customer segments
- **Multi-channel notifications** (SMS, Email, WhatsApp)
- **Campaign analytics** and performance tracking
- **Customer insights** and recommendations

---

## 🚀 **Key Features**

### **📱 Customer Booking Experience**
1. **Customer visits business link** (e.g., `beautypalace_64f8a1b2c3d4e5f6a7b8c9d0`)
2. **Views business info** and available services
3. **Selects date and time** from available slots
4. **Books appointment** with customer details
5. **Receives confirmation** with unique code
6. **Can cancel/reschedule** if needed

### **👨‍💼 Manager Dashboard**
- **Real-time business metrics**
- **Staff management** and performance tracking
- **Customer analytics** and segmentation
- **Appointment management**
- **Marketing campaign creation**
- **Daily business recording**

### **📊 Analytics & Insights**
- **Customer segmentation** (new, returning, loyal, inactive)
- **Revenue tracking** and trends
- **Staff performance** metrics
- **Appointment analytics**
- **Marketing campaign results**
- **Business growth insights**

### **🎯 Marketing Automation**
- **Targeted campaigns** based on customer behavior
- **Automated notifications** for appointments
- **Special offers** and promotions
- **Customer retention** strategies
- **Win-back campaigns** for inactive customers

---

## 🛠️ **Technology Stack**

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - Database modeling
- **JWT** - Authentication
- **Node-cache** - Caching system

### **Key Libraries**
- **bcryptjs** - Password hashing
- **nodemailer** - Email sending
- **twilio** - SMS notifications
- **helmet** - Security headers
- **cors** - Cross-origin requests
- **morgan** - Request logging

---

## 📁 **Database Models**

### **Core Models**
1. **Admin** - Business owners
2. **Business** - Business information and settings
3. **Manager** - Business managers
4. **Staff** - Staff members
5. **Customer** - Customer profiles and preferences
6. **Appointment** - Booking records
7. **Transaction** - Business transactions
8. **DailyBusiness** - Daily business records
9. **Notification** - Marketing messages
10. **Campaign** - Marketing campaigns
11. **OTP** - One-time passwords

---

## 🔗 **API Endpoints**

### **Authentication**
- `POST /api/auth/admin/register` - Admin registration
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/manager/login` - Manager login
- `POST /api/auth/staff/login` - Staff login

### **Business Management**
- `GET /api/admin/dashboard` - Admin dashboard
- `POST /api/admin/business` - Create business
- `GET /api/admin/businesses` - Get all businesses
- `POST /api/admin/manager` - Create manager

### **Appointment Booking (Public)**
- `GET /api/appointments/business/{link}` - Get business info
- `GET /api/appointments/business/{link}/slots` - Get available slots
- `POST /api/appointments/business/{link}/book` - Book appointment
- `GET /api/appointments/confirmation/{code}` - Get appointment details
- `POST /api/appointments/confirmation/{code}/cancel` - Cancel appointment

### **Manager Operations**
- `GET /api/manager/dashboard` - Manager dashboard
- `GET /api/manager/staff` - Get staff members
- `POST /api/manager/staff` - Add staff member
- `GET /api/manager/transactions` - Get transactions
- `POST /api/manager/transaction` - Add transaction
- `GET /api/appointments` - Get appointments
- `PUT /api/appointments/{id}/status` - Update appointment status

### **Customer Management**
- `GET /api/customers` - Get customers
- `GET /api/customers/{id}` - Get customer details
- `GET /api/customers/analytics` - Customer analytics
- `GET /api/customers/segments` - Customer segments

### **Marketing & Notifications**
- `POST /api/notifications` - Create notification
- `POST /api/notifications/{id}/send` - Send notification
- `GET /api/notifications` - Get notifications
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - Get campaigns

---

## 🎨 **User Experience Flow**

### **Admin Journey**
1. **Register** with company details
2. **Login** to admin dashboard
3. **Create businesses** (salon, spa, hotel)
4. **Add managers** for each business
5. **Monitor performance** across all locations

### **Manager Journey**
1. **Login** with manager credentials
2. **View dashboard** with business metrics
3. **Add staff members** and manage schedules
4. **Record daily business** and transactions
5. **Manage appointments** and customer bookings
6. **Create marketing campaigns** for customers

### **Customer Journey**
1. **Visit business link** shared by manager
2. **Browse services** and available times
3. **Book appointment** with personal details
4. **Receive confirmation** via SMS/Email
5. **Visit business** for service
6. **Receive follow-up** notifications

---

## 📈 **Business Benefits**

### **For Business Owners**
- **Centralized management** of multiple locations
- **Real-time insights** into business performance
- **Automated customer communication**
- **Staff performance tracking**
- **Revenue optimization**

### **For Managers**
- **Streamlined operations** management
- **Customer relationship** building
- **Marketing automation** tools
- **Performance analytics**
- **Staff coordination**

### **For Customers**
- **24/7 online booking** convenience
- **Transparent pricing** and availability
- **Personalized offers** and promotions
- **Easy appointment management**
- **Better service experience**

---

## 🔒 **Security Features**

- **JWT Authentication** for secure access
- **Role-based access control** (Admin, Manager, Staff)
- **Password hashing** with bcrypt
- **OTP verification** for sensitive operations
- **Input validation** and sanitization
- **Rate limiting** for API endpoints
- **CORS protection** for cross-origin requests

---

## 📊 **Analytics & Reporting**

### **Business Analytics**
- **Revenue tracking** and trends
- **Customer acquisition** and retention
- **Staff performance** metrics
- **Service popularity** analysis
- **Peak hours** identification

### **Customer Analytics**
- **Customer segmentation** (new, returning, loyal, inactive)
- **Spending patterns** and preferences
- **Loyalty program** tracking
- **Customer lifetime value** calculation
- **Retention rate** analysis

### **Marketing Analytics**
- **Campaign performance** metrics
- **Open rates** and click-through rates
- **Conversion tracking**
- **ROI calculation**
- **Customer engagement** analysis

---

## 🚀 **Future Enhancements**

### **Planned Features**
- **Mobile app** for customers and staff
- **Payment integration** (Razorpay, Stripe)
- **Inventory management** for products
- **Advanced reporting** with charts and graphs
- **WhatsApp Business API** integration
- **AI-powered recommendations**
- **Multi-language support**
- **Advanced scheduling** algorithms

### **Integration Possibilities**
- **Accounting software** (Tally, QuickBooks)
- **POS systems** integration
- **Social media** marketing tools
- **Email marketing** platforms
- **Analytics tools** (Google Analytics)
- **CRM integrations** (Salesforce, HubSpot)

---

## 🎯 **Target Market**

### **Primary Users**
- **Salon owners** and managers
- **Spa business** operators
- **Hotel management** teams
- **Beauty service** providers
- **Wellness centers**

### **Business Sizes**
- **Small businesses** (1-5 staff)
- **Medium businesses** (5-20 staff)
- **Multi-location** businesses
- **Franchise operations**

---

## 💡 **Why This System?**

### **Problems It Solves**
- **Manual appointment booking** inefficiencies
- **Customer data** scattered across systems
- **Staff management** challenges
- **Marketing campaign** complexity
- **Business analytics** lack
- **Customer retention** issues

### **Solutions Provided**
- **Automated booking** system
- **Centralized customer** database
- **Streamlined staff** management
- **Targeted marketing** campaigns
- **Comprehensive analytics**
- **Customer loyalty** programs

---

## 🏆 **Success Metrics**

### **Business Metrics**
- **Increased booking** conversion rates
- **Reduced no-show** rates
- **Higher customer** retention
- **Improved staff** productivity
- **Better revenue** tracking

### **Customer Metrics**
- **Faster booking** process
- **Better service** experience
- **Personalized offers**
- **Convenient scheduling**
- **Transparent communication**

---

## 📞 **Support & Maintenance**

### **Technical Support**
- **API documentation** for developers
- **Postman collection** for testing
- **Error handling** and logging
- **Performance monitoring**
- **Security updates**

### **Business Support**
- **User training** materials
- **Best practices** guides
- **Feature tutorials**
- **Troubleshooting** guides
- **Regular updates**

---

## 🎉 **Conclusion**

This CRM Dashboard is a **complete business management solution** that transforms how salons, spas, and hotels operate. It provides:

- **Seamless customer experience** with online booking
- **Efficient staff management** and performance tracking
- **Data-driven insights** for business growth
- **Automated marketing** for customer retention
- **Scalable architecture** for business expansion

The system is designed to **grow with your business**, from a single location to multiple branches, providing the tools and insights needed to succeed in today's competitive market.

---

*Built with ❤️ for the beauty and wellness industry*
