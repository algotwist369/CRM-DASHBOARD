# CRM Dashboard Backend

A comprehensive CRM system for managing salons, spas, and hotels with multi-role access (Admin, Manager, Staff).

## Features

- **Multi-role Authentication**: Admin, Manager, and Staff roles with different permissions
- **Business Management**: Create and manage multiple business locations
- **Staff Management**: Add, update, and manage staff members
- **Daily Reports**: Track daily business transactions and revenue
- **Analytics**: Revenue trends and staff performance analytics
- **Notifications**: Email and SMS notifications with OTP verification
- **Export Reports**: Export data to CSV and PDF formats
- **Caching**: Redis-based caching for improved performance

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access + Refresh tokens)
- **Email**: Nodemailer
- **SMS**: Twilio
- **Caching**: Redis (optional, falls back to in-memory cache)
- **Validation**: Joi
- **Security**: Helmet, CORS, bcrypt

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CRM-DASHBOARD
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/crm-dashboard
   
   # JWT Secrets
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=1h
   REFRESH_SECRET=your-refresh-secret-key-here
   REFRESH_EXPIRES_IN=7d
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=no-reply@yourcompany.com
   
   # Twilio SMS Configuration
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_FROM=+1234567890
   
   # Redis (Optional)
   REDIS_URL=redis://localhost:6379
   
   # OTP Configuration
   OTP_LENGTH=4
   OTP_TTL_MIN=10
   OTP_SECRET=your-otp-secret-key
   
   # Bcrypt
   BCRYPT_SALT_ROUNDS=12
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Admin registration
- `POST /api/auth/login` - Admin/Manager login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP

### Admin Routes
- `POST /api/admin/business` - Create business
- `GET /api/admin/businesses` - Get all businesses
- `PUT /api/admin/business/:id` - Update business
- `DELETE /api/admin/business/:id` - Delete business
- `POST /api/admin/manager` - Create manager

### Business Routes
- `POST /api/business` - Create business (Admin only)
- `GET /api/business` - Get businesses
- `GET /api/business/:id` - Get business by ID
- `PUT /api/business/:id` - Update business (Admin only)
- `DELETE /api/business/:id` - Delete business (Admin only)

### Manager Routes
- `POST /api/manager/staff` - Add staff
- `GET /api/manager/staff` - Get staff list
- `PUT /api/manager/staff/:id` - Update staff
- `DELETE /api/manager/staff/:id` - Delete staff
- `POST /api/manager/report` - Add daily report
- `GET /api/manager/report` - Get daily reports

### Staff Routes
- `GET /api/staff/profile` - Get profile
- `PUT /api/staff/profile` - Update profile
- `POST /api/staff/task` - Add task
- `GET /api/staff/tasks` - Get tasks

### Reports
- `GET /api/reports` - Get reports
- `GET /api/reports/analytics` - Get analytics
- `GET /api/reports/export` - Export reports

### Notifications
- `POST /api/notifications/email` - Send email
- `POST /api/notifications/sms` - Send SMS
- `POST /api/notifications/otp/send` - Send OTP
- `POST /api/notifications/otp/verify` - Verify OTP

## Database Models

### Admin
- Company information and authentication
- Manages multiple businesses

### Business
- Business details (salon/spa/hotel)
- Linked to admin and managers

### Manager
- Business-specific managers
- PIN-based authentication
- Manages staff and daily reports

### Staff
- Business staff members
- Linked to managers

### DailyBusiness
- Daily transaction records
- Revenue and customer tracking

### Transaction
- Individual customer transactions
- Service details and pricing

### OTP
- OTP verification records
- TTL-based expiration

## Security Features

- JWT-based authentication with refresh tokens
- Role-based access control
- Password hashing with bcrypt
- Input validation with Joi
- CORS and security headers
- Rate limiting ready

## Performance Features

- Redis caching (optional)
- Database indexing
- Pagination support
- Efficient queries with population

## Development

The project follows a clean architecture pattern:
- **Controllers**: Handle HTTP requests and responses
- **Models**: Define database schemas
- **Routes**: Define API endpoints
- **Middleware**: Authentication, authorization, and error handling
- **Utils**: Helper functions for common operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
