# Quick Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Firebase project with Cloud Messaging enabled

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure MongoDB

**Option A: Local MongoDB**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service
- Use default connection: `mongodb://localhost:27017/parking-payment-machine`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string and update `.env` file

### 3. Configure Environment Variables

The `.env` file is already created with default values. Update if needed:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/parking-payment-machine
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=7d
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

### 4. Configure Firebase (for Push Notifications)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Rename it to `firebase-service-account.json`
7. Place it in the `config/` folder

**Note:** If you skip this step, the server will still work but push notifications won't be sent.

### 5. Create a Test User

```bash
npm run create-user worker1 password123
```

This creates a user with:
- Username: `worker1`
- Password: `password123`

### 6. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✓ Connected to MongoDB
✓ Firebase Admin SDK initialized successfully
✓ Server running on port 3000
✓ Environment: development
✓ API Base URL: http://localhost:3000
```

### 7. Test the API

**Test health endpoint:**
```bash
curl http://localhost:3000/health
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"worker1","password":"password123"}'
```

You'll get a response with a JWT token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "worker1"
  }
}
```

### 8. Create a Sample Mission (Optional)

```bash
npm run create-sample-mission
```

## Testing with Postman or Thunder Client

1. **Import the following endpoints:**

   - `POST http://localhost:3000/auth/login` - Login
   - `GET http://localhost:3000/api/missions` - Get all missions
   - `GET http://localhost:3000/api/missions/:id` - Get mission by ID
   - `POST http://localhost:3000/api/missions/:id/open` - Open mission
   - `POST http://localhost:3000/api/missions/:id/update` - Update mission
   - `POST http://localhost:3000/api/missions` - Create mission
   - `POST http://localhost:3000/api/users/:id/fcm-token` - Register FCM token

2. **For authenticated endpoints:**
   - Add header: `Authorization: Bearer YOUR_JWT_TOKEN`

## Common Issues

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod` or check MongoDB service
- Verify connection string in `.env`

### Firebase Not Working
- Check if `firebase-service-account.json` is in `config/` folder
- Verify the file is valid JSON
- Server will show warning but still work without FCM

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 3001)
- Or kill the process using the port

## Next Steps

1. Create more users using `npm run create-user <username> <password>`
2. Test creating missions via API
3. Integrate with your React Native mobile app
4. Set up production MongoDB instance
5. Deploy to a cloud platform (Heroku, AWS, DigitalOcean, etc.)

## Mobile App Integration

Your React Native app should:

1. **On first launch:** Prompt user to enter server URL (e.g., `http://192.168.1.100:3000`)
2. **Login:** POST to `/auth/login` and store JWT token
3. **Register FCM token:** After login, POST to `/api/users/:id/fcm-token`
4. **Fetch missions:** GET `/api/missions` on startup and pull-to-refresh
5. **Handle FCM notifications:** Parse mission data and update UI

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB instance
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure CORS for your domain
- [ ] Set up process manager (PM2)
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
