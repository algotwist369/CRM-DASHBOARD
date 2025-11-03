# 🔐 Complete Admin Routes Reference

## 📋 Overview
This document lists **ALL API routes** accessible by the **Admin** role in the CRM system.

**Base URL:** `http://localhost:5000/api`

**Authentication Required:**
```
Headers:
Authorization: Bearer <admin_jwt_token>
```

---

## 📊 **1. ADMIN DASHBOARD** (`/api/admin`)

### Admin-Only Routes (Admin Access Only)

#### Dashboard & Statistics
```http
GET /api/admin/dashboard
```
**Description:** Get complete admin dashboard with business stats, revenue, customers, managers, etc.

---

#### Admin Notifications
```http
GET    /api/admin/notifications
GET    /api/admin/notifications/unread-count
GET    /api/admin/notifications/recent
PUT    /api/admin/notifications/:id/read
PUT    /api/admin/notifications/read-all
DELETE /api/admin/notifications/:id
```
**Description:** Manage admin-specific notifications (business creation, manager activities, etc.)

---

#### Business Management
```http
POST   /api/admin/business
GET    /api/admin/businesses
GET    /api/admin/business/:businessId/link
GET    /api/admin/:id
PUT    /api/admin/business/:id
DELETE /api/admin/business/:id
```

**Endpoints:**
- **POST /business** - Create new business
- **GET /businesses** - Get all businesses (with filters, pagination)
- **GET /business/:businessId/link** - Get business link
- **GET /:id** - Get business details by ID
- **PUT /business/:id** - Update business
- **DELETE /business/:id** - Delete business (soft delete)

---

#### Manager Management
```http
POST   /api/admin/manager
GET    /api/admin/managers
GET    /api/admin/manager/:id
PUT    /api/admin/manager/:id
DELETE /api/admin/manager/:id
```

**Endpoints:**
- **POST /manager** - Create new manager
- **GET /managers** - Get all managers (with filters, pagination)
- **GET /manager/:id** - Get manager details
- **PUT /manager/:id** - Update manager
- **DELETE /manager/:id** - Delete manager

---

## 🏢 **2. BUSINESS ROUTES** (`/api/business`)

### Public Routes (No Authentication)
```http
GET /api/business/public/list
GET /api/business/public/nearby
GET /api/business/info/:businessLink
```

### Protected Routes (Admin + Manager)
```http
GET /api/business/:id
PUT /api/business/:id
GET /api/business/:id/staff
GET /api/business/:id/daily-business
GET /api/business/:id/analytics
```

**Admin Can:**
- View any of their business details
- Update any of their businesses
- View business staff
- View daily business records
- View business analytics

---

## 👥 **3. CUSTOMER MANAGEMENT** (`/api/customers`)

### All Routes (Admin + Manager Access)
```http
POST   /api/customers/
GET    /api/customers/
GET    /api/customers/stats
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
POST   /api/customers/:id/loyalty/add
POST   /api/customers/:id/loyalty/redeem
```

**Endpoints:**
- **POST /** - Create new customer
- **GET /** - Get customers (with filtering & pagination)
- **GET /stats** - Get customer statistics
- **GET /:id** - Get customer details
- **PUT /:id** - Update customer
- **DELETE /:id** - Delete customer (soft delete)
- **POST /:id/loyalty/add** - Add loyalty points
- **POST /:id/loyalty/redeem** - Redeem loyalty points

---

## 🛍️ **4. SERVICES/PRODUCTS** (`/api/services`)

### All Routes (Admin + Manager Access)
```http
POST   /api/services/
GET    /api/services/
GET    /api/services/popular
GET    /api/services/featured
GET    /api/services/categories
GET    /api/services/:id
PUT    /api/services/:id
DELETE /api/services/:id
POST   /api/services/:id/inventory
```

**Endpoints:**
- **POST /** - Create new service/product
- **GET /** - Get services (with filtering)
- **GET /popular** - Get popular services
- **GET /featured** - Get featured services
- **GET /categories** - Get service categories
- **GET /:id** - Get service details
- **PUT /:id** - Update service
- **DELETE /:id** - Delete service (soft delete)
- **POST /:id/inventory** - Update inventory

---

## 📅 **5. APPOINTMENTS** (`/api/appointments`)

### All Routes (Admin + Manager Access)
```http
POST   /api/appointments/
GET    /api/appointments/
GET    /api/appointments/stats
GET    /api/appointments/:id
PUT    /api/appointments/:id
POST   /api/appointments/:id/confirm
POST   /api/appointments/:id/start
POST   /api/appointments/:id/complete
POST   /api/appointments/:id/cancel
POST   /api/appointments/:id/reschedule
POST   /api/appointments/:id/no-show
POST   /api/appointments/:id/review
```

**Endpoints:**
- **POST /** - Create appointment
- **GET /** - Get appointments (with filtering)
- **GET /stats** - Get appointment statistics
- **GET /:id** - Get appointment details
- **PUT /:id** - Update appointment
- **POST /:id/confirm** - Confirm appointment
- **POST /:id/start** - Start appointment (check-in)
- **POST /:id/complete** - Complete appointment
- **POST /:id/cancel** - Cancel appointment
- **POST /:id/reschedule** - Reschedule appointment
- **POST /:id/no-show** - Mark as no-show
- **POST /:id/review** - Add review

---

## 💰 **6. INVOICES & PAYMENTS** (`/api/invoices`)

### All Routes (Admin + Manager Access)
```http
POST   /api/invoices/
GET    /api/invoices/
GET    /api/invoices/stats
GET    /api/invoices/overdue
GET    /api/invoices/:id
PUT    /api/invoices/:id
POST   /api/invoices/:id/cancel
POST   /api/invoices/:id/payment
POST   /api/invoices/:id/refund
```

**Endpoints:**
- **POST /** - Create invoice
- **GET /** - Get invoices (with filtering)
- **GET /stats** - Get invoice statistics
- **GET /overdue** - Get overdue invoices
- **GET /:id** - Get invoice details
- **PUT /:id** - Update invoice
- **POST /:id/cancel** - Cancel invoice
- **POST /:id/payment** - Add payment
- **POST /:id/refund** - Add refund

---

## ⭐ **7. REVIEWS & RATINGS** (`/api/reviews`)

### All Routes (Admin + Manager Access)
```http
POST   /api/reviews/
GET    /api/reviews/
GET    /api/reviews/stats
GET    /api/reviews/featured
GET    /api/reviews/:id
PUT    /api/reviews/:id
DELETE /api/reviews/:id
POST   /api/reviews/:id/approve
POST   /api/reviews/:id/reject
POST   /api/reviews/:id/flag
POST   /api/reviews/:id/response
POST   /api/reviews/:id/helpful
```

**Endpoints:**
- **POST /** - Create review
- **GET /** - Get reviews (with filtering)
- **GET /stats** - Get review statistics
- **GET /featured** - Get featured reviews
- **GET /:id** - Get review details
- **PUT /:id** - Update review
- **DELETE /:id** - Delete review
- **POST /:id/approve** - Approve review
- **POST /:id/reject** - Reject review
- **POST /:id/flag** - Flag for moderation
- **POST /:id/response** - Add business response
- **POST /:id/helpful** - Mark as helpful

---

## 🚀 **8. CAMPAIGNS** (`/api/campaigns`)

### Campaign Management (Admin + Manager Access)
```http
POST   /api/campaigns/
GET    /api/campaigns/
GET    /api/campaigns/stats
POST   /api/campaigns/audience-count
GET    /api/campaigns/:id
PUT    /api/campaigns/:id
POST   /api/campaigns/:id/launch
POST   /api/campaigns/:id/cancel
POST   /api/campaigns/:id/clone
```

### Campaign Templates (Admin + Manager)
```http
POST   /api/campaigns/templates
GET    /api/campaigns/templates
GET    /api/campaigns/templates/popular
```

### Automated Campaigns (Admin + Manager)
```http
POST   /api/campaigns/automated
GET    /api/campaigns/automated
POST   /api/campaigns/automated/:id/trigger
```

### Drip Campaigns (Admin + Manager)
```http
POST   /api/campaigns/drip
GET    /api/campaigns/drip
POST   /api/campaigns/drip/:id/enroll
GET    /api/campaigns/drip/:id/enrollments
```

### A/B Testing (Admin + Manager)
```http
POST   /api/campaigns/:id/ab-test/start
GET    /api/campaigns/:id/ab-test/results
```

### Link Tracking (Admin + Manager)
```http
POST   /api/campaigns/tracking/generate-link
```

### Campaign Analytics (Admin + Manager)
```http
GET    /api/campaigns/analytics/best-time
GET    /api/campaigns/analytics/customer-pattern/:customerId
POST   /api/campaigns/analytics/compare
GET    /api/campaigns/analytics/insights
```

---

## ⏰ **9. CAMPAIGN SCHEDULER** (`/api/campaign-scheduler`)

### Manual Triggers (Admin Only - Special Access)
```http
POST   /api/campaign-scheduler/execute-automated
POST   /api/campaign-scheduler/process-drip
POST   /api/campaign-scheduler/execute-all
```

**Description:** Manually trigger automated campaigns and drip campaigns execution (normally runs automatically)

---

## 🔔 **10. NOTIFICATIONS** (`/api/notifications`)

### All Routes (Admin + Manager Access)
```http
POST   /api/notifications/
POST   /api/notifications/:notificationId/send
GET    /api/notifications/
GET    /api/notifications/:notificationId/analytics
POST   /api/notifications/campaigns
GET    /api/notifications/campaigns
GET    /api/notifications/analytics/customers
```

### Automated Notifications (Admin + Manager)
```http
GET    /api/notifications/automated/summary
POST   /api/notifications/automated/birthday
POST   /api/notifications/automated/anniversary
POST   /api/notifications/automated/appointment-reminders
POST   /api/notifications/automated/reactivation
POST   /api/notifications/automated/review-requests
```

---

## 📊 **11. ANALYTICS** (`/api/analytics`)

### All Routes (Admin + Manager Access)
```http
GET /api/analytics/dashboard
GET /api/analytics/revenue
GET /api/analytics/customers
GET /api/analytics/services
GET /api/analytics/appointments
GET /api/analytics/staff
GET /api/analytics/trends
```

**Endpoints:**
- **GET /dashboard** - Dashboard overview analytics
- **GET /revenue** - Revenue analytics with trends
- **GET /customers** - Customer behavior analytics
- **GET /services** - Service performance analytics
- **GET /appointments** - Appointment analytics
- **GET /staff** - Staff performance analytics
- **GET /trends** - Trends and predictions

---

## 📄 **12. REPORTS** (`/api/reports`)

### All Routes (Admin + Manager Access)
```http
GET /api/reports/
GET /api/reports/analytics
GET /api/reports/export
```

**Endpoints:**
- **GET /** - Get reports list
- **GET /analytics** - Get report analytics
- **GET /export** - Export reports (PDF/Excel)

---

## 🎁 **13. LOYALTY SYSTEM** (`/api/loyalty`)

### All Routes (Admin + Manager Access)

#### Rewards Management
```http
POST   /api/loyalty/rewards
GET    /api/loyalty/rewards
PUT    /api/loyalty/rewards/:id
DELETE /api/loyalty/rewards/:id
POST   /api/loyalty/rewards/:id/redeem
```

#### Membership Plans
```http
POST   /api/loyalty/membership-plans
GET    /api/loyalty/membership-plans
PUT    /api/loyalty/membership-plans/:id
DELETE /api/loyalty/membership-plans/:id
```

#### Customer Loyalty
```http
GET /api/loyalty/customers/:customerId/history
GET /api/loyalty/customers/:customerId/available-rewards
```

#### Customer Subscriptions
```http
POST   /api/loyalty/subscriptions
GET    /api/loyalty/subscriptions
GET    /api/loyalty/subscriptions/stats
GET    /api/loyalty/subscriptions/expiring
GET    /api/loyalty/subscriptions/customer/:customerId
GET    /api/loyalty/subscriptions/:id/benefits
PUT    /api/loyalty/subscriptions/:id/renew
PUT    /api/loyalty/subscriptions/:id/cancel
```

---

## ⚙️ **14. BUSINESS SETTINGS** (`/api/settings`)

### All Routes (Admin + Manager Access)
```http
GET /api/settings/
PUT /api/settings/hours
PUT /api/settings/appointments
PUT /api/settings/notifications
PUT /api/settings/payments
PUT /api/settings/tax
PUT /api/settings/general
PUT /api/settings/loyalty
POST /api/settings/holidays
DELETE /api/settings/holidays/:date
```

**Endpoints:**
- **GET /** - Get all business settings
- **PUT /hours** - Update business hours
- **PUT /appointments** - Update appointment settings
- **PUT /notifications** - Update notification preferences
- **PUT /payments** - Update payment methods
- **PUT /tax** - Update tax settings
- **PUT /general** - Update general settings
- **PUT /loyalty** - Update loyalty program settings
- **POST /holidays** - Add holiday
- **DELETE /holidays/:date** - Remove holiday

---

## 📤 **15. FILE UPLOADS** (`/api/upload`)

### Business Images (Admin + Manager Access)
```http
POST   /api/upload/business/logo
POST   /api/upload/business/banner
POST   /api/upload/business/gallery
POST   /api/upload/business/thumbnail
POST   /api/upload/business/qrcode
POST   /api/upload/business/images
DELETE /api/upload/business/:filename
```

### Profile Pictures
```http
POST /api/upload/staff/profile          (Admin + Manager)
POST /api/upload/manager/profile        (Admin + Manager)
POST /api/upload/admin/profile          (Admin Only)
```

### File Information
```http
GET /api/upload/file/:filename
```

---

## 📅 **16. DAILY BUSINESS** (`/api/daily-business`)

### Admin Access Routes
```http
GET /api/daily-business/              (Admin + Manager)
GET /api/daily-business/summary       (Admin + Manager)
GET /api/daily-business/analytics     (Admin + Manager)
```

**Admin Can:**
- View daily business records
- View daily summaries
- View business analytics

**Note:** Admin can only READ, Managers can CREATE/UPDATE/DELETE

---

## 📊 **ROUTE COUNT BY MODULE**

| Module | Total Routes | Admin Access | Admin Only |
|--------|--------------|--------------|------------|
| Admin Dashboard | 18 | 18 | 18 |
| Business | 8 | 8 | 5 |
| Customers | 8 | 8 | 0 |
| Services | 9 | 9 | 0 |
| Appointments | 13 | 13 | 0 |
| Invoices | 10 | 10 | 0 |
| Reviews | 11 | 11 | 0 |
| Campaigns | 25 | 25 | 0 |
| Campaign Scheduler | 3 | 3 | 3 |
| Notifications | 16 | 16 | 0 |
| Analytics | 7 | 7 | 0 |
| Reports | 3 | 3 | 0 |
| Loyalty | 16 | 16 | 0 |
| Business Settings | 10 | 10 | 0 |
| File Uploads | 12 | 12 | 1 |
| Daily Business | 3 | 3 | 0 |

---

## 🎯 **TOTAL ADMIN ROUTES**

### Summary:
- **Total Routes:** ~172 routes
- **Admin-Only Routes:** 22 routes
- **Admin + Manager Shared:** ~150 routes

---

## 🔐 **ACCESS LEVELS**

### 1. **Admin Only** (22 routes)
Routes ONLY admin can access:
- All `/api/admin/*` routes (18 routes)
- `/api/campaign-scheduler/*` routes (3 routes)
- `/api/upload/admin/profile` (1 route)

### 2. **Admin + Manager** (~150 routes)
Routes both admin and manager can access:
- Business operations
- Customer management
- Services/Products
- Appointments
- Invoices
- Reviews
- Campaigns
- Notifications
- Analytics
- Reports
- Loyalty
- Settings
- Uploads (except admin profile)

### 3. **Public Routes** (3 routes)
No authentication required:
- `/api/business/public/list`
- `/api/business/public/nearby`
- `/api/business/info/:businessLink`

---

## 📝 **IMPORTANT NOTES**

1. **Admin Business Scope:**
   - Admin can only manage THEIR OWN businesses
   - Admin can only see managers THEY created
   - Admin can only access data for their businesses

2. **Multi-Business Admin:**
   - One admin can manage multiple businesses
   - Each business has its own set of customers, services, appointments, etc.

3. **Data Isolation:**
   - Admin A cannot see Admin B's data
   - All queries are filtered by business ownership

4. **Role Hierarchy:**
   ```
   Admin > Manager > Staff > Customer
   ```

5. **Authentication Required:**
   - All routes (except public) require JWT token
   - Token contains: userId, role, email

---

## 🚀 **QUICK ACCESS GUIDE**

### Most Used Admin Routes:

**Dashboard & Overview:**
```bash
GET /api/admin/dashboard
GET /api/analytics/dashboard
```

**Business Management:**
```bash
GET /api/admin/businesses
POST /api/admin/business
PUT /api/admin/business/:id
```

**Manager Management:**
```bash
GET /api/admin/managers
POST /api/admin/manager
```

**Customer Data:**
```bash
GET /api/customers/
GET /api/customers/stats
```

**Financial:**
```bash
GET /api/invoices/
GET /api/invoices/stats
GET /api/analytics/revenue
```

**Marketing:**
```bash
GET /api/campaigns/
POST /api/campaigns/automated
GET /api/campaigns/analytics/insights
```

---

**Ready to use! 🎯**




🎯 MODULES WITH ADMIN ACCESS:
✅ 1. Admin Dashboard - 18 routes
✅ 2. Business Management - 8 routes
✅ 3. Customer Management - 8 routes
✅ 4. Services/Products - 9 routes
✅ 5. Appointments - 13 routes
✅ 6. Invoices & Payments - 10 routes
✅ 7. Reviews & Ratings - 11 routes
✅ 8. Campaigns - 25 routes
✅ 9. Campaign Scheduler - 3 routes
✅ 10. Notifications - 16 routes
✅ 11. Analytics - 7 routes
✅ 12. Reports - 3 routes
✅ 13. Loyalty System - 16 routes
✅ 14. Business Settings - 10 routes
✅ 15. File Uploads - 12 routes
✅ 16. Daily Business - 3 routes