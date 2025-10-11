# CRM Dashboard Frontend Structure

Based on the comprehensive backend analysis, here's the recommended frontend folder and file structure:

## 📁 Root Structure

```
client/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── fonts/
├── src/
│   ├── components/           # Reusable UI components
│   ├── pages/               # Page components
│   ├── layouts/             # Layout components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services
│   ├── store/               # State management
│   ├── utils/               # Utility functions
│   ├── constants/           # Application constants
│   ├── assets/              # Static assets
│   ├── App.jsx
│   ├── main.jsx
│   └── setupTests.js
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env
├── .env.example
├── .gitignore
└── README.md
```

## 📁 Detailed Structure

### `/src/components/` - Reusable UI Components

```
components/
├── common/                  # Common UI components
│   ├── Button/
│   │   └── Button.jsx
│   ├── Input/
│   │   └── Input.jsx
│   ├── Modal/
│   │   └── Modal.jsx
│   ├── Table/
│   │   └── Table.jsx
│   ├── Card/
│   │   └── Card.jsx
│   ├── Loading/
│   │   ├── LoadingSpinner.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   └── LoadingOverlay.jsx
│   ├── Alert/
│   │   └── Alert.jsx
│   ├── Badge/
│   │   └── Badge.jsx
│   ├── Dropdown/
│   │   └── Dropdown.jsx
│   ├── DatePicker/
│   │   └── DatePicker.jsx
│   ├── TimePicker/
│   │   └── TimePicker.jsx
│   ├── SearchBar/
│   │   └── SearchBar.jsx
│   ├── Pagination/
│   │   └── Pagination.jsx
│   ├── Tabs/
│   │   └── Tabs.jsx
│   ├── Tooltip/
│   │   └── Tooltip.jsx
│   └── index.js
├── forms/                   # Form components
│   ├── FormField/
│   │   └── FormField.jsx
│   ├── FormSelect/
│   │   └── FormSelect.jsx
│   ├── FormTextArea/
│   │   └── FormTextArea.jsx
│   ├── FormCheckbox/
│   │   └── FormCheckbox.jsx
│   ├── FormRadio/
│   │   └── FormRadio.jsx
│   ├── FormDatePicker/
│   │   └── FormDatePicker.jsx
│   ├── FormTimePicker/
│   │   └── FormTimePicker.jsx
│   ├── FormMultiSelect/
│   │   └── FormMultiSelect.jsx
│   └── index.js
├── charts/                  # Chart components
│   ├── LineChart/
│   │   └── LineChart.jsx
│   ├── BarChart/
│   │   └── BarChart.jsx
│   ├── PieChart/
│   │   └── PieChart.jsx
│   ├── AreaChart/
│   │   └── AreaChart.jsx
│   ├── DonutChart/
│   │   └── DonutChart.jsx
│   ├── StatCard/
│   │   └── StatCard.jsx
│   └── index.js
├── business/                # Business-specific components
│   ├── BusinessCard/
│   │   └── BusinessCard.jsx
│   ├── BusinessTypeBadge/
│   │   └── BusinessTypeBadge.jsx
│   ├── BusinessSettings/
│   │   └── BusinessSettings.jsx
│   └── index.js
├── staff/                   # Staff-specific components
│   ├── StaffCard/
│   │   └── StaffCard.jsx
│   ├── StaffRoleBadge/
│   │   └── StaffRoleBadge.jsx
│   ├── StaffPerformance/
│   │   └── StaffPerformance.jsx
│   └── index.js
├── customer/                # Customer-specific components
│   ├── CustomerCard/
│   │   └── CustomerCard.jsx
│   ├── CustomerSegment/
│   │   └── CustomerSegment.jsx
│   ├── CustomerTimeline/
│   │   └── CustomerTimeline.jsx
│   ├── CustomerNotes/
│   │   └── CustomerNotes.jsx
│   └── index.js
├── appointment/             # Appointment-specific components
│   ├── AppointmentCard/
│   │   └── AppointmentCard.jsx
│   ├── AppointmentStatus/
│   │   └── AppointmentStatus.jsx
│   ├── TimeSlotPicker/
│   │   └── TimeSlotPicker.jsx
│   ├── ServiceSelector/
│   │   └── ServiceSelector.jsx
│   ├── StaffSelector/
│   │   └── StaffSelector.jsx
│   ├── AppointmentCalendar/
│   │   └── AppointmentCalendar.jsx
│   └── index.js
├── transaction/             # Transaction-specific components
│   ├── TransactionCard/
│   │   └── TransactionCard.jsx
│   ├── PaymentMethod/
│   │   └── PaymentMethod.jsx
│   ├── TransactionSummary/
│   │   └── TransactionSummary.jsx
│   └── index.js
├── notification/            # Notification-specific components
│   ├── NotificationCard/
│   │   └── NotificationCard.jsx
│   ├── CampaignCard/
│   │   └── CampaignCard.jsx
│   ├── NotificationBuilder/
│   │   └── NotificationBuilder.jsx
│   ├── TargetAudience/
│   │   └── TargetAudience.jsx
│   └── index.js
├── report/                  # Report-specific components
│   ├── ReportCard/
│   │   └── ReportCard.jsx
│   ├── ReportFilters/
│   │   └── ReportFilters.jsx
│   ├── ExportOptions/
│   │   └── ExportOptions.jsx
│   └── index.js
└── index.js
```

### `/src/pages/` - Page Components

```
pages/
├── auth/                    # Authentication pages
│   ├── Login/
│   │   └── Login.jsx
│   ├── Register/
│   │   └── Register.jsx
│   ├── ForgotPassword/
│   │   └── ForgotPassword.jsx
│   ├── ResetPassword/
│   │   └── ResetPassword.jsx
│   ├── OTPVerification/
│   │   └── OTPVerification.jsx
│   └── index.js
├── admin/                   # Admin pages
│   ├── Dashboard/
│   │   └── AdminDashboard.jsx
│   ├── Businesses/
│   │   ├── BusinessList/
│   │   │   └── BusinessList.jsx
│   │   ├── BusinessDetails/
│   │   │   └── BusinessDetails.jsx
│   │   ├── CreateBusiness/
│   │   │   └── CreateBusiness.jsx
│   │   ├── EditBusiness/
│   │   │   └── EditBusiness.jsx
│   │   └── index.js
│   ├── Managers/
│   │   ├── ManagerList/
│   │   │   └── ManagerList.jsx
│   │   ├── CreateManager/
│   │   │   └── CreateManager.jsx
│   │   └── index.js
│   ├── Reports/
│   │   └── AdminReports.jsx
│   └── index.js
├── manager/                 # Manager pages
│   ├── Dashboard/
│   │   └── ManagerDashboard.jsx
│   ├── Staff/
│   │   ├── StaffList/
│   │   │   └── StaffList.jsx
│   │   ├── StaffDetails/
│   │   │   └── StaffDetails.jsx
│   │   ├── AddStaff/
│   │   │   └── AddStaff.jsx
│   │   ├── EditStaff/
│   │   │   └── EditStaff.jsx
│   │   └── index.js
│   ├── Customers/
│   │   ├── CustomerList/
│   │   │   └── CustomerList.jsx
│   │   ├── CustomerDetails/
│   │   │   └── CustomerDetails.jsx
│   │   ├── CustomerAnalytics/
│   │   │   └── CustomerAnalytics.jsx
│   │   ├── CustomerSegments/
│   │   │   └── CustomerSegments.jsx
│   │   └── index.js
│   ├── Appointments/
│   │   ├── AppointmentList/
│   │   │   └── AppointmentList.jsx
│   │   ├── AppointmentCalendar/
│   │   │   └── AppointmentCalendar.jsx
│   │   ├── AppointmentDetails/
│   │   │   └── AppointmentDetails.jsx
│   │   └── index.js
│   ├── Transactions/
│   │   ├── TransactionList/
│   │   │   └── TransactionList.jsx
│   │   ├── AddTransaction/
│   │   │   └── AddTransaction.jsx
│   │   ├── TransactionDetails/
│   │   │   └── TransactionDetails.jsx
│   │   └── index.js
│   ├── DailyBusiness/
│   │   ├── DailyBusinessList/
│   │   │   └── DailyBusinessList.jsx
│   │   ├── AddDailyBusiness/
│   │   │   └── AddDailyBusiness.jsx
│   │   ├── DailyBusinessDetails/
│   │   │   └── DailyBusinessDetails.jsx
│   │   └── index.js
│   ├── Notifications/
│   │   ├── NotificationList/
│   │   │   └── NotificationList.jsx
│   │   ├── CreateNotification/
│   │   │   └── CreateNotification.jsx
│   │   ├── CampaignList/
│   │   │   └── CampaignList.jsx
│   │   ├── CreateCampaign/
│   │   │   └── CreateCampaign.jsx
│   │   └── index.js
│   ├── Reports/
│   │   └── ManagerReports.jsx
│   └── index.js
├── staff/                   # Staff pages
│   ├── Dashboard/
│   │   └── StaffDashboard.jsx
│   ├── Profile/
│   │   └── StaffProfile.jsx
│   ├── Business/
│   │   └── StaffBusiness.jsx
│   └── index.js
├── public/                  # Public pages (for appointment booking)
│   ├── Booking/
│   │   ├── BusinessInfo/
│   │   │   └── BusinessInfo.jsx
│   │   ├── ServiceSelection/
│   │   │   └── ServiceSelection.jsx
│   │   ├── StaffSelection/
│   │   │   └── StaffSelection.jsx
│   │   ├── TimeSelection/
│   │   │   └── TimeSelection.jsx
│   │   ├── CustomerInfo/
│   │   │   └── CustomerInfo.jsx
│   │   ├── BookingConfirmation/
│   │   │   └── BookingConfirmation.jsx
│   │   └── index.js
│   ├── AppointmentStatus/
│   │   └── AppointmentStatus.jsx
│   └── index.js
├── shared/                  # Shared pages
│   ├── NotFound/
│   │   └── NotFound.jsx
│   ├── Unauthorized/
│   │   └── Unauthorized.jsx
│   ├── Error/
│   │   └── Error.jsx
│   └── index.js
└── index.js
```

### `/src/layouts/` - Layout Components

```
layouts/
├── AdminLayout/
│   ├── AdminLayout.jsx
│   └── components/
│       ├── AdminSidebar/
│       │   └── AdminSidebar.jsx
│       ├── AdminHeader/
│       │   └── AdminHeader.jsx
│       └── index.js
├── ManagerLayout/
│   ├── ManagerLayout.jsx
│   └── components/
│       ├── ManagerSidebar/
│       │   └── ManagerSidebar.jsx
│       ├── ManagerHeader/
│       │   └── ManagerHeader.jsx
│       └── index.js
├── StaffLayout/
│   ├── StaffLayout.jsx
│   └── components/
│       ├── StaffSidebar/
│       │   └── StaffSidebar.jsx
│       ├── StaffHeader/
│       │   └── StaffHeader.jsx
│       └── index.js
├── PublicLayout/
│   ├── PublicLayout.jsx
│   └── components/
│       ├── PublicHeader/
│       │   └── PublicHeader.jsx
│       ├── PublicFooter/
│       │   └── PublicFooter.jsx
│       └── index.js
├── AuthLayout/
│   ├── AuthLayout.jsx
│   └── components/
│       ├── AuthHeader/
│       │   └── AuthHeader.jsx
│       └── index.js
└── index.js
```

### `/src/hooks/` - Custom React Hooks

```
hooks/
├── auth/
│   ├── useAuth.js
│   ├── useLogin.js
│   ├── useLogout.js
│   ├── useRegister.js
│   ├── useOTP.js
│   └── index.js
├── api/
│   ├── useApi.js
│   ├── useApiCall.js
│   ├── useInfiniteQuery.js
│   ├── useMutation.js
│   └── index.js
├── business/
│   ├── useBusiness.js
│   ├── useBusinesses.js
│   ├── useBusinessAnalytics.js
│   └── index.js
├── staff/
│   ├── useStaff.js
│   ├── useStaffList.js
│   ├── useStaffPerformance.js
│   └── index.js
├── customer/
│   ├── useCustomer.js
│   ├── useCustomers.js
│   ├── useCustomerAnalytics.js
│   ├── useCustomerSegments.js
│   └── index.js
├── appointment/
│   ├── useAppointment.js
│   ├── useAppointments.js
│   ├── useAvailableSlots.js
│   ├── useBooking.js
│   └── index.js
├── transaction/
│   ├── useTransaction.js
│   ├── useTransactions.js
│   └── index.js
├── notification/
│   ├── useNotification.js
│   ├── useNotifications.js
│   ├── useCampaigns.js
│   └── index.js
├── report/
│   ├── useReports.js
│   ├── useAnalytics.js
│   └── index.js
├── common/
│   ├── useLocalStorage.js
│   ├── useSessionStorage.js
│   ├── useDebounce.js
│   ├── useThrottle.js
│   ├── useClickOutside.js
│   ├── useKeyPress.js
│   ├── useWindowSize.js
│   ├── useScrollPosition.js
│   ├── useIntersectionObserver.js
│   ├── useCopyToClipboard.js
│   ├── useDownload.js
│   ├── usePrint.js
│   └── index.js
└── index.js
```

### `/src/services/` - API Services

```
services/
├── api/
│   ├── client.js            # Axios instance configuration
│   ├── interceptors.js      # Request/Response interceptors
│   ├── endpoints.js         # API endpoints configuration
│   └── index.js
├── auth/
│   ├── authService.js
│   └── index.js
├── admin/
│   ├── adminService.js
│   ├── businessService.js
│   ├── managerService.js
│   └── index.js
├── manager/
│   ├── managerService.js
│   ├── staffService.js
│   ├── customerService.js
│   ├── appointmentService.js
│   ├── transactionService.js
│   ├── dailyBusinessService.js
│   ├── notificationService.js
│   ├── reportService.js
│   └── index.js
├── staff/
│   ├── staffService.js
│   └── index.js
├── public/
│   ├── publicService.js
│   ├── bookingService.js
│   └── index.js
├── upload/
│   ├── uploadService.js
│   └── index.js
├── export/
│   ├── exportService.js
│   └── index.js
└── index.js
```

### `/src/store/` - State Management

```
store/
├── slices/
│   ├── authSlice.js
│   ├── adminSlice.js
│   ├── businessSlice.js
│   ├── staffSlice.js
│   ├── customerSlice.js
│   ├── appointmentSlice.js
│   ├── transactionSlice.js
│   ├── notificationSlice.js
│   ├── reportSlice.js
│   ├── uiSlice.js
│   └── index.js
├── middleware/
│   ├── authMiddleware.js
│   ├── apiMiddleware.js
│   └── index.js
├── selectors/
│   ├── authSelectors.js
│   ├── adminSelectors.js
│   ├── businessSelectors.js
│   ├── staffSelectors.js
│   ├── customerSelectors.js
│   ├── appointmentSelectors.js
│   ├── transactionSelectors.js
│   ├── notificationSelectors.js
│   ├── reportSelectors.js
│   ├── uiSelectors.js
│   └── index.js
├── store.js
└── index.js
```

### `/src/utils/` - Utility Functions

```
utils/
├── auth/
│   ├── tokenUtils.js
│   ├── roleUtils.js
│   ├── permissionUtils.js
│   └── index.js
├── validation/
│   ├── validators.js
│   ├── schemas.js
│   ├── formatters.js
│   └── index.js
├── date/
│   ├── dateUtils.js
│   ├── timeUtils.js
│   ├── calendarUtils.js
│   └── index.js
├── format/
│   ├── currencyUtils.js
│   ├── numberUtils.js
│   ├── textUtils.js
│   ├── phoneUtils.js
│   ├── emailUtils.js
│   └── index.js
├── business/
│   ├── businessUtils.js
│   ├── serviceUtils.js
│   ├── staffUtils.js
│   └── index.js
├── customer/
│   ├── customerUtils.js
│   ├── segmentUtils.js
│   ├── analyticsUtils.js
│   └── index.js
├── appointment/
│   ├── appointmentUtils.js
│   ├── slotUtils.js
│   ├── bookingUtils.js
│   └── index.js
├── notification/
│   ├── notificationUtils.js
│   ├── campaignUtils.js
│   ├── templateUtils.js
│   └── index.js
├── report/
│   ├── reportUtils.js
│   ├── exportUtils.js
│   ├── chartUtils.js
│   └── index.js
├── common/
│   ├── arrayUtils.js
│   ├── objectUtils.js
│   ├── stringUtils.js
│   ├── fileUtils.js
│   ├── urlUtils.js
│   ├── storageUtils.js
│   ├── errorUtils.js
│   ├── logUtils.js
│   └── index.js
└── index.js
```

### `/src/constants/` - Application Constants

```
constants/
├── api/
│   ├── endpoints.js
│   ├── statusCodes.js
│   ├── errorMessages.js
│   └── index.js
├── auth/
│   ├── roles.js
│   ├── permissions.js
│   ├── tokenKeys.js
│   └── index.js
├── business/
│   ├── businessTypes.js
│   ├── serviceTypes.js
│   ├── staffRoles.js
│   └── index.js
├── customer/
│   ├── customerSegments.js
│   ├── customerStatus.js
│   └── index.js
├── appointment/
│   ├── appointmentStatus.js
│   ├── bookingSources.js
│   ├── paymentMethods.js
│   └── index.js
├── notification/
│   ├── notificationTypes.js
│   ├── campaignTypes.js
│   ├── deliveryChannels.js
│   └── index.js
├── ui/
│   ├── colors.js
│   ├── breakpoints.js
│   ├── spacing.js
│   ├── typography.js
│   ├── animations.js
│   └── index.js
├── validation/
│   ├── patterns.js
│   ├── limits.js
│   └── index.js
├── config.js
└── index.js
```

### `/src/styles/` - Global Styles

```
styles/
├── globals.css
├── reset.css
├── variables.css
├── components/
│   ├── button.css
│   ├── input.css
│   ├── modal.css
│   ├── table.css
│   ├── card.css
│   ├── form.css
│   └── index.css
├── layouts/
│   ├── admin.css
│   ├── manager.css
│   ├── staff.css
│   ├── public.css
│   └── index.css
├── pages/
│   ├── auth.css
│   ├── dashboard.css
│   ├── business.css
│   ├── staff.css
│   ├── customer.css
│   ├── appointment.css
│   ├── transaction.css
│   ├── notification.css
│   ├── report.css
│   └── index.css
├── utilities/
│   ├── spacing.css
│   ├── colors.css
│   ├── typography.css
│   ├── layout.css
│   └── index.css
└── index.css
```

### `/src/assets/` - Static Assets

```
assets/
├── images/
│   ├── logos/
│   ├── icons/
│   ├── illustrations/
│   ├── backgrounds/
│   └── placeholders/
├── icons/
│   ├── business/
│   ├── staff/
│   ├── customer/
│   ├── appointment/
│   ├── transaction/
│   ├── notification/
│   ├── report/
│   └── common/
├── fonts/
│   ├── primary/
│   ├── secondary/
│   └── monospace/
└── data/
    ├── mockData.js
    ├── sampleData.js
    └── index.js
```

## 🚀 Key Features & Functionality

### Authentication & Authorization
- **Multi-role authentication** (Admin, Manager, Staff)
- **JWT token management** with refresh tokens
- **OTP verification** for secure login
- **Role-based access control** with permissions
- **Protected routes** and middleware

### Admin Features
- **Company dashboard** with business overview
- **Business management** (Create, Read, Update, Delete)
- **Manager creation** and management
- **Multi-business support** (Salon, Spa, Hotel)
- **Business analytics** and reporting
- **Business link generation** for public booking

### Manager Features
- **Manager dashboard** with daily metrics
- **Staff management** (CRUD operations)
- **Customer management** with analytics
- **Appointment management** and calendar
- **Transaction recording** and tracking
- **Daily business records** and summaries
- **Notification campaigns** and marketing
- **Reports and analytics**

### Staff Features
- **Staff dashboard** with personal metrics
- **Profile management**
- **Business information** access
- **Performance tracking**

### Public Features
- **Online appointment booking** system
- **Business information** display
- **Service selection** and staff booking
- **Time slot availability** checking
- **Customer information** collection
- **Booking confirmation** and management
- **Appointment status** tracking

### Advanced Features
- **Real-time notifications** and updates
- **Customer segmentation** and analytics
- **Marketing campaigns** with targeting
- **Report generation** and export (CSV, PDF)
- **Data visualization** with charts
- **Responsive design** for all devices
- **Progressive Web App** capabilities

## 🛠 Technology Stack Recommendations

### Core Framework
- **React 18** with JavaScript (JSX)
- **Vite** for build tooling and development server
- **React Router v6** for routing
- **Redux Toolkit** for state management
- **React Query** for server state management

### UI & Styling
- **Tailwind CSS** for utility-first styling
- **Headless UI** for accessible components
- **React Hook Form** for form management
- **React Hot Toast** for notifications

### Charts & Visualization
- **Recharts** or **Chart.js** for data visualization
- **React Big Calendar** for appointment scheduling
- **React DatePicker** for date selection

### Development Tools
- **Vite** for fast build tooling
- **ESLint** and **Prettier** for code quality
- **Husky** for git hooks
- **Jest** and **React Testing Library** for testing

### Additional Libraries
- **Axios** for HTTP requests
- **React Helmet** for SEO
- **React Icons** for iconography
- **Framer Motion** for animations
- **React PDF** for PDF generation

## 📦 Package.json Configuration

```json
{
  "name": "crm-dashboard-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "@reduxjs/toolkit": "^1.9.3",
    "react-redux": "^8.0.5",
    "@tanstack/react-query": "^4.24.6",
    "axios": "^1.3.4",
    "react-hook-form": "^7.43.5",
    "react-hot-toast": "^2.4.0",
    "recharts": "^2.5.0",
    "react-big-calendar": "^1.6.2",
    "react-datepicker": "^4.10.0",
    "react-icons": "^4.7.1",
    "framer-motion": "^10.0.1",
    "react-helmet": "^6.1.0",
    "react-pdf": "^6.2.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0",
    "eslint": "^8.38.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.3.4",
    "tailwindcss": "^3.2.7",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.21",
    "prettier": "^2.8.7"
  }
}
```

## ⚙️ Configuration Files

### `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### `postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### `.env.example`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=CRM Dashboard
VITE_APP_VERSION=1.0.0
```

This structure provides a comprehensive, scalable, and maintainable frontend architecture that perfectly aligns with your backend API structure and business requirements using **React + Vite + JavaScript + Tailwind CSS**.
