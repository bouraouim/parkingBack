# Parking Payment Machine Backend

Backend server for the Parking Payment Machine Assistant mobile application.

## Features

- **JWT Authentication** - Secure login with username and password
- **Mission Management** - Create, track, and update parking machine missions
- **FCM Push Notifications** - Real-time mission notifications via Firebase Cloud Messaging
- **User Management** - FCM token registration and management
- **Mission Status Tracking** - Track missions through unopened, in_progress, and completed states
- **History Logging** - Complete audit trail of mission actions

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing
- Firebase Admin SDK for push notifications
- Joi for validation

## Installation

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `PORT` - Server port (default: 3000)
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `JWT_EXPIRES_IN` - Token expiration time
   - `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase service account JSON

4. **Configure Firebase**
   - Download your Firebase service account JSON from Firebase Console
   - Place it in `config/firebase-service-account.json`

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running locally or use a cloud instance
   ```

6. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "worker1",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "worker1"
  }
}
```

### User Management

#### Register FCM Token
```http
POST /api/users/:id/fcm-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "FCM_TOKEN_HERE"
}
```

#### Remove FCM Token
```http
DELETE /api/users/:id/fcm-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "FCM_TOKEN_HERE"
}
```

### Missions

#### Get All Missions
```http
GET /api/missions
Authorization: Bearer <token>

Response: Array of missions sorted by status (unopened first) and date
```

#### Get Mission by ID
```http
GET /api/missions/:id
Authorization: Bearer <token>

Response: Mission object with full details
```

#### Open Mission
```http
POST /api/missions/:id/open
Authorization: Bearer <token>

Response: Updated mission with status changed to "in_progress"
```

#### Update Mission
```http
POST /api/missions/:id/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "tasks": { /* optional task validation results */ },
  "note": "Optional note"
}
```

#### Create Mission (Admin)
```http
POST /api/missions
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "mission-001",
  "date": "2025-11-26",
  "cashier": "John Doe",
  "machineName": "Machine A1",
  "collect": {
    "noteAmount": 500,
    "coinAmount": 200
  },
  "refill": {
    "coins": {
      "amount": 100,
      "coinTypes": {
        "1": 50,
        "2": 50
      }
    },
    "notes": {
      "amount": 500,
      "noteTypes": {
        "10": 30,
        "20": 20
      }
    }
  },
  "maintenance": ["Clean screen", "Check printer"],
  "qrCode": "QR12345"
}
```

### Health Check

```http
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2025-11-26T10:00:00.000Z",
  "database": "connected"
}
```

## Data Models

### User
```javascript
{
  username: String (unique),
  passwordHash: String,
  fcmTokens: [
    {
      token: String,
      createdAt: Date
    }
  ]
}
```

### Mission
```javascript
{
  missionId: String (unique),
  payload: Object (full mission data),
  status: "unopened" | "in_progress" | "completed",
  openedAt: Date,
  openedBy: ObjectId (User),
  completedAt: Date,
  history: [
    {
      action: String,
      by: ObjectId (User),
      at: Date,
      note: String
    }
  ]
}
```

## Mission Payload Structure

```javascript
{
  id: "mission-001",
  date: "2025-11-26",
  cashier: "John Doe",
  machineName: "Machine A1",
  collect: {
    noteAmount: 500,
    coinAmount: 200
  },
  refill: {
    coins: {
      amount: 100,
      coinTypes: {
        "1": 50,
        "2": 50
      }
    },
    notes: {
      amount: 500,
      noteTypes: {
        "10": 30,
        "20": 20
      }
    }
  },
  maintenance: ["Clean screen", "Check printer"],
  qrCode: "QR12345"
}
```

## Creating a Test User

You can create a test user using MongoDB shell or a script:

```javascript
// Create a file: scripts/createUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createUser(username, password) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      passwordHash,
      fcmTokens: []
    });
    
    await user.save();
    console.log('User created:', username);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

createUser('worker1', 'password123');
```

Run with: `node scripts/createUser.js`

## FCM Notification Format

When a mission is created, FCM notifications are sent with the following data payload:

```javascript
{
  data: {
    id: "mission-001",
    payload: JSON.stringify({
      // Full mission payload
    })
  }
}
```

The mobile app handles this notification in foreground/background and displays mission details.

## Mission Workflow

1. **Admin creates mission** → POST /api/missions
2. **FCM notification sent** to all workers
3. **Worker receives notification** and sees mission in app
4. **Worker opens mission** → POST /api/missions/:id/open (status: unopened → in_progress)
5. **Worker completes tasks** and submits
6. **Worker updates mission** → POST /api/missions/:id/update (status: completed)

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message here"
}
```

## Security Features

- Passwords hashed with bcrypt
- JWT-based authentication
- Protected API routes with auth middleware
- Environment variables for sensitive data
- Firebase service account kept secure

## Development

```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Run in development mode
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Use a production MongoDB instance (MongoDB Atlas recommended)
4. Secure your Firebase service account JSON
5. Enable HTTPS/SSL
6. Consider using PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name parking-backend
   ```

## License

ISC
