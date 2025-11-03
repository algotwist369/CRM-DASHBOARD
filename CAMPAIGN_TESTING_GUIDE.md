# 🧪 Campaign API Testing Guide

## Quick Test Checklist

### ✅ **Campaign List Page** (`/admin/campaigns`)

**Test Steps:**
1. Navigate to `/admin/campaigns`
2. ✅ Verify campaigns load from API (no dummy data)
3. ✅ Check stats cards display correctly (Total, Active, Completed, Avg Open Rate)
4. ✅ Test search bar (type campaign name)
5. ✅ Click "Create Campaign" button
6. ✅ Click "View Details" on any campaign
7. ✅ Verify refresh button works

**Expected Result:**
- Real data from backend
- Toast error if API fails
- Loading spinner while fetching
- Search filters campaigns in real-time

---

### ✅ **Campaign Details Page** (`/admin/campaigns/:id`)

**Test Steps:**
1. Click on any campaign from the list
2. ✅ Verify all campaign details load correctly
3. ✅ Test "Edit" button (navigates to edit form)
4. ✅ Test "Delete" button (shows confirmation dialog)
5. ✅ Test "Pause" button (for active campaigns)
6. ✅ Test "Resume" button (for paused campaigns)
7. ✅ Verify tabs work (Overview, Analytics, Audience, etc.)

**Expected Result:**
- Campaign data loads from API
- Actions work (Pause/Resume/Delete)
- Toast notifications on success/error
- Redirect to list on delete
- Real-time status updates

---

### ✅ **Create Campaign Page** (`/admin/campaigns/create`)

**Test Steps:**
1. Click "Create Campaign" from list page
2. ✅ Fill in campaign name
3. ✅ Select campaign type (Email/SMS/WhatsApp)
4. ✅ Select target audience
5. ✅ Enter subject & message
6. ✅ Set scheduled date & time
7. ✅ Click "Save Campaign"
8. ✅ Verify toast notification
9. ✅ Verify redirect to list page
10. ✅ Verify new campaign appears in list

**Expected Result:**
- Form validation works
- API call creates campaign
- Toast shows "Campaign created successfully!"
- Redirects to `/admin/campaigns`
- New campaign visible in list

---

### ✅ **Edit Campaign Page** (`/admin/campaigns/:id/edit`)

**Test Steps:**
1. Click "Edit" from campaign details
2. ✅ Verify form is pre-filled with existing data
3. ✅ Make changes to campaign
4. ✅ Click "Save Changes"
5. ✅ Verify toast notification
6. ✅ Verify redirect to list
7. ✅ Verify changes are saved (view details again)

**Expected Result:**
- Form loads with existing campaign data
- API call updates campaign
- Toast shows "Campaign updated successfully!"
- Changes persist in database

---

### ✅ **Campaign Templates Page** (`/admin/campaigns/templates`)

**Test Steps:**
1. Navigate to `/admin/campaigns/templates`
2. ✅ Verify templates load from API
3. ✅ Test search bar
4. ✅ Test filter by type (Email, SMS, WhatsApp)
5. ✅ Test filter by category (Marketing, Transactional, etc.)
6. ✅ Click "Create Template" button
7. ✅ Click "Edit" on any template
8. ✅ Click "Delete" on any template (confirm dialog)
9. ✅ Click "Use Template" (navigates to create campaign)

**Expected Result:**
- Real templates from backend
- Filters work correctly
- CRUD operations work
- Stats display correctly

---

### ✅ **Create Template Page** (`/admin/campaigns/templates/create`)

**Test Steps:**
1. Click "Create Template" from templates page
2. ✅ Fill in template name & description
3. ✅ Select type & category
4. ✅ Enter subject & content
5. ✅ Use placeholder buttons to insert variables
6. ✅ Toggle "Active" & "Featured" checkboxes
7. ✅ Click "Save Template"
8. ✅ Verify toast notification
9. ✅ Verify redirect to templates page
10. ✅ Verify new template appears in list

**Expected Result:**
- Placeholder insertion works
- Form validation works
- API creates template
- Toast shows "Template created successfully!"
- Redirects to templates page

---

### ✅ **Edit Template Page** (`/admin/campaigns/templates/:id/edit`)

**Test Steps:**
1. Click "Edit" on any template
2. ✅ Verify form is pre-filled
3. ✅ Make changes
4. ✅ Click "Save Changes"
5. ✅ Verify toast notification
6. ✅ Verify redirect
7. ✅ Verify changes persist

**Expected Result:**
- Form loads with template data
- API updates template
- Toast shows "Template updated successfully!"
- Changes saved to database

---

## 🚨 Error Scenarios to Test

### **1. Network Error**
- Disconnect internet
- Try to load campaigns
- **Expected:** Toast error "Failed to fetch campaigns"

### **2. Invalid Campaign ID**
- Navigate to `/admin/campaigns/invalid-id`
- **Expected:** Toast error + redirect to list

### **3. Delete Confirmation**
- Click delete on campaign
- Click "Cancel" on confirmation
- **Expected:** No deletion, stays on page

### **4. Form Validation**
- Try to submit empty campaign form
- **Expected:** Browser validation errors

### **5. API Error**
- Stop backend server
- Try to create campaign
- **Expected:** Toast error "Failed to create campaign"

---

## 📊 API Endpoints Being Used

### **Campaign List:**
```
GET /api/campaigns?search=...
GET /api/campaigns/stats
```

### **Campaign Details:**
```
GET /api/campaigns/:id
POST /api/campaigns/:id/launch
POST /api/campaigns/:id/cancel
DELETE /api/campaigns/:id
```

### **Campaign Form:**
```
POST /api/campaigns (create)
PUT /api/campaigns/:id (update)
GET /api/campaigns/:id (fetch for edit)
```

### **Templates:**
```
GET /api/campaigns/templates?search=...&type=...&category=...
GET /api/campaigns/templates/:id
POST /api/campaigns/templates
PUT /api/campaigns/templates/:id
DELETE /api/campaigns/templates/:id
```

---

## 🔍 What to Check in Console

### **Successful API Call:**
```javascript
🚀 API Request: GET http://localhost:5000/api/campaigns
✅ API Response: GET http://localhost:5000/api/campaigns {status: 200, duration: '45ms'}
```

### **Failed API Call:**
```javascript
🚀 API Request: GET http://localhost:5000/api/campaigns
❌ API Error: GET http://localhost:5000/api/campaigns {status: 500, duration: '120ms', error: {...}}
```

### **Toast Notifications:**
```javascript
✅ "Campaign created successfully!"
✅ "Campaign updated successfully!"
✅ "Campaign deleted successfully!"
✅ "Template created successfully!"
❌ "Failed to fetch campaigns"
❌ "Failed to create campaign"
```

---

## ✅ Verification Checklist

- [ ] No dummy data anywhere
- [ ] No `setTimeout` delays
- [ ] No `alert()` popups
- [ ] All API calls go to backend
- [ ] Toast notifications on all actions
- [ ] Loading states during API calls
- [ ] Error handling for all failures
- [ ] Confirmation dialogs for destructive actions
- [ ] Form validation works
- [ ] Search & filters work
- [ ] CRUD operations work
- [ ] Navigation between pages works
- [ ] Data persists after refresh

---

## 🎯 Quick Test Commands

### **Test Frontend:**
```bash
curl -s http://localhost:5173/ | head -n 5
```

### **Test Backend:**
```bash
# Should return 401 (requires auth)
curl -i http://localhost:5000/api/campaigns
```

### **Test Campaign Stats:**
```bash
# With auth token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/campaigns/stats
```

---

## 🐛 Common Issues & Fixes

### **Issue:** "Failed to fetch campaigns"
**Fix:** Check if backend is running on port 5000

### **Issue:** "401 Unauthorized"
**Fix:** Login again, token might be expired

### **Issue:** Campaign list is empty
**Fix:** Create some campaigns first using Postman/Insomnia

### **Issue:** Templates not loading
**Fix:** Check if templates exist in database

---

## ✅ Expected Behavior

### **All Pages:**
- ✅ Real data from API (no dummy data)
- ✅ Loading spinners while fetching
- ✅ Toast notifications for all actions
- ✅ Error handling with user-friendly messages
- ✅ Smooth navigation between pages
- ✅ Form validation
- ✅ Confirmation dialogs for delete

### **No More:**
- ❌ Dummy data
- ❌ `setTimeout` delays
- ❌ `alert()` popups
- ❌ Hardcoded values
- ❌ `console.log` without real API calls

---

**🎉 Everything is now production-ready!**

All campaign routes are connected to real backend APIs with proper error handling, loading states, and user notifications! 🚀

