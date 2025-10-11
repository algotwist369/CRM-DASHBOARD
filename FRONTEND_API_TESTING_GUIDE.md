# Frontend API Testing Guide

## 🧪 **Complete API Integration Testing**

This guide will help you systematically test all frontend-backend API integrations to ensure everything is working correctly.

## 📋 **Testing Checklist**

### **1. Authentication System Testing**

#### **Login Page** (`/auth/login`)
- [ ] **Test Valid Login**
  - Enter valid admin credentials
  - Should redirect to `/admin/dashboard`
  - Should store auth token in localStorage
  - Should show success toast

- [ ] **Test Invalid Login**
  - Enter invalid credentials
  - Should show error message
  - Should not redirect
  - Should show error toast

- [ ] **Test Manager Login**
  - Enter valid manager credentials
  - Should redirect to `/manager/dashboard`

- [ ] **Test Staff Login**
  - Enter valid staff credentials
  - Should redirect to `/staff/dashboard`

#### **Register Page** (`/auth/register`)
- [ ] **Test Valid Registration**
  - Fill all required fields
  - Should show success message
  - Should redirect to login page
  - Should show success toast

- [ ] **Test Invalid Registration**
  - Submit with missing fields
  - Should show validation errors
  - Should not submit

#### **OTP Verification** (`/auth/otp-verification`)
- [ ] **Test Valid OTP**
  - Enter correct OTP code
  - Should verify successfully
  - Should redirect appropriately

- [ ] **Test Invalid OTP**
  - Enter wrong OTP code
  - Should show error message

- [ ] **Test Resend OTP**
  - Click resend button
  - Should send new OTP
  - Should reset timer

### **2. Admin Panel Testing**

#### **Admin Dashboard** (`/admin/dashboard`)
- [ ] **Test Dashboard Load**
  - Should load real data from `/api/admin/dashboard`
  - Should show business statistics
  - Should show recent activities
  - Should show charts and analytics

#### **Business Management** (`/admin/businesses`)
- [ ] **Test Business List**
  - Should load businesses from `/api/admin/businesses`
  - Should show search and filter functionality
  - Should show business details

- [ ] **Test Create Business** (`/admin/businesses/create`)
  - Fill business form
  - Should create business via `/api/admin/business`
  - Should redirect to business list
  - Should show success message

- [ ] **Test Edit Business** (`/admin/businesses/edit/:id`)
  - Should load business data
  - Should update via `/api/admin/business/:id`
  - Should show success message

- [ ] **Test Delete Business**
  - Click delete button
  - Should delete via `/api/admin/business/:id`
  - Should remove from list
  - Should show success message

#### **Manager Management** (`/admin/managers`)
- [ ] **Test Manager List**
  - Should load managers from `/api/admin/managers`
  - Should show manager details

- [ ] **Test Create Manager** (`/admin/managers/create`)
  - Fill manager form
  - Should create via `/api/admin/manager`
  - Should redirect to manager list

### **3. Manager Panel Testing**

#### **Manager Dashboard** (`/manager/dashboard`)
- [ ] **Test Dashboard Load**
  - Should load data from `/api/manager/dashboard`
  - Should show staff statistics
  - Should show appointment data
  - Should show revenue data

#### **Staff Management** (`/manager/staff`)
- [ ] **Test Staff List**
  - Should load staff from `/api/manager/staff`
  - Should show staff details

- [ ] **Test Add Staff** (`/manager/staff/add`)
  - Fill staff form
  - Should create via `/api/manager/staff`
  - Should redirect to staff list

- [ ] **Test Edit Staff** (`/manager/staff/edit/:id`)
  - Should load staff data
  - Should update via `/api/manager/staff/:id`

- [ ] **Test Delete Staff**
  - Should delete via `/api/manager/staff/:id`

#### **Transaction Management** (`/manager/transactions`)
- [ ] **Test Transaction List**
  - Should load from `/api/manager/transactions`

- [ ] **Test Add Transaction** (`/manager/transactions/add`)
  - Should create via `/api/manager/transaction`

### **4. Staff Panel Testing**

#### **Staff Dashboard** (`/staff/dashboard`)
- [ ] **Test Dashboard Load**
  - Should load staff-specific data

#### **Staff Profile** (`/staff/profile`)
- [ ] **Test Profile Load**
  - Should load from `/api/staff/profile`

- [ ] **Test Profile Update**
  - Should update via `/api/staff/profile`

#### **Staff Business** (`/staff/business`)
- [ ] **Test Business Info**
  - Should load from `/api/staff/business`

### **5. Public Booking System Testing**

#### **Business Info** (`/book/:businessLink`)
- [ ] **Test Business Info Load**
  - Should load from `/api/appointments/business/:link/info`
  - Should show business details
  - Should show services

#### **Service Selection** (`/book/:businessLink`)
- [ ] **Test Service Selection**
  - Should show available services
  - Should allow service selection

#### **Staff Selection** (`/book/:businessLink/staff`)
- [ ] **Test Staff Selection**
  - Should show available staff
  - Should allow staff selection

#### **Time Selection** (`/book/:businessLink/time`)
- [ ] **Test Available Slots**
  - Should load from `/api/appointments/business/:link/slots`
  - Should show available time slots
  - Should allow time selection

#### **Customer Info** (`/book/:businessLink/customer`)
- [ ] **Test Customer Form**
  - Should collect customer information

#### **Booking Confirmation** (`/book/:businessLink/confirm`)
- [ ] **Test Booking Creation**
  - Should create via `/api/appointments/business/:link/book`
  - Should show confirmation details
  - Should generate confirmation code

#### **Appointment Status** (`/appointment-status/:confirmationCode`)
- [ ] **Test Status Check**
  - Should load from `/api/appointments/confirmation/:code`
  - Should show appointment details

- [ ] **Test Cancel Appointment**
  - Should cancel via `/api/appointments/confirmation/:code/cancel`

### **6. Customer Management Testing**

#### **Customer List** (`/manager/customers`)
- [ ] **Test Customer List**
  - Should load from `/api/customers`
  - Should show customer details

#### **Customer Details** (`/manager/customers/:id`)
- [ ] **Test Customer Details**
  - Should load from `/api/customers/:id`
  - Should show customer timeline

#### **Customer Analytics** (`/manager/customers/analytics`)
- [ ] **Test Analytics**
  - Should load from `/api/customers/analytics/overview`
  - Should show customer segments

### **7. Notification System Testing**

#### **Notification List** (`/manager/notifications`)
- [ ] **Test Notification List**
  - Should load from `/api/notifications`

#### **Create Notification** (`/manager/notifications/create`)
- [ ] **Test Create Notification**
  - Should create via `/api/notifications`
  - Should send via `/api/notifications/:id/send`

#### **Campaign Management** (`/manager/notifications/campaigns`)
- [ ] **Test Campaign List**
  - Should load from `/api/notifications/campaigns`

- [ ] **Test Create Campaign**
  - Should create via `/api/notifications/campaigns`

### **8. Reporting System Testing**

#### **Reports** (`/admin/reports` or `/manager/reports`)
- [ ] **Test Reports List**
  - Should load from `/api/reports`

- [ ] **Test Analytics**
  - Should load from `/api/reports/analytics`

- [ ] **Test Export**
  - Should export via `/api/reports/export`

### **9. Daily Business Management Testing**

#### **Daily Business List** (`/manager/daily-business`)
- [ ] **Test Daily Business List**
  - Should load from `/api/daily-business`

#### **Add Daily Business** (`/manager/daily-business/add`)
- [ ] **Test Add Daily Business**
  - Should create via `/api/daily-business`

#### **Daily Summary** (`/manager/daily-business/summary`)
- [ ] **Test Daily Summary**
  - Should load from `/api/daily-business/summary`

## 🔧 **Testing Tools**

### **Browser Developer Tools**
1. **Network Tab**
   - Check API calls are being made
   - Verify request/response data
   - Check for 404/500 errors

2. **Console Tab**
   - Check for JavaScript errors
   - Verify API response logging
   - Check error handling

3. **Application Tab**
   - Check localStorage for auth tokens
   - Verify user data storage

### **API Testing with Postman**
1. **Test Backend APIs Directly**
   - Verify all endpoints work
   - Test authentication
   - Test error responses

2. **Compare Frontend vs Backend**
   - Ensure data matches
   - Verify request formats

## 🚨 **Common Issues to Check**

### **Authentication Issues**
- [ ] Token not being sent in headers
- [ ] Token expiration handling
- [ ] Redirect loops
- [ ] Role-based access control

### **API Integration Issues**
- [ ] Wrong endpoint URLs
- [ ] Missing request parameters
- [ ] Incorrect data format
- [ ] CORS issues

### **Error Handling Issues**
- [ ] Network errors not handled
- [ ] API errors not displayed
- [ ] Loading states not shown
- [ ] Success messages missing

### **Data Flow Issues**
- [ ] Data not updating after operations
- [ ] Lists not refreshing
- [ ] Form data not clearing
- [ ] Navigation not working

## 📊 **Testing Results Template**

```
## API Integration Test Results

### Authentication ✅/❌
- Login: ✅/❌
- Register: ✅/❌
- OTP: ✅/❌
- Logout: ✅/❌

### Admin Panel ✅/❌
- Dashboard: ✅/❌
- Business Management: ✅/❌
- Manager Management: ✅/❌

### Manager Panel ✅/❌
- Dashboard: ✅/❌
- Staff Management: ✅/❌
- Transaction Management: ✅/❌

### Staff Panel ✅/❌
- Dashboard: ✅/❌
- Profile: ✅/❌
- Business Info: ✅/❌

### Public Booking ✅/❌
- Business Info: ✅/❌
- Service Selection: ✅/❌
- Staff Selection: ✅/❌
- Time Selection: ✅/❌
- Booking: ✅/❌

### Customer Management ✅/❌
- Customer List: ✅/❌
- Customer Details: ✅/❌
- Analytics: ✅/❌

### Notifications ✅/❌
- Notification List: ✅/❌
- Create Notification: ✅/❌
- Campaigns: ✅/❌

### Reports ✅/❌
- Reports List: ✅/❌
- Analytics: ✅/❌
- Export: ✅/❌

### Daily Business ✅/❌
- Daily Business List: ✅/❌
- Add Daily Business: ✅/❌
- Summary: ✅/❌

## Issues Found:
1. [Issue description]
2. [Issue description]
3. [Issue description]

## Overall Status: ✅ PASS / ❌ FAIL
```

## 🎯 **Success Criteria**

Your API integration is successful when:
- ✅ All pages load real data (no mock data)
- ✅ All forms submit to real APIs
- ✅ All CRUD operations work
- ✅ Error handling works properly
- ✅ Loading states are shown
- ✅ Success/error messages appear
- ✅ Authentication works correctly
- ✅ Role-based access works
- ✅ Navigation works properly
- ✅ Data persists correctly

---

**Follow this guide systematically to ensure your frontend is fully integrated with your backend APIs!**
