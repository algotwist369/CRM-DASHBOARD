import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { store, persistor } from './store'
import { PersistGate } from 'redux-persist/integration/react'
import { SocketProvider } from './contexts/SocketContext'

// Layouts
import { AuthLayout, AdminLayout, ManagerLayout, StaffLayout, PublicLayout } from './layouts'
import WhatsappLead from './pages/admin/WhatsappLeads/WhatsappLead'

// Helper Component for Loading State
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
)

// --- Lazy Load Pages ---

// Auth Pages
const Login = lazy(() => import('./pages/auth').then(module => ({ default: module.Login })))
const ManagerLogin = lazy(() => import('./pages/auth').then(module => ({ default: module.ManagerLogin })))
const StaffLogin = lazy(() => import('./pages/auth').then(module => ({ default: module.StaffLogin })))
const Register = lazy(() => import('./pages/auth').then(module => ({ default: module.Register })))
const ForgotPassword = lazy(() => import('./pages/auth').then(module => ({ default: module.ForgotPassword })))
const ResetPassword = lazy(() => import('./pages/auth').then(module => ({ default: module.ResetPassword })))
const OTPVerification = lazy(() => import('./pages/auth').then(module => ({ default: module.OTPVerification })))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard/AdminDashboard'))

// Admin - Businesses
const BusinessList = lazy(() => import('./pages/admin/Businesses').then(module => ({ default: module.BusinessList })))
const CreateBusiness = lazy(() => import('./pages/admin/Businesses').then(module => ({ default: module.CreateBusiness })))
const EditBusiness = lazy(() => import('./pages/admin/Businesses').then(module => ({ default: module.EditBusiness })))
const BusinessDetails = lazy(() => import('./pages/admin/Businesses').then(module => ({ default: module.BusinessDetails })))
const BusinessAnalytics = lazy(() => import('./pages/admin/Businesses').then(module => ({ default: module.BusinessAnalytics })))
const BusinessStaff = lazy(() => import('./pages/admin/Businesses').then(module => ({ default: module.BusinessStaff })))
const BusinessDailyRecords = lazy(() => import('./pages/admin/Businesses').then(module => ({ default: module.BusinessDailyRecords })))

// Admin - Managers
const ManagerList = lazy(() => import('./pages/admin/Managers').then(module => ({ default: module.ManagerList })))
const CreateManager = lazy(() => import('./pages/admin/Managers').then(module => ({ default: module.CreateManager })))
const ManagerDetails = lazy(() => import('./pages/admin/Managers').then(module => ({ default: module.ManagerDetails })))
const EditManager = lazy(() => import('./pages/admin/Managers').then(module => ({ default: module.EditManager })))
const ManagerPermissions = lazy(() => import('./pages/admin/Managers/ManagerPermissions'))

// Admin - Notifications
const NotificationsList = lazy(() => import('./pages/admin/Notifications').then(module => ({ default: module.NotificationsList })))

// Admin - Daily Business
const AdminDailyBusinessList = lazy(() => import('./pages/admin/DailyBusiness').then(module => ({ default: module.AdminDailyBusinessList })))
const AdminDailyBusinessDetails = lazy(() => import('./pages/admin/DailyBusiness').then(module => ({ default: module.AdminDailyBusinessDetails })))
const AdminDailyBusinessAnalytics = lazy(() => import('./pages/admin/DailyBusiness').then(module => ({ default: module.AdminDailyBusinessAnalytics })))
const AdminCloseDailyBusiness = lazy(() => import('./pages/admin/DailyBusiness').then(module => ({ default: module.AdminCloseDailyBusiness })))

// Admin - Customers
const AdminCustomerList = lazy(() => import('./pages/admin/Customers').then(module => ({ default: module.CustomerList })))
const CustomerForm = lazy(() => import('./pages/admin/Customers').then(module => ({ default: module.CustomerForm })))
const AdminCustomerDetails = lazy(() => import('./pages/admin/Customers').then(module => ({ default: module.CustomerDetails })))

// Admin - Services
const ServiceList = lazy(() => import('./pages/admin/Services').then(module => ({ default: module.ServiceList })))
const ServiceForm = lazy(() => import('./pages/admin/Services').then(module => ({ default: module.ServiceForm })))
const ServiceDetails = lazy(() => import('./pages/admin/Services').then(module => ({ default: module.ServiceDetails })))

// Admin - Appointments
const AdminAppointmentList = lazy(() => import('./pages/admin/Appointments').then(module => ({ default: module.AppointmentList })))
const AppointmentForm = lazy(() => import('./pages/admin/Appointments').then(module => ({ default: module.AppointmentForm })))
const AdminAppointmentDetails = lazy(() => import('./pages/admin/Appointments').then(module => ({ default: module.AppointmentDetails })))

// Admin - Invoices
const InvoiceList = lazy(() => import('./pages/admin/Invoices').then(module => ({ default: module.InvoiceList })))
const InvoiceForm = lazy(() => import('./pages/admin/Invoices').then(module => ({ default: module.InvoiceForm })))

// Admin - Reviews
const ReviewList = lazy(() => import('./pages/admin/Reviews').then(module => ({ default: module.ReviewList })))
const ReviewDetails = lazy(() => import('./pages/admin/Reviews').then(module => ({ default: module.ReviewDetails })))

// Admin - Inquiries
const InquiryList = lazy(() => import('./pages/admin/Inquiries').then(module => ({ default: module.InquiryList })))

// Admin - Campaigns
const AdminCampaignList = lazy(() => import('./pages/admin/Campaigns').then(module => ({ default: module.CampaignList })))
const CampaignForm = lazy(() => import('./pages/admin/Campaigns').then(module => ({ default: module.CampaignForm })))
const CampaignTemplates = lazy(() => import('./pages/admin/Campaigns').then(module => ({ default: module.CampaignTemplates })))
const AdminCampaignDetails = lazy(() => import('./pages/admin/Campaigns').then(module => ({ default: module.CampaignDetails })))
const CampaignTemplateForm = lazy(() => import('./pages/admin/Campaigns').then(module => ({ default: module.CampaignTemplateForm })))
const AutomatedCampaigns = lazy(() => import('./pages/admin/Campaigns').then(module => ({ default: module.AutomatedCampaigns })))
const AutomatedCampaignForm = lazy(() => import('./pages/admin/Campaigns').then(module => ({ default: module.AutomatedCampaignForm })))

// Admin - Loyalty
const LoyaltyRewards = lazy(() => import('./pages/admin/Loyalty').then(module => ({ default: module.LoyaltyRewards })))
const LoyaltyRewardForm = lazy(() => import('./pages/admin/Loyalty').then(module => ({ default: module.LoyaltyRewardForm })))
const LoyaltyPlans = lazy(() => import('./pages/admin/Loyalty').then(module => ({ default: module.LoyaltyPlans })))
const LoyaltySubscriptions = lazy(() => import('./pages/admin/Loyalty').then(module => ({ default: module.LoyaltySubscriptions })))

// Admin - Analytics & Reports
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics').then(module => ({ default: module.AdminAnalytics })))
const ProfitabilityAnalysis = lazy(() => import('./pages/admin/Analytics/ProfitabilityAnalysis'))
const LeadAnalytics = lazy(() => import('./pages/admin/LeadAnalytics/LeadAnalytics'))
const AdminReports = lazy(() => import('./pages/admin/Reports/AdminReports'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings/AdminSettings'))
const AdminProfile = lazy(() => import('./pages/admin/Profile/AdminProfile'))

// Admin - Expenses & Inventory (Phase 3)
const ExpenseList = lazy(() => import('./pages/admin/Expenses/ExpenseList'))
const ExpenseDetails = lazy(() => import('./pages/admin/Expenses/ExpenseDetails'))
const PendingApprovals = lazy(() => import('./pages/admin/Expenses/PendingApprovals'))
const ProductList = lazy(() => import('./pages/admin/Inventory/ProductList'))
const ProductDetails = lazy(() => import('./pages/admin/Inventory/ProductDetails'))
const LowStockAlerts = lazy(() => import('./pages/admin/Inventory/LowStockAlerts'))
const InventoryInsights = lazy(() => import('./pages/admin/Inventory/InventoryInsights'))

// Admin - WhatsApp Setup
const WhatsAppSetup = lazy(() => import('./pages/admin/WhatsAppSetup'))


// Manager Pages
const ManagerDashboard = lazy(() => import('./pages/manager/Dashboard/ManagerDashboard'))

// Manager - Staff
const StaffList = lazy(() => import('./pages/manager/Staff').then(module => ({ default: module.StaffList })))
const AddStaff = lazy(() => import('./pages/manager/Staff').then(module => ({ default: module.AddStaff })))
const EditStaff = lazy(() => import('./pages/manager/Staff').then(module => ({ default: module.EditStaff })))
const StaffDetails = lazy(() => import('./pages/manager/Staff').then(module => ({ default: module.StaffDetails })))

// Manager - Customers
const CustomerList = lazy(() => import('./pages/manager/Customers').then(module => ({ default: module.CustomerList })))
const CustomerDetails = lazy(() => import('./pages/manager/Customers').then(module => ({ default: module.CustomerDetails })))
const CustomerAnalytics = lazy(() => import('./pages/manager/Customers').then(module => ({ default: module.CustomerAnalytics })))
const CustomerSegments = lazy(() => import('./pages/manager/Customers').then(module => ({ default: module.CustomerSegments })))
const CustomerInsights = lazy(() => import('./pages/manager/Customers').then(module => ({ default: module.CustomerInsights })))
const CustomerTargeting = lazy(() => import('./pages/manager/Customers').then(module => ({ default: module.CustomerTargeting })))

// Manager - Appointments
const AppointmentList = lazy(() => import('./pages/manager/Appointments').then(module => ({ default: module.AppointmentList })))
const AppointmentDetails = lazy(() => import('./pages/manager/Appointments').then(module => ({ default: module.AppointmentDetails })))
const AppointmentCalendar = lazy(() => import('./pages/manager/Appointments').then(module => ({ default: module.AppointmentCalendar })))

// Manager - Leads (uses shared WhatsappLead component with role-based filtering)
const ManagerLeads = lazy(() => import('./pages/admin/WhatsappLeads/WhatsappLead'))

// Manager - Transactions
const TransactionList = lazy(() => import('./pages/manager/Transactions').then(module => ({ default: module.TransactionList })))
const AddTransaction = lazy(() => import('./pages/manager/Transactions').then(module => ({ default: module.AddTransaction })))
const EditTransaction = lazy(() => import('./pages/manager/Transactions').then(module => ({ default: module.EditTransaction })))
const TransactionDetails = lazy(() => import('./pages/manager/Transactions').then(module => ({ default: module.TransactionDetails })))


// Manager - Daily Business
const DailyBusinessList = lazy(() => import('./pages/manager/DailyBusiness').then(module => ({ default: module.DailyBusinessList })))
const AddDailyBusiness = lazy(() => import('./pages/manager/DailyBusiness').then(module => ({ default: module.AddDailyBusiness })))
const DailyBusinessDetails = lazy(() => import('./pages/manager/DailyBusiness').then(module => ({ default: module.DailyBusinessDetails })))
const EditDailyBusiness = lazy(() => import('./pages/manager/DailyBusiness').then(module => ({ default: module.EditDailyBusiness })))
const DailyBusinessAnalytics = lazy(() => import('./pages/manager/DailyBusiness').then(module => ({ default: module.DailyBusinessAnalytics })))
const CloseDailyBusiness = lazy(() => import('./pages/manager/DailyBusiness/CloseDailyBusiness'))

// Manager - Notifications
const NotificationList = lazy(() => import('./pages/manager/Notifications').then(module => ({ default: module.NotificationList })))
const CreateNotification = lazy(() => import('./pages/manager/Notifications').then(module => ({ default: module.CreateNotification })))
const NotificationAnalytics = lazy(() => import('./pages/manager/Notifications').then(module => ({ default: module.NotificationAnalytics })))

// Manager - Campaigns
const CampaignList = lazy(() => import('./pages/manager/Campaigns').then(module => ({ default: module.CampaignList })))
const CreateCampaign = lazy(() => import('./pages/manager/Campaigns').then(module => ({ default: module.CreateCampaign })))
const CampaignDetails = lazy(() => import('./pages/manager/Campaigns').then(module => ({ default: module.CampaignDetails })))
const CampaignAnalytics = lazy(() => import('./pages/manager/Campaigns').then(module => ({ default: module.CampaignAnalytics })))
const CampaignAnalyticsOverview = lazy(() => import('./pages/manager/Campaigns').then(module => ({ default: module.CampaignAnalyticsOverview })))

// Manager - Others
const ManagerReports = lazy(() => import('./pages/manager/Reports/ManagerReports'))
const ManagerSettings = lazy(() => import('./pages/manager/ManagerSettings/ManagerSettings'))
const MyExpenses = lazy(() => import('./pages/manager/Expenses/MyExpenses'))
const StockManagement = lazy(() => import('./pages/manager/Inventory/StockManagement'))


// Staff Pages
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard/StaffDashboard'))
const StaffProfile = lazy(() => import('./pages/staff/Profile/StaffProfile'))
const StaffBusiness = lazy(() => import('./pages/staff/Business/StaffBusiness'))
const StaffSettings = lazy(() => import('./pages/staff/StaffSettings/StaffSettings'))


// Public Pages
const Home = lazy(() => import('./pages/public').then(module => ({ default: module.Home })))
const Features = lazy(() => import('./pages/public').then(module => ({ default: module.Features })))
const Pricing = lazy(() => import('./pages/public').then(module => ({ default: module.Pricing })))
const HowItWorks = lazy(() => import('./pages/public').then(module => ({ default: module.HowItWorks })))
const ForBusinesses = lazy(() => import('./pages/public').then(module => ({ default: module.ForBusinesses })))
const Advertise = lazy(() => import('./pages/public').then(module => ({ default: module.Advertise })))
const Careers = lazy(() => import('./pages/public').then(module => ({ default: module.Careers })))
const Notifications = lazy(() => import('./pages/public').then(module => ({ default: module.Notifications })))
const Contact = lazy(() => import('./pages/public').then(module => ({ default: module.Contact })))
const FreeListing = lazy(() => import('./pages/public').then(module => ({ default: module.FreeListing })))
const BookDemo = lazy(() => import('./pages/public').then(module => ({ default: module.BookDemo })))
const GoogleMyBusinessReviews = lazy(() => import('./pages/public').then(module => ({ default: module.GoogleMyBusinessReviews })))
const FacebookReviews = lazy(() => import('./pages/public').then(module => ({ default: module.FacebookReviews })))
const YelpReviews = lazy(() => import('./pages/public').then(module => ({ default: module.YelpReviews })))
const TripAdvisorReviews = lazy(() => import('./pages/public').then(module => ({ default: module.TripAdvisorReviews })))
const ReviewsManagement = lazy(() => import('./pages/public').then(module => ({ default: module.ReviewsManagement })))
const YelpPlaybook = lazy(() => import('./pages/public').then(module => ({ default: module.YelpPlaybook })))
const Search = lazy(() => import('./pages/public').then(module => ({ default: module.Search })))

const BusinessInfo = lazy(() => import('./pages/public/Booking').then(module => ({ default: module.BusinessInfo })))
const ServiceSelection = lazy(() => import('./pages/public/Booking').then(module => ({ default: module.ServiceSelection })))
const StaffSelection = lazy(() => import('./pages/public/Booking').then(module => ({ default: module.StaffSelection })))
const TimeSelection = lazy(() => import('./pages/public/Booking').then(module => ({ default: module.TimeSelection })))
const CustomerInfo = lazy(() => import('./pages/public/Booking').then(module => ({ default: module.CustomerInfo })))
const BookingConfirmation = lazy(() => import('./pages/public/Booking').then(module => ({ default: module.BookingConfirmation })))

const AppointmentStatus = lazy(() => import('./pages/public/AppointmentStatus/AppointmentStatus'))
const CheckAppointment = lazy(() => import('./pages/public/CheckAppointment/CheckAppointment'))

// Shared Pages
const Error = lazy(() => import('./pages/shared').then(module => ({ default: module.Error })))
const NotFound = lazy(() => import('./pages/shared').then(module => ({ default: module.NotFound })))
const Unauthorized = lazy(() => import('./pages/shared').then(module => ({ default: module.Unauthorized })))
const BusinessSettings = lazy(() => import('./pages/shared/BusinessSettings/BusinessSettings'))

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
                <Suspense fallback={<LoadingFallback />}>
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
                      {/* notifications */}
                      <Route path="notifications" element={<NotificationsList />} />
                      {/* business routes */}
                      <Route path="businesses" element={<BusinessList />} />
                      <Route path="businesses/create" element={<CreateBusiness />} />
                      <Route path="businesses/:id/analytics" element={<BusinessAnalytics />} />
                      <Route path="businesses/:id/staff" element={<BusinessStaff />} />
                      <Route path="businesses/:id/daily-records" element={<BusinessDailyRecords />} />
                      <Route path="businesses/:id/edit" element={<EditBusiness />} />
                      <Route path="businesses/:id/settings" element={<BusinessSettings />} />
                      <Route path="businesses/:id" element={<BusinessDetails />} />
                      {/* manager routes */}
                      <Route path="managers" element={<ManagerList />} />
                      <Route path="managers/create" element={<CreateManager />} />
                      <Route path="managers/:id/edit" element={<EditManager />} />
                      <Route path="managers/:id" element={<ManagerDetails />} />
                      {/* daily business routes */}
                      <Route path="daily-business" element={<AdminDailyBusinessList />} />
                      <Route path="daily-business/analytics" element={<AdminDailyBusinessAnalytics />} />
                      <Route path="daily-business/close" element={<AdminCloseDailyBusiness />} />
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
                      <Route path="inquiries" element={<InquiryList />} />
                      {/* campaign routes */}
                      <Route path="campaigns" element={<AdminCampaignList />} />
                      <Route path="campaigns/create" element={<CampaignForm mode="create" />} />
                      <Route path="campaigns/:id/edit" element={<CampaignForm mode="edit" />} />
                      <Route path="campaigns/:id" element={<AdminCampaignDetails />} />
                      <Route path="campaigns/templates" element={<CampaignTemplates />} />
                      <Route path="campaigns/templates/create" element={<CampaignTemplateForm mode="create" />} />
                      <Route path="campaigns/templates/:id/edit" element={<CampaignTemplateForm mode="edit" />} />
                      <Route path="campaigns/automated" element={<AutomatedCampaigns />} />
                      <Route path="campaigns/automated/create" element={<AutomatedCampaignForm mode="create" />} />
                      <Route path="campaigns/automated/:id/edit" element={<AutomatedCampaignForm mode="edit" />} />
                      {/* loyalty routes */}
                      <Route path="loyalty/rewards" element={<LoyaltyRewards />} />
                      <Route path="loyalty/rewards/create" element={<LoyaltyRewardForm mode="create" />} />
                      <Route path="loyalty/rewards/:id/edit" element={<LoyaltyRewardForm mode="edit" />} />
                      <Route path="loyalty/plans" element={<LoyaltyPlans />} />
                      <Route path="loyalty/subscriptions" element={<LoyaltySubscriptions />} />
                      {/* analytics routes */}
                      <Route path="analytics" element={<AdminAnalytics />} />
                      {/* Phase 3: expense routes */}
                      <Route path="expenses" element={<ExpenseList />} />
                      <Route path="expenses/pending" element={<PendingApprovals />} />
                      <Route path="expenses/:id" element={<ExpenseDetails />} />
                      {/* Phase 3: inventory routes */}
                      <Route path="inventory/products" element={<ProductList />} />
                      <Route path="inventory/products/:id" element={<ProductDetails />} />
                      <Route path="inventory/low-stock" element={<LowStockAlerts />} />
                      <Route path="inventory/insights" element={<InventoryInsights />} />
                      {/* Phase 3: manager permissions & analytics */}
                      <Route path="managers/permissions" element={<ManagerPermissions />} />
                      <Route path="analytics/profitability" element={<ProfitabilityAnalysis />} />
                      {/* reports routes */}

                      {/* Lead Analytics Route */}
                      <Route path="lead-analytics" element={<LeadAnalytics />} />

                      <Route path="reports" element={<AdminReports />} />
                      {/* settings routes */}
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="profile" element={<AdminProfile />} />
                      {/* WhatsApp setup route */}
                      <Route path="whatsapp-setup" element={<WhatsAppSetup />} />
                      <Route path="watsapp-leads" element={<WhatsappLead />} />
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
                      <Route path="appointments/calendar" element={<AppointmentCalendar />} />
                      <Route path="appointments/:id" element={<AppointmentDetails />} />
                      <Route path="transactions" element={<TransactionList />} />
                      <Route path="transactions/add" element={<AddTransaction />} />
                      <Route path="transactions/:id" element={<TransactionDetails />} />
                      <Route path="transactions/:id/edit" element={<EditTransaction />} />
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
                      <Route path="inquiries" element={<InquiryList />} />
                      <Route path="watsapp-leads" element={<ManagerLeads />} />
                      <Route path="reports" element={<ManagerReports />} />
                      {/* Phase 3: expense & inventory routes */}
                      <Route path="expenses" element={<MyExpenses />} />
                      <Route path="inventory/stock" element={<StockManagement />} />
                      <Route path="daily-business/close" element={<CloseDailyBusiness />} />
                      <Route path="business-settings" element={<BusinessSettings />} />
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
                      <Route path="spa" element={<Search />} />
                      <Route path="search" element={<Search />} />
                      <Route path="spas" element={<Search />} />
                      <Route path="spa/:location" element={<Search />} />
                      <Route path="spa/:location/:query" element={<Search />} />
                      <Route path="contact2" element={<Contact />} />
                      <Route path="free-listing" element={<FreeListing />} />
                      <Route path="book-demo" element={<BookDemo />} />
                      <Route path="google-my-business-reviews" element={<GoogleMyBusinessReviews />} />
                      <Route path="facebook-reviews" element={<FacebookReviews />} />
                      <Route path="yelp-reviews" element={<YelpReviews />} />
                      <Route path="tripadvisor-reviews" element={<TripAdvisorReviews />} />
                      <Route path="reviews-management" element={<ReviewsManagement />} />
                      <Route path="resources/yelp-playbook" element={<YelpPlaybook />} />
                      <Route path="check-appointment" element={<CheckAppointment />} />
                      <Route path="appointment/:confirmationCode" element={<AppointmentStatus />} />
                      <Route path=":businessLink" element={<BusinessInfo />} />
                      <Route path="book/:businessLink/services" element={<ServiceSelection />} />
                      <Route path="book/:businessLink/staff" element={<StaffSelection />} />
                      <Route path="book/:businessLink/time" element={<TimeSelection />} />
                      <Route path="book/:businessLink/customer" element={<CustomerInfo />} />
                      <Route path="book/:businessLink/confirmation" element={<BookingConfirmation />} />
                    </Route>

                    {/* Shared Routes */}
                    <Route path="/error" element={<Error />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<NotFound />} />

                    {/* Legacy Routes for backward compatibility */}
                    <Route path="/login" element={<Navigate to="/auth/login" replace />} />
                    <Route path="/ak_signup" element={<Navigate to="/auth/ak_signup" replace />} />
                  </Routes>
                </Suspense>
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