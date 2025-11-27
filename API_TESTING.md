# API Testing Examples

This file contains example requests for testing all API endpoints.

## 1. Authentication

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "worker1",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "worker1"
  }
}
```

## 2. User Management

### Register FCM Token
```bash
curl -X POST http://localhost:3000/api/users/507f1f77bcf86cd799439011/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "token": "fcm_token_12345"
  }'
```

### Remove FCM Token
```bash
curl -X DELETE http://localhost:3000/api/users/507f1f77bcf86cd799439011/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "token": "fcm_token_12345"
  }'
```

## 3. Missions

### Get All Missions
```bash
curl -X GET http://localhost:3000/api/missions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Mission by ID
```bash
curl -X GET http://localhost:3000/api/missions/mission-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Mission
```bash
curl -X POST http://localhost:3000/api/missions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "id": "mission-002",
    "date": "2025-11-26",
    "cashier": "Jane Smith",
    "machineName": "Machine B2",
    "collect": {
      "noteAmount": 750,
      "coinAmount": 300
    },
    "refill": {
      "coins": {
        "amount": 150,
        "coinTypes": {
          "1": 75,
          "2": 75
        }
      },
      "notes": {
        "amount": 1000,
        "noteTypes": {
          "10": 50,
          "20": 50
        }
      }
    },
    "maintenance": ["Clean screen", "Check printer", "Replace paper"],
    "qrCode": "QR67890"
  }'
```

### Open Mission
```bash
curl -X POST http://localhost:3000/api/missions/mission-001/open \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Mission (In Progress)
```bash
curl -X POST http://localhost:3000/api/missions/mission-001/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in_progress",
    "note": "Working on collection"
  }'
```

### Complete Mission
```bash
curl -X POST http://localhost:3000/api/missions/mission-001/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "completed",
    "tasks": {
      "collected": true,
      "refilled": true,
      "maintained": true
    },
    "note": "All tasks completed successfully"
  }'
```

## 4. Health Check

```bash
curl -X GET http://localhost:3000/health
```

## PowerShell Examples

If using PowerShell, use these commands instead:

### Login (PowerShell)
```powershell
$body = @{
    username = "worker1"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Get Missions (PowerShell)
```powershell
$token = "YOUR_JWT_TOKEN"
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/missions" `
  -Method GET `
  -Headers $headers
```

### Create Mission (PowerShell)
```powershell
$token = "YOUR_JWT_TOKEN"
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    id = "mission-003"
    date = "2025-11-26"
    cashier = "Mike Johnson"
    machineName = "Machine C3"
    collect = @{
        noteAmount = 600
        coinAmount = 250
    }
    refill = @{
        coins = @{
            amount = 120
            coinTypes = @{
                "1" = 60
                "2" = 60
            }
        }
        notes = @{
            amount = 800
            noteTypes = @{
                "10" = 40
                "20" = 40
            }
        }
    }
    maintenance = @("Clean screen", "Check printer")
    qrCode = "QR11111"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/api/missions" `
  -Method POST `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $body
```

## Testing Workflow

1. **Login** to get JWT token
2. **Save the token** for subsequent requests
3. **Register FCM token** (simulate mobile app)
4. **Create a mission** (simulates admin creating mission)
5. **Get all missions** (verify mission appears)
6. **Open mission** (worker starts mission)
7. **Update mission** (worker completes mission)
8. **Get mission by ID** (verify status updated)

## Response Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error
