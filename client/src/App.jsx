import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { store, persistor } from './store'
import { PersistGate } from 'redux-persist/integration/react'
import { SocketProvider } from './contexts/SocketContext'

// Layouts
import { AuthLayout, AdminLayout, ManagerLayout, StaffLayout, PublicLayout } from './layouts'

// Auth Pages
import { Login, ManagerLogin, StaffLogin, Register, ForgotPassword, ResetPassword, OTPVerification } from './pages/auth'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard'
import { BusinessList, CreateBusiness, EditBusiness, BusinessDetails, BusinessAnalytics, BusinessStaff, BusinessDailyRecords } from './pages/admin/Businesses'
import { ManagerList, CreateManager, ManagerDetails, EditManager } from './pages/admin/Managers'
import { NotificationsList } from './pages/admin/Notifications'
import { AdminDailyBusinessList, AdminDailyBusinessDetails, AdminDailyBusinessAnalytics } from './pages/admin/DailyBusiness'
import { CustomerList as AdminCustomerList, CustomerForm, CustomerDetails as AdminCustomerDetails } from './pages/admin/Customers'
import { ServiceList, ServiceForm, ServiceDetails } from './pages/admin/Services'
import { AppointmentList as AdminAppointmentList, AppointmentForm, AppointmentDetails as AdminAppointmentDetails } from './pages/admin/Appointments'
import { InvoiceList, InvoiceForm } from './pages/admin/Invoices'
import { ReviewList, ReviewDetails } from './pages/admin/Reviews'
import { CampaignList as AdminCampaignList, CampaignForm, CampaignTemplates, CampaignDetails as AdminCampaignDetails, CampaignTemplateForm, AutomatedCampaigns } from './pages/admin/Campaigns'
import { LoyaltyRewards, LoyaltyRewardForm, LoyaltyPlans, LoyaltySubscriptions } from './pages/admin/Loyalty'
import { AdminAnalytics } from './pages/admin/Analytics'
import AdminReports from './pages/admin/Reports/AdminReports'
import AdminSettings from './pages/admin/AdminSettings/AdminSettings'

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard/ManagerDashboard'
import { StaffList, AddStaff, EditStaff, StaffDetails } from './pages/manager/Staff'
import { CustomerList, CustomerDetails, CustomerAnalytics, CustomerSegments, CustomerInsights, CustomerTargeting } from './pages/manager/Customers'
import { AppointmentList, AppointmentDetails, AppointmentCalendar } from './pages/manager/Appointments'
import { TransactionList, AddTransaction, TransactionDetails } from './pages/manager/Transactions'
import { DailyBusinessList, AddDailyBusiness, DailyBusinessDetails, EditDailyBusiness, DailyBusinessAnalytics } from './pages/manager/DailyBusiness'
import { NotificationList, CreateNotification, NotificationAnalytics } from './pages/manager/Notifications'
import { CampaignList, CreateCampaign, CampaignDetails, CampaignAnalytics, CampaignAnalyticsOverview } from './pages/manager/Campaigns'
import ManagerReports from './pages/manager/Reports/ManagerReports'
import ManagerSettings from './pages/manager/ManagerSettings/ManagerSettings'

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard/StaffDashboard'
import StaffProfile from './pages/staff/Profile/StaffProfile'
import StaffBusiness from './pages/staff/Business/StaffBusiness'
import StaffSettings from './pages/staff/StaffSettings/StaffSettings'
import StaffDailyBusiness from './pages/staff/DailyBusiness/StaffDailyBusiness'
import { StaffTransactionList, AddStaffTransaction, EditStaffTransaction, StaffTransactionDetails } from './pages/staff'

// Public Pages
import {
  Home,
  Features,
  Pricing,
  HowItWorks,
  ForBusinesses,
  Advertise,
  Careers,
  Notifications,
  Contact,
  FreeListing
} from './pages/public'
import { BusinessInfo, ServiceSelection, StaffSelection, TimeSelection, CustomerInfo, BookingConfirmation } from './pages/public/Booking'
import AppointmentStatus from './pages/public/AppointmentStatus/AppointmentStatus'
import CheckAppointment from './pages/public/CheckAppointment/CheckAppointment'

// Shared Pages
import { Error, NotFound, Unauthorized } from './pages/shared'
import BusinessSettings from './pages/shared/BusinessSettings/BusinessSettings'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <SocketProvider>
              <div className="App">
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="manager-login" element={<ManagerLogin />} />
                <Route path="staff-login" element={<StaffLogin />} />
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
                <Route path="businesses/:id/settings" element={<BusinessSettings />} />
                <Route path="businesses/:id" element={<BusinessDetails />} />
                <Route path="managers" element={<ManagerList />} />
                <Route path="managers/create" element={<CreateManager />} />
                <Route path="managers/:id/edit" element={<EditManager />} />
                <Route path="managers/:id" element={<ManagerDetails />} />
                <Route path="daily-business" element={<AdminDailyBusinessList />} />
                <Route path="daily-business/analytics" element={<AdminDailyBusinessAnalytics />} />
                <Route path="daily-business/:id" element={<AdminDailyBusinessDetails />} />
                <Route path="customers" element={<AdminCustomerList />} />
                <Route path="customers/create" element={<CustomerForm mode="create" />} />
                <Route path="customers/:id" element={<AdminCustomerDetails />} />
                <Route path="customers/:id/edit" element={<CustomerForm mode="edit" />} />
                <Route path="services" element={<ServiceList />} />
                <Route path="services/create" element={<ServiceForm mode="create" />} />
                <Route path="services/:id" element={<ServiceDetails />} />
                <Route path="services/:id/edit" element={<ServiceForm mode="edit" />} />
                <Route path="appointments" element={<AdminAppointmentList />} />
                <Route path="appointments/create" element={<AppointmentForm />} />
                <Route path="appointments/:id" element={<AdminAppointmentDetails />} />
                <Route path="invoices" element={<InvoiceList />} />
                <Route path="invoices/create" element={<InvoiceForm />} />
                <Route path="reviews" element={<ReviewList />} />
                <Route path="reviews/:id" element={<ReviewDetails />} />
                <Route path="campaigns" element={<AdminCampaignList />} />
                <Route path="campaigns/templates" element={<CampaignTemplates />} />
                <Route path="campaigns/templates/create" element={<CampaignTemplateForm mode="create" />} />
                <Route path="campaigns/templates/:id/edit" element={<CampaignTemplateForm mode="edit" />} />
                <Route path="campaigns/automated" element={<AutomatedCampaigns />} />
                <Route path="campaigns/create" element={<CampaignForm mode="create" />} />
                <Route path="campaigns/:id" element={<AdminCampaignDetails />} />
                <Route path="campaigns/:id/edit" element={<CampaignForm mode="edit" />} />
                <Route path="loyalty/rewards" element={<LoyaltyRewards />} />
                <Route path="loyalty/rewards/create" element={<LoyaltyRewardForm mode="create" />} />
                <Route path="loyalty/rewards/:id/edit" element={<LoyaltyRewardForm mode="edit" />} />
                <Route path="loyalty/plans" element={<LoyaltyPlans />} />
                <Route path="loyalty/subscriptions" element={<LoyaltySubscriptions />} />
                <Route path="analytics" element={<AdminAnalytics />} />
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
                <Route path="customers/insights" element={<CustomerInsights />} />
                <Route path="customers/targeting" element={<CustomerTargeting />} />
                <Route path="appointments" element={<AppointmentList />} />
                <Route path="appointments/:id" element={<AppointmentDetails />} />
                <Route path="appointments/calendar" element={<AppointmentCalendar />} />
                <Route path="transactions" element={<TransactionList />} />
                <Route path="transactions/add" element={<AddTransaction />} />
                <Route path="transactions/:id" element={<TransactionDetails />} />
                <Route path="daily-business" element={<DailyBusinessList />} />
                <Route path="daily-business/add" element={<AddDailyBusiness />} />
                <Route path="daily-business/analytics" element={<DailyBusinessAnalytics />} />
                <Route path="daily-business/:id" element={<DailyBusinessDetails />} />
                <Route path="daily-business/:id/edit" element={<EditDailyBusiness />} />
                <Route path="notifications" element={<NotificationList />} />
                <Route path="notifications/create" element={<CreateNotification />} />
                <Route path="notifications/:id/analytics" element={<NotificationAnalytics />} />
                <Route path="campaigns" element={<CampaignList />} />
                <Route path="campaigns/create" element={<CreateCampaign />} />
                <Route path="campaigns/:id" element={<CampaignDetails />} />
                <Route path="campaigns/:id/analytics" element={<CampaignAnalytics />} />
                <Route path="campaigns/analytics" element={<CampaignAnalyticsOverview />} />
                <Route path="reports" element={<ManagerReports />} />
                <Route path="business-settings" element={<BusinessSettings />} />
                <Route path="settings" element={<ManagerSettings />} />
                <Route index element={<Navigate to="/manager/dashboard" replace />} />
              </Route>

              {/* Staff Routes */}
              <Route path="/staff" element={<StaffLayout />}>
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="profile" element={<StaffProfile />} />
                <Route path="business" element={<StaffBusiness />} />
                <Route path="transactions" element={<StaffTransactionList />} />
                <Route path="transactions/add" element={<AddStaffTransaction />} />
                <Route path="transactions/:id/edit" element={<EditStaffTransaction />} />
                <Route path="transactions/:id" element={<StaffTransactionDetails />} />
                <Route path="daily-business" element={<StaffDailyBusiness />} />
                <Route path="settings" element={<StaffSettings />} />
                <Route index element={<Navigate to="/staff/dashboard" replace />} />
              </Route>

              {/* Public Routes--for booking appointments */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="features" element={<Features />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="how-it-works" element={<HowItWorks />} />
                <Route path="for-businesses" element={<ForBusinesses />} />
                <Route path="advertise" element={<Advertise />} />
                <Route path="careers" element={<Careers />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="contact" element={<Contact />} />
                <Route path="free-listing" element={<FreeListing />} />
                <Route path="check-appointment" element={<CheckAppointment />} />
                <Route path="appointment/:confirmationCode" element={<AppointmentStatus />} />
                <Route path="book/:businessLink/services" element={<ServiceSelection />} />
                <Route path="book/:businessLink/staff" element={<StaffSelection />} />
                <Route path="book/:businessLink/time" element={<TimeSelection />} />
                <Route path="book/:businessLink/customer" element={<CustomerInfo />} />
                <Route path="book/:businessLink/confirmation" element={<BookingConfirmation />} />
                <Route path=":businessLink" element={<BusinessInfo />} />
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
              <Toaster position="bottom-right" />
            </div>
          </SocketProvider>
        </Router>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}

export default App