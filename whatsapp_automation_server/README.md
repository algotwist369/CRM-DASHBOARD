# WhatsApp Automation Server

Automatically fetches customer leads from a public Google Sheet and sends each lead to all managers of the same location via WhatsApp using Twilio.

## 🚀 Features

- ✅ **Redis Queue-Based Processing** - Scalable async lead processing
- ✅ Automatic lead processing from Google Sheets
- ✅ Location-based routing to managers
- ✅ Multiple managers per location support
- ✅ Duplicate lead prevention
- ✅ WhatsApp delivery tracking
- ✅ Manual trigger + automated cron (every 5 minutes)
- ✅ Retry mechanism for failed WhatsApp sends (3 attempts with exponential backoff)
- ✅ Phone number validation and sanitization
- ✅ Case-insensitive location matching
- ✅ Health check endpoint with Redis status
- ✅ Queue monitoring endpoints
- ✅ Graceful shutdown handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- **Redis** (for queue system - can use localhost or cloud Redis)
- Twilio account with WhatsApp API access
- Public Google Sheet with leads data

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whatsapp_automation_server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install and start Redis** (if not already installed)
   
   **Windows:**
   - Download Redis from: https://github.com/microsoftarchive/redis/releases
   - Or use WSL: `wsl sudo apt-get install redis-server`
   - Start Redis: `redis-server`
   
   **Linux/Mac:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis
   
   # Mac (using Homebrew)
   brew install redis
   brew services start redis
   ```
   
   **Or use Redis Cloud** (free tier available): https://redis.com/cloud/

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your configuration:
   - `MONGO_URI`: Your MongoDB connection string
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
   - `TWILIO_WHATSAPP_NUMBER`: Your Twilio WhatsApp number (e.g., `whatsapp:+919152880134` or just `+919152880134`)
   - `TWILIO_CONTENT_TEMPLATE_SID`: Your Twilio Content Template SID (default: `HXed5b43cbf2bd268e7f423274015b46df`)
   - `GOOGLE_SHEET_CSV_URL`: Public CSV export URL of your Google Sheet
   - `REDIS_HOST`: Redis host (optional, default: `localhost`)
   - `REDIS_PORT`: Redis port (optional, default: `6379`)
   - `REDIS_PASSWORD`: Redis password (optional, if required)
   - `REDIS_DB`: Redis database number (optional, default: `0`)
   
   **Example `.env` file:**
   ```
   MONGO_URI=mongodb://localhost:27017/whatsapp_automation
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+919152880134
   TWILIO_CONTENT_TEMPLATE_SID=HXed5b43cbf2bd268e7f423274015b46df
   GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## 📊 Google Sheet Format

Your Google Sheet must have the following columns:

| Customer Name | Location | Customer Phone |
|--------------|----------|----------------|
| Kushal Suvarna | Vashi | 918108811811 |
| Rahul Patil | Andheri | 919876543210 |

**Note**: 
- Column headers must match exactly: `Customer Name`, `Location`, `Customer Phone`
- Location matching is case-insensitive
- Phone numbers will be automatically sanitized and formatted

## 📱 WhatsApp Message Format

Messages are sent using Twilio Content Template API with the following format:

```
New inquiry for {{1}}.

Name {{2}}, Phone {{3}}.

Regards,

SpaAdvisor Team
```

**Template SID**: `HXed5b43cbf2bd268e7f423274015b46df`

**Variable Mapping**:
- `{{1}}` = Location
- `{{2}}` = Customer Name
- `{{3}}` = Customer Phone

## 🔌 API Endpoints

### Health Check
```
GET /health
```
Returns server status and database connection status.

### Leads

#### Get All Leads Delivery Details (Recommended)
```
GET /api/leads/delivery
```
**Best route to see kitne managers ko lead send hua aur kon sa lead send hua**

#### Sync Leads (Manual Trigger)
```
POST /api/leads/sync
```
Manually trigger lead synchronization and WhatsApp sending.

**Response:**
```json
{
  "success": true,
  "message": "Leads synced and sent successfully",
  "data": {
    "processed_leads": 5,
    "whatsapp_sent": 10,
    "errors": 0,
    "skipped_no_managers": 0
  }
}
```

#### Get All Leads
```
GET /api/leads?sent=true&location=vashi&limit=100&skip=0
```
Query parameters:
- `sent`: Filter by sent status (true/false)
- `location`: Filter by location (case-insensitive)
- `limit`: Number of results (default: 100)
- `skip`: Number of results to skip (default: 0)

#### Get Lead Statistics
```
GET /api/leads/stats
```
Returns statistics about leads and WhatsApp messages sent.

#### Get Leads Delivery Details (Kitne Managers Ko Send Hua)
```
GET /api/leads/delivery?sent=true&location=vashi&limit=100&skip=0
```
Shows all leads with detailed delivery information including:
- Which managers received each lead
- How many managers received the lead (`sent_to_count`)
- Total managers for that location
- Delivery status (complete/partial/pending)
- Failed sends if any

**Query Parameters:**
- `sent`: Filter by sent status (true/false)
- `location`: Filter by location
- `limit`: Number of results (default: 100)
- `skip`: Number of results to skip (default: 0)

**Response Example:**
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "data": [
    {
      "_id": "...",
      "customer_name": "Kushal Suvarna",
      "customer_phone": "918108811811",
      "location": "vashi",
      "sent": true,
      "sent_to_count": 2,
      "total_managers_for_location": 2,
      "failed_sends_count": 0,
      "sent_at": "2024-01-01T10:00:00.000Z",
      "delivery_status": "complete",
      "managers": [
        {
          "_id": "...",
          "whatsapp_number": "+919999999999",
          "received": true
        },
        {
          "_id": "...",
          "whatsapp_number": "+918888888888",
          "received": true
        }
      ]
    }
  ]
}
```

#### Get Specific Lead Delivery Details
```
GET /api/leads/:id/delivery
```
Returns detailed delivery information for a specific lead including all managers and their delivery status.

#### Get Failed/Unsent Leads
```
GET /api/leads/failed?location=vashi&limit=100&skip=0
```
Returns all leads that failed to send or are unsent. Use this to see which leads need manual retry.

**Query Parameters:**
- `location`: Filter by location (optional)
- `limit`: Number of results (default: 100)
- `skip`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "data": [
    {
      "_id": "...",
      "customer_name": "John Doe",
      "customer_phone": "+919876543210",
      "location": "vashi",
      "sent_to_count": 0,
      "total_managers_for_location": 2,
      "failed_sends_count": 0,
      "failed_sends": [],
      "retry_reason": "not_sent",
      "createdAt": "..."
    }
  ]
}
```

#### Retry Sending a Specific Lead
```
POST /api/leads/:id/retry
Content-Type: application/json

{
  "retryFailedOnly": true  // Optional: only retry to managers who previously failed
}
```
Manually retry sending a lead to managers. Only sends to managers who haven't received it yet.

**Response:**
```json
{
  "success": true,
  "message": "Lead retry completed",
  "data": {
    "status": "complete",
    "sent_to_count": 2,
    "total_managers": 2,
    "retried_to": 2,
    "successful_this_retry": 2,
    "failed_this_retry": 0,
    "is_complete": true
  }
}
```

#### Bulk Retry Multiple Leads
```
POST /api/leads/bulk-retry
Content-Type: application/json

{
  "leadIds": ["id1", "id2", "id3"],
  "retryFailedOnly": true  // Optional
}
```
Retry sending multiple leads at once. Useful for processing multiple failed leads.

#### Get Queue Status
```
GET /api/leads/queue/status
```
Returns current queue statistics (waiting, active, completed, failed jobs).

**Response:**
```json
{
  "success": true,
  "data": {
    "waiting": 5,
    "active": 2,
    "completed": 150,
    "failed": 3,
    "delayed": 0,
    "total": 160
  }
}
```

#### Get Queue Jobs
```
GET /api/leads/queue/jobs?status=all&limit=50
```
Returns queue jobs with optional filters:
- `status`: `waiting`, `active`, `completed`, `failed`, or `all` (default: `all`)
- `limit`: Number of jobs to return (default: 50)

### Analytics

#### Get Analytics Dashboard
```
GET /api/analytics?period=today&location=vashi
```

Comprehensive analytics showing leads sent by location, managers who received leads, and more.

**Query Parameters:**
- `period`: `today`, `yesterday`, `tomorrow`, `custom`, or `all` (default: `today`)
- `startDate`: Start date for custom period (format: `YYYY-MM-DD`)
- `endDate`: End date for custom period (format: `YYYY-MM-DD`)
- `location`: Filter by specific location (optional)

**Examples:**
```
GET /api/analytics?period=today
GET /api/analytics?period=yesterday
GET /api/analytics?period=tomorrow
GET /api/analytics?period=custom&startDate=2024-01-01&endDate=2024-01-31
GET /api/analytics?period=all
GET /api/analytics?period=today&location=vashi
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date_range": {
      "start": "2024-01-17T00:00:00.000Z",
      "end": "2024-01-18T00:00:00.000Z",
      "period": "today"
    },
    "summary": {
      "total_leads_sent": 25,
      "total_whatsapp_messages_sent": 50,
      "total_unsent_leads": 5,
      "total_leads_in_system": 30,
      "unique_locations": 3,
      "average_messages_per_lead": "2.00"
    },
    "by_location": [
      {
        "location": "vashi",
        "total_leads_sent": 10,
        "total_whatsapp_messages_sent": 20,
        "total_managers_in_location": 2,
        "managers_who_received_leads": 2,
        "average_leads_per_manager": "10.00",
        "average_messages_per_lead": "2.00"
      },
      {
        "location": "andheri",
        "total_leads_sent": 15,
        "total_whatsapp_messages_sent": 30,
        "total_managers_in_location": 3,
        "managers_who_received_leads": 3,
        "average_leads_per_manager": "10.00",
        "average_messages_per_lead": "2.00"
      }
    ],
    "daily_breakdown": [
      {
        "date": "2024-01-17",
        "leads_sent": 25,
        "whatsapp_sent": 50
      }
    ]
  }
}
```

### Managers

#### Add Manager
```
POST /api/managers
Content-Type: application/json

{
  "location": "Vashi",
  "whatsapp_number": "+919999999999"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Manager added successfully",
  "data": {
    "_id": "...",
    "location": "vashi",
    "whatsapp_number": "+919999999999",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Get All Managers
```
GET /api/managers
```

#### Get Managers by Location
```
GET /api/managers/location/:location
```

#### Delete Manager
```
DELETE /api/managers/:id
```

## ⏰ Automated Processing

The system uses **Redis-based queues** for scalable, asynchronous lead processing:

1. **Cron Job** (runs every 5 minutes):
   - Fetches leads from Google Sheet
   - Adds each lead to Redis queue for processing
   - Returns immediately (non-blocking)

2. **Queue Worker** (runs continuously):
   - Processes leads from queue asynchronously
   - Saves leads to database (ignores duplicates)
   - Finds managers for each lead's location
   - Sends WhatsApp messages to all matching managers in parallel
   - Updates lead status and delivery count
   - Handles retries automatically (3 attempts with exponential backoff)

### Benefits of Queue System:
- ✅ **Scalable**: Can handle hundreds of leads efficiently
- ✅ **Non-blocking**: API responses are instant
- ✅ **Resilient**: Failed jobs are automatically retried
- ✅ **Monitoring**: Track queue status and job progress
- ✅ **Parallel Processing**: Multiple workers can process jobs simultaneously

## 🔄 Retry Mechanism

If a WhatsApp message fails to send, the system will automatically retry up to 3 times with exponential backoff (1s, 2s, 4s delays).

## 📋 Duplicate Lead Handling

The system uses smart duplicate detection:

- ✅ **Same phone, different location** → Allowed (not a duplicate)
- ✅ **Same phone, same location, after 24 hours** → Allowed (treated as new lead)
- ❌ **Same phone, same location, within 24 hours** → Skipped (duplicate)

**Examples:**
- Lead: Phone `+919876543210` at `Vashi` (Day 1) → ✅ Processed
- Lead: Phone `+919876543210` at `Andheri` (Day 1) → ✅ Processed (different location)
- Lead: Phone `+919876543210` at `Vashi` (Day 1, same day) → ❌ Skipped (duplicate within 24h)
- Lead: Phone `+919876543210` at `Vashi` (Day 2, after 24h) → ✅ Processed (new lead after 24h)

## 📝 Database Schema

### Lead Model
```javascript
{
  customer_name: String,
  customer_phone: String (required),
  location: String (required, lowercase),
  sent: Boolean (default: false),
  sent_to_count: Number (default: 0),
  sent_at: Date,
  failed_sends: [String], // Array of manager numbers that failed
  createdAt: Date,
  updatedAt: Date
}
```

### Manager Model
```javascript
{
  location: String (required, lowercase),
  whatsapp_number: String (required, unique),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Notes

- **No authentication**: This API does not include authentication. If deploying to production, add authentication middleware.
- Input validation is performed on all endpoints
- Phone numbers are validated and sanitized before storage
- SQL injection protection via Mongoose ODM

## 🐛 Error Handling

- All errors are logged with timestamps
- API errors return consistent JSON responses
- Unhandled errors are caught and logged
- Graceful shutdown on SIGTERM/SIGINT

## 📈 Monitoring

- Health check endpoint: `/health`
- Structured logging with timestamps
- Error tracking in logs
- Lead statistics endpoint: `/api/leads/stats`

## 🚨 Troubleshooting

### Leads not being sent
1. Check if managers exist for the location (case-insensitive)
2. Verify Twilio credentials are correct
3. Check server logs for errors
4. Verify Google Sheet URL is accessible and format is correct

### Duplicate leads
- The system prevents duplicates based on `location + customer_phone` combination
- If you see duplicates, check for case differences in location or phone formatting

### WhatsApp messages not sending
1. Verify Twilio WhatsApp number is correct format: `whatsapp:+14155238886`
2. Check Twilio account balance
3. Verify recipient numbers are in correct format
4. Check Twilio console for error messages

## 📄 License

ISC

## 👥 Support

For issues or questions, please check the logs and verify your configuration matches the requirements above.

