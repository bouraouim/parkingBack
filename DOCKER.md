# Docker Setup Guide

## MongoDB with Docker Compose

### Prerequisites
- Docker Desktop installed on Windows
- Docker Compose (included with Docker Desktop)

### Quick Start

1. **Start MongoDB container:**
   ```powershell
   docker-compose up -d
   ```

2. **Verify MongoDB is running:**
   ```powershell
   docker ps
   ```
   You should see `parking-mongodb` container running.

3. **Check MongoDB logs:**
   ```powershell
   docker-compose logs mongodb
   ```

4. **Start your Node.js server:**
   ```powershell
   npm run dev
   ```

### MongoDB Connection Details

- **Host:** `localhost`
- **Port:** `27017`
- **Database:** `parking-payment-machine`
- **Username:** `admin`
- **Password:** `admin123`
- **Connection String:** `mongodb://admin:admin123@localhost:27017/parking-payment-machine?authSource=admin`

### Useful Docker Commands

**Start MongoDB:**
```powershell
docker-compose up -d
```

**Stop MongoDB:**
```powershell
docker-compose down
```

**Stop and remove all data:**
```powershell
docker-compose down -v
```

**View logs:**
```powershell
docker-compose logs -f mongodb
```

**Access MongoDB shell:**
```powershell
docker exec -it parking-mongodb mongosh -u admin -p admin123
```

**Restart MongoDB:**
```powershell
docker-compose restart mongodb
```

### MongoDB Shell Commands

Once inside the MongoDB shell:

```javascript
// Switch to database
use parking-payment-machine

// Show all collections
show collections

// Find all users
db.users.find()

// Find all missions
db.missions.find()

// Count documents
db.missions.countDocuments()

// Exit shell
exit
```

### Data Persistence

Data is stored in Docker volumes:
- `mongodb_data` - Database files
- `mongodb_config` - Configuration files

Even if you stop the container, your data persists. To completely remove data:
```powershell
docker-compose down -v
```

### Troubleshooting

**Port already in use:**
```powershell
# Check what's using port 27017
netstat -ano | findstr :27017

# Change port in docker-compose.yml
ports:
  - "27018:27017"  # Use different external port
```

**Connection refused:**
- Make sure container is running: `docker ps`
- Check firewall settings
- Verify connection string in `.env`

**Reset everything:**
```powershell
docker-compose down -v
docker-compose up -d
```

### Production Notes

For production, consider:
1. Change default username/password
2. Enable authentication
3. Use environment variables for credentials
4. Set up backup strategy
5. Use Docker volumes on persistent storage
6. Configure MongoDB replica set for high availability

### Environment Variables in docker-compose.yml

To use environment variables instead of hardcoded values:

```yaml
environment:
  MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME:-admin}
  MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-admin123}
```

Then create `.env` file in same directory as `docker-compose.yml`:
```env
MONGO_USERNAME=admin
MONGO_PASSWORD=secretpassword
```
