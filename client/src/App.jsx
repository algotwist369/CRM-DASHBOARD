import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { store, persistor } from './store'
import { PersistGate } from 'redux-persist/integration/react'

// Layouts
import { AuthLayout, AdminLayout, ManagerLayout, StaffLayout, PublicLayout } from './layouts'

// Auth Pages
import { Login, Register, ForgotPassword, ResetPassword, OTPVerification } from './pages/auth'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard'
import { BusinessList, CreateBusiness, EditBusiness, BusinessDetails, BusinessAnalytics, BusinessStaff, BusinessDailyRecords } from './pages/admin/Businesses'
import { ManagerList, CreateManager, ManagerDetails, EditManager } from './pages/admin/Managers'
import { NotificationsList } from './pages/admin/Notifications'
import AdminReports from './pages/admin/Reports/AdminReports'
import AdminSettings from './pages/admin/AdminSettings/AdminSettings'

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard/ManagerDashboard'
import { StaffList, AddStaff, EditStaff, StaffDetails } from './pages/manager/Staff'
import { CustomerList, CustomerDetails, CustomerAnalytics, CustomerSegments } from './pages/manager/Customers'
import { AppointmentList, AppointmentDetails, AppointmentCalendar } from './pages/manager/Appointments'
import { TransactionList, AddTransaction, TransactionDetails } from './pages/manager/Transactions'
import { DailyBusinessList, AddDailyBusiness, DailyBusinessDetails } from './pages/manager/DailyBusiness'
import { NotificationList, CreateNotification, CampaignList, CreateCampaign } from './pages/manager/Notifications'
import ManagerReports from './pages/manager/Reports/ManagerReports'
import ManagerSettings from './pages/manager/ManagerSettings/ManagerSettings'

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard/StaffDashboard'
import StaffProfile from './pages/staff/Profile/StaffProfile'
import StaffBusiness from './pages/staff/Business/StaffBusiness'
import StaffSettings from './pages/staff/StaffSettings/StaffSettings'

// Public Pages
import { BusinessInfo, ServiceSelection, StaffSelection, TimeSelection, CustomerInfo, BookingConfirmation } from './pages/public/Booking'
import AppointmentStatus from './pages/public/AppointmentStatus/AppointmentStatus'

// Shared Pages
import { Error, NotFound, Unauthorized } from './pages/shared'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <Router>
          <div className="App">
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="otp-verification" element={<OTPVerification />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="notifications" element={<NotificationsList />} />
                <Route path="businesses" element={<BusinessList />} />
                <Route path="businesses/create" element={<CreateBusiness />} />
                <Route path="businesses/:id/analytics" element={<BusinessAnalytics />} />
                <Route path="businesses/:id/staff" element={<BusinessStaff />} />
                <Route path="businesses/:id/daily-records" element={<BusinessDailyRecords />} />
                <Route path="businesses/:id/edit" element={<EditBusiness />} />
                <Route path="businesses/:id" element={<BusinessDetails />} />
                <Route path="managers" element={<ManagerList />} />
                <Route path="managers/create" element={<CreateManager />} />
                <Route path="managers/:id/edit" element={<EditManager />} />
                <Route path="managers/:id" element={<ManagerDetails />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
              </Route>

              {/* Manager Routes */}
              <Route path="/manager" element={<ManagerLayout />}>
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="staff" element={<StaffList />} />
                <Route path="staff/add" element={<AddStaff />} />
                <Route path="staff/:id" element={<StaffDetails />} />
                <Route path="staff/:id/edit" element={<EditStaff />} />
                <Route path="customers" element={<CustomerList />} />
                <Route path="customers/:id" element={<CustomerDetails />} />
                <Route path="customers/analytics" element={<CustomerAnalytics />} />
                <Route path="customers/segments" element={<CustomerSegments />} />
                <Route path="appointments" element={<AppointmentList />} />
                <Route path="appointments/:id" element={<AppointmentDetails />} />
                <Route path="appointments/calendar" element={<AppointmentCalendar />} />
                <Route path="transactions" element={<TransactionList />} />
                <Route path="transactions/add" element={<AddTransaction />} />
                <Route path="transactions/:id" element={<TransactionDetails />} />
                <Route path="daily-business" element={<DailyBusinessList />} />
                <Route path="daily-business/add" element={<AddDailyBusiness />} />
                <Route path="daily-business/:id" element={<DailyBusinessDetails />} />
                <Route path="notifications" element={<NotificationList />} />
                <Route path="notifications/create" element={<CreateNotification />} />
                <Route path="notifications/campaigns" element={<CampaignList />} />
                <Route path="notifications/campaigns/create" element={<CreateCampaign />} />
                <Route path="reports" element={<ManagerReports />} />
                <Route path="settings" element={<ManagerSettings />} />
                <Route index element={<Navigate to="/manager/dashboard" replace />} />
              </Route>

              {/* Staff Routes */}
              <Route path="/staff" element={<StaffLayout />}>
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="profile" element={<StaffProfile />} />
                <Route path="business" element={<StaffBusiness />} />
                <Route path="settings" element={<StaffSettings />} />
                <Route index element={<Navigate to="/staff/dashboard" replace />} />
              </Route>

              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route path="book/:businessLink" element={<BusinessInfo />} />
                <Route path="book/:businessLink/services" element={<ServiceSelection />} />
                <Route path="book/:businessLink/staff" element={<StaffSelection />} />
                <Route path="book/:businessLink/time" element={<TimeSelection />} />
                <Route path="book/:businessLink/customer" element={<CustomerInfo />} />
                <Route path="book/:businessLink/confirmation" element={<BookingConfirmation />} />
                <Route path="appointment/:confirmationCode" element={<AppointmentStatus />} />
                <Route index element={<Navigate to="/auth/login" replace />} />
              </Route>

              {/* Shared Routes */}
              <Route path="/error" element={<Error />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />

              {/* Legacy Routes for backward compatibility */}
              <Route path="/login" element={<Navigate to="/auth/login" replace />} />
              <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            </Routes>
            <Toaster position="bottom-left" />
          </div>
        </Router>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}

export default App