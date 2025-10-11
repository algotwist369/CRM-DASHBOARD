# Postman Testing Data - CRM Dashboard Backend

## 🏢 Company Profile: "Zenith Wellness Group"
**Industry**: Spa & Wellness  
**Company**: Zenith Wellness Group  
**Admin**: Sarah Johnson  
**Email**: sarah.johnson@zenithwellness.com  
**Phone**: +91-9876543210  

---

## 📋 Step-by-Step Testing Guide

### --> DONE **STEP 1: Admin Registration & Login**

#### 1.1 Register Admin
```json
POST /api/auth/register
Content-Type: application/json

{
  "companyName": "Zenith Wellness Group",
  "name": "Sarah Johnson",
  "email": "sarah.johnson@zenithwellness.com",
  "phone": "9876543210",
  "password": "Zenith@2024"
}
```

#### 1.2 Admin Login
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "sarah.johnson@zenithwellness.com",
  "password": "Zenith@2024"
}
```
**Save**: `accessToken` and `refreshToken` from response

---

### --> DONE **STEP 2: Create 5 Businesses**

#### 2.1 Create Main Spa - Mumbai
```json
POST /api/admin/business
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "spa",
  "name": "Zenith Spa Mumbai",
  "branch": "Bandra West",
  "address": "123 Linking Road, Bandra West",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "phone": "022-26451234",
  "email": "mumbai@zenithwellness.com",
  "website": "https://zenithwellness.com/mumbai",
  "description": "Premium spa services in the heart of Mumbai",
  "settings": {
    "workingHours": {
      "open": "09:00",
      "close": "21:00",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    },
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "appointmentSettings": {
      "advanceBookingDays": 30,
      "minAdvanceBookingHours": 2,
      "slotDuration": 60,
      "allowOnlineBooking": true
    }
  }
}
```

#### 2.2 Create Spa - Delhi
```json
POST /api/admin/business
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "spa",
  "name": "Zenith Spa Delhi",
  "branch": "Connaught Place",
  "address": "456 Janpath, Connaught Place",
  "city": "New Delhi",
  "state": "Delhi",
  "country": "India",
  "phone": "011-23456789",
  "email": "delhi@zenithwellness.com",
  "website": "https://zenithwellness.com/delhi",
  "description": "Luxury spa experience in Delhi's business district"
}
```

#### 2.3 Create Spa - Bangalore
```json
POST /api/admin/business
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "spa",
  "name": "Zenith Spa Bangalore",
  "branch": "Koramangala",
  "address": "789 5th Block, Koramangala",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "phone": "080-34567890",
  "email": "bangalore@zenithwellness.com",
  "website": "https://zenithwellness.com/bangalore",
  "description": "Modern wellness center in Bangalore's tech hub"
}
```

#### 2.4 Create Spa - Pune
```json
POST /api/admin/business
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "spa",
  "name": "Zenith Spa Pune",
  "branch": "Koregaon Park",
  "address": "321 North Main Road, Koregaon Park",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "India",
  "phone": "020-45678901",
  "email": "pune@zenithwellness.com",
  "website": "https://zenithwellness.com/pune",
  "description": "Tranquil spa retreat in Pune's upscale area"
}
```

#### 2.5 Create Spa - Hyderabad
```json
POST /api/admin/business
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "spa",
  "name": "Zenith Spa Hyderabad",
  "branch": "Banjara Hills",
  "address": "654 Road No. 12, Banjara Hills",
  "city": "Hyderabad",
  "state": "Telangana",
  "country": "India",
  "phone": "040-56789012",
  "email": "hyderabad@zenithwellness.com",
  "website": "https://zenithwellness.com/hyderabad",
  "description": "Premium wellness destination in Hyderabad"
}
```

---

### --> DONE **STEP 3: Create Managers for Each Business**

#### 3.1 Manager for Mumbai Spa
```json
POST /api/admin/manager
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Priya Sharma",
  "username": "priya_mumbai",
  "pin": "1234",
  "businessId": "{mumbai_business_id}",
  "email": "priya.sharma@zenithwellness.com",
  "phone": "9876543211"
}
```

#### 3.2 Manager for Delhi Spa
```json
POST /api/admin/manager
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "username": "rajesh_delhi",
  "pin": "2345",
  "businessId": "{delhi_business_id}",
  "email": "rajesh.kumar@zenithwellness.com",
  "phone": "9876543212"
}
```

#### 3.3 Manager for Bangalore Spa
```json
POST /api/admin/manager
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Anita Reddy",
  "username": "anita_bangalore",
  "pin": "3456",
  "businessId": "{bangalore_business_id}",
  "email": "anita.reddy@zenithwellness.com",
  "phone": "9876543213"
}
```

#### 3.4 Manager for Pune Spa
```json
POST /api/admin/manager
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Vikram Patil",
  "username": "vikram_pune",
  "pin": "4567",
  "businessId": "{pune_business_id}",
  "email": "vikram.patil@zenithwellness.com",
  "phone": "9876543214"
}
```

#### 3.5 Manager for Hyderabad Spa
```json
POST /api/admin/manager
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Sunita Rao",
  "username": "sunita_hyderabad",
  "pin": "5678",
  "businessId": "{hyderabad_business_id}",
  "email": "sunita.rao@zenithwellness.com",
  "phone": "9876543215"
}
```

---

### --> DONE **STEP 4: Manager Login & Staff Creation**

#### 4.1 Manager Login (Mumbai)
```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "priya_mumbai",
  "pin": "1234"
}
```
**Save**: Manager access token for Mumbai

#### 4.2 Add Staff - Mumbai Spa (10 staff members)
```json
POST /api/manager/staff
Authorization: Bearer {mumbai_manager_token}
Content-Type: application/json

{
  "name": "Deepika Singh",
  "email": "deepika.singh@zenithwellness.com",
  "phone": "9876543221",
  "role": "therapist",
  "specialization": "Deep Tissue Massage",
  "experience": 5,
  "salary": 35000,
  "commission": 10,
  "username": "deepika_mumbai",
  "pin": "1111"
}
```

**Repeat for 9 more staff members:**
- Meera Patel (Facial Specialist)
- Kavya Nair (Aromatherapy)
- Ritu Verma (Hot Stone Therapy)
- Sneha Joshi (Reflexology)
- Pooja Gupta (Body Wrap)
- Anjali Tiwari (Manicure/Pedicure)
- Shruti Agarwal (Hair Treatment)
- Neha Sharma (Receptionist)
- Priyanka Mehta (Cleaner)

---

### **STEP 5: Customer Data (50+ Customers)**

#### 5.1 Create Customer 1-10 (Mumbai)
```json
POST /api/customers
Authorization: Bearer {mumbai_manager_token}
Content-Type: application/json

{
  "name": "Aisha Khan",
  "email": "aisha.khan@gmail.com",
  "phone": "9876543301",
  "dateOfBirth": "1985-03-15",
  "gender": "female",
  "address": {
    "street": "45 Marine Drive",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "preferences": {
    "preferredServices": ["Deep Tissue Massage", "Facial Treatment"],
    "preferredTimeSlots": ["morning", "afternoon"]
  },
  "communication": {
    "smsNotifications": true,
    "emailNotifications": true,
    "whatsappNotifications": false
  }
}
```

**Continue with 49 more customers across all locations...**

---

### **STEP 6: Appointment Booking**

#### 6.1 Book Appointment - Mumbai
```json
POST /api/appointments/book
Content-Type: application/json

{
  "businessId": "{mumbai_business_id}",
  "customerInfo": {
    "name": "Aisha Khan",
    "email": "aisha.khan@gmail.com",
    "phone": "9876543301"
  },
  "appointmentDate": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "services": [
    {
      "serviceName": "Deep Tissue Massage",
      "serviceType": "massage",
      "serviceCategory": "Therapeutic Massage",
      "price": 2500,
      "duration": 60
    }
  ],
  "staffId": "{deepika_staff_id}",
  "customerNotes": "Prefer firm pressure",
  "specialRequests": ["Essential oils", "Quiet room"]
}
```

---

### **STEP 7: Transaction Recording**

#### 7.1 Add Transaction - Mumbai
```json
POST /api/manager/transaction
Authorization: Bearer {mumbai_manager_token}
Content-Type: application/json

{
  "customerName": "Aisha Khan",
  "customerPhone": "9876543301",
  "customerEmail": "aisha.khan@gmail.com",
  "serviceName": "Deep Tissue Massage",
  "serviceType": "massage",
  "serviceCategory": "Therapeutic Massage",
  "basePrice": 2500,
  "discount": 200,
  "tax": 230,
  "paymentMethod": "card",
  "staff": "{deepika_staff_id}",
  "notes": "Excellent service, customer very satisfied",
  "rating": 5
}
```

---

### **STEP 8: Daily Business Records**

#### 8.1 Add Daily Business - Mumbai
```json
POST /api/daily-business
Authorization: Bearer {mumbai_manager_token}
Content-Type: application/json

{
  "businessId": "{mumbai_business_id}",
  "date": "2024-01-15",
  "notes": "Busy day with 15 customers. New facial treatment launched successfully.",
  "weather": "Pleasant",
  "specialEvents": ["New Year Special", "Weekend Rush"]
}
```

---

### **STEP 9: Notification Campaigns**

#### 9.1 Create Notification Campaign
```json
POST /api/notifications
Authorization: Bearer {mumbai_manager_token}
Content-Type: application/json

{
  "title": "New Year Wellness Special",
  "message": "Start your year with 20% off on all spa treatments. Book now!",
  "type": "promotion",
  "targetAudience": {
    "type": "all",
    "segments": [
      {
        "name": "Regular Customers",
        "criteria": {
          "minVisits": 3,
          "lastVisitDays": 30
        }
      }
    ]
  },
  "content": {
    "imageUrl": "https://zenithwellness.com/images/newyear-special.jpg",
    "actionUrl": "https://zenithwellness.com/book",
    "actionText": "Book Now",
    "discountCode": "NEWYEAR20",
    "discountPercentage": 20
  },
  "delivery": {
    "channels": ["sms", "email"],
    "scheduledAt": "2024-01-01T09:00:00Z",
    "priority": "high"
  }
}
```

---

### **STEP 10: Reports & Analytics**

#### 10.1 Get Business Analytics
```json
GET /api/reports/analytics
Authorization: Bearer {mumbai_manager_token}
```

#### 10.2 Export Reports
```json
GET /api/reports/export?format=csv&scope=manager
Authorization: Bearer {mumbai_manager_token}
```

---

## 📊 **Complete Customer Database (50 Customers)**

### **Mumbai Customers (15)**
1. Aisha Khan - aisha.khan@gmail.com - 9876543301
2. Priya Patel - priya.patel@gmail.com - 9876543302
3. Rajesh Kumar - rajesh.kumar@gmail.com - 9876543303
4. Sneha Sharma - sneha.sharma@gmail.com - 9876543304
5. Vikram Singh - vikram.singh@gmail.com - 9876543305
6. Meera Joshi - meera.joshi@gmail.com - 9876543306
7. Ankit Gupta - ankit.gupta@gmail.com - 9876543307
8. Kavya Nair - kavya.nair@gmail.com - 9876543308
9. Ritu Verma - ritu.verma@gmail.com - 9876543309
10. Pooja Agarwal - pooja.agarwal@gmail.com - 9876543310
11. Shruti Tiwari - shruti.tiwari@gmail.com - 9876543311
12. Neha Reddy - neha.reddy@gmail.com - 9876543312
13. Anjali Mehta - anjali.mehta@gmail.com - 9876543313
14. Sunita Rao - sunita.rao@gmail.com - 9876543314
15. Deepika Patil - deepika.patil@gmail.com - 9876543315

### **Delhi Customers (12)**
16. Arjun Malhotra - arjun.malhotra@gmail.com - 9876543316
17. Sonali Jain - sonali.jain@gmail.com - 9876543317
18. Rohit Sharma - rohit.sharma@gmail.com - 9876543318
19. Preeti Singh - preeti.singh@gmail.com - 9876543319
20. Manish Kumar - manish.kumar@gmail.com - 9876543320
21. Ritu Khanna - ritu.khanna@gmail.com - 9876543321
22. Amit Verma - amit.verma@gmail.com - 9876543322
23. Pooja Gupta - pooja.gupta@gmail.com - 9876543323
24. Vikas Agarwal - vikas.agarwal@gmail.com - 9876543324
25. Neha Tiwari - neha.tiwari@gmail.com - 9876543325
26. Rajesh Mehta - rajesh.mehta@gmail.com - 9876543326
27. Sunita Reddy - sunita.reddy@gmail.com - 9876543327

### **Bangalore Customers (10)**
28. Kiran Nair - kiran.nair@gmail.com - 9876543328
29. Suresh Kumar - suresh.kumar@gmail.com - 9876543329
30. Priya Reddy - priya.reddy@gmail.com - 9876543330
31. Ravi Sharma - ravi.sharma@gmail.com - 9876543331
32. Meera Joshi - meera.joshi@gmail.com - 9876543332
33. Ankit Patel - ankit.patel@gmail.com - 9876543333
34. Kavya Singh - kavya.singh@gmail.com - 9876543334
35. Ritu Verma - ritu.verma@gmail.com - 9876543335
36. Pooja Agarwal - pooja.agarwal@gmail.com - 9876543336
37. Shruti Tiwari - shruti.tiwari@gmail.com - 9876543337

### **Pune Customers (8)**
38. Vikram Patil - vikram.patil@gmail.com - 9876543338
39. Sneha Joshi - sneha.joshi@gmail.com - 9876543339
40. Rajesh Kumar - rajesh.kumar@gmail.com - 9876543340
41. Priya Sharma - priya.sharma@gmail.com - 9876543341
42. Ankit Gupta - ankit.gupta@gmail.com - 9876543342
43. Meera Nair - meera.nair@gmail.com - 9876543343
44. Kavya Reddy - kavya.reddy@gmail.com - 9876543344
45. Ritu Singh - ritu.singh@gmail.com - 9876543345

### **Hyderabad Customers (5)**
46. Sunita Rao - sunita.rao@gmail.com - 9876543346
47. Rajesh Kumar - rajesh.kumar@gmail.com - 9876543347
48. Priya Reddy - priya.reddy@gmail.com - 9876543348
49. Vikram Sharma - vikram.sharma@gmail.com - 9876543349
50. Meera Joshi - meera.joshi@gmail.com - 9876543350

---

## 🧪 **Testing Checklist**

### **Authentication Tests**
- [ ] Admin registration
- [ ] Admin login
- [ ] Manager login
- [ ] Token refresh
- [ ] Logout

### **Business Management Tests**
- [ ] Create 5 businesses
- [ ] Get business list
- [ ] Get business details
- [ ] Update business
- [ ] Delete business

### **Manager & Staff Tests**
- [ ] Create managers
- [ ] Manager login
- [ ] Add staff members
- [ ] Get staff list
- [ ] Update staff
- [ ] Delete staff

### **Customer Management Tests**
- [ ] Create 50+ customers
- [ ] Get customer list
- [ ] Get customer details
- [ ] Update customer
- [ ] Customer analytics

### **Appointment Tests**
- [ ] Book appointments
- [ ] Get appointment list
- [ ] Update appointment status
- [ ] Cancel appointment

### **Transaction Tests**
- [ ] Add transactions
- [ ] Get transaction list
- [ ] Transaction analytics

### **Daily Business Tests**
- [ ] Add daily records
- [ ] Get daily records
- [ ] Business analytics

### **Notification Tests**
- [ ] Create notifications
- [ ] Send notifications
- [ ] Create campaigns
- [ ] Get notification analytics

### **Report Tests**
- [ ] Generate reports
- [ ] Export reports (CSV/PDF)
- [ ] Get analytics

---

## 📝 **Environment Variables for Postman**

Create these environment variables in Postman:

```
base_url: http://localhost:5000
admin_token: {admin_access_token}
mumbai_manager_token: {mumbai_manager_token}
delhi_manager_token: {delhi_manager_token}
bangalore_manager_token: {bangalore_manager_token}
pune_manager_token: {pune_manager_token}
hyderabad_manager_token: {hyderabad_manager_token}
mumbai_business_id: {mumbai_business_id}
delhi_business_id: {delhi_business_id}
bangalore_business_id: {bangalore_business_id}
pune_business_id: {pune_business_id}
hyderabad_business_id: {hyderabad_business_id}
```

This comprehensive testing data will help you verify all backend functionality with realistic spa business scenarios! 🧪✨
