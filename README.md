# MUDA Pay Health Monitoring API

A Node.js API service that monitors the health of MUDA Pay microservices every minute and stores the results in a MySQL database.

## Features

- ✅ **Automatic Health Monitoring**: Checks 4 microservices every 5 minutes
- ✅ **Database Storage**: MySQL for persistent health check data
- ✅ **Real-time Status**: Get current health status of all services
- ✅ **Uptime Statistics**: Calculate uptime percentages and response times
- ✅ **Historical Data**: View health check history and trends
- ✅ **RESTful API**: Clean API endpoints for monitoring and control
- ✅ **Logging**: Comprehensive logging with Winston
- ✅ **Error Handling**: Robust error handling and graceful shutdown
- ✅ **TypeScript**: Full TypeScript support with type safety

## Monitored Services

1. **Gateway**: `https://api.muda.tech/health`
2. **Liquidity Rail**: `https://api.muda.tech/v1/rail/health`
3. **Client Admin**: `https://api.muda.tech/web/health`
4. **Wallet**: `https://api.muda.tech/v1/health`

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or pnpm

## Installation

1. **Clone and navigate to the project**:
   ```bash
   cd muda-pay-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   The `.env` file is already configured with the correct credentials for local MySQL setup.

4. **Set up MySQL database**:
   ```sql
   CREATE DATABASE muda_pay_health;
   ```

5. **Run database migrations**:
   ```bash
   mysql -u root muda_pay_health < database/schema.sql
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Health Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |
| GET | `/api/health/status` | Get current health status of all services |
| GET | `/api/health/uptime` | Get uptime statistics (default: 24h) |
| GET | `/api/health/monitoring` | Get monitoring service status |
| GET | `/api/health/history` | Get health check history |

### Control Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/health/start` | Start health monitoring |
| POST | `/api/health/stop` | Stop health monitoring |
| POST | `/api/health/check` | Trigger manual health check |

### Dashboard APIs (System Status)

#### System Health Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/heartbeat` | Get 24-hour system heartbeat data |
| GET | `/api/system/health` | Get overall system health status |

#### Microservices Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/microservices` | Get current microservices status |
| GET | `/api/system/microservices/uptime` | Get microservices uptime statistics |

#### System Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/events` | Get recent system events timeline |

#### Request Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/requests/stats` | Get daily request statistics |
| GET | `/api/system/requests/status-codes` | Get HTTP status code distribution |

#### Performance Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/performance` | Get current performance metrics |
| GET | `/api/system/performance/trends` | Get performance trends over time |

#### Error Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/errors/summary` | Get error summary statistics |
| GET | `/api/system/errors/details` | Get detailed error information |

#### Live Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/live` | Get real-time system status |

### Query Parameters

- `hours`: Number of hours for uptime calculation (default: 24)
- `service`: Filter by service name
- `limit`: Limit number of history records (default: 100)

## Example API Responses

### Health Status
```json
{
  "success": true,
  "data": [
    {
      "service_name": "gateway",
      "service_url": "https://api.muda.tech/health",
      "current_status": "ok",
      "response_time": 245,
      "last_check": "2025-01-16T10:30:00Z",
      "response_body": "{\"status\":\"ok\",\"service\":\"gateway\"}",
      "error_message": null
    }
  ],
  "message": "Health status retrieved successfully"
}
```

### Uptime Statistics
```json
{
  "success": true,
  "data": [
    {
      "service_name": "gateway",
      "total_checks": 1440,
      "successful_checks": 1435,
      "uptime_percentage": 99.65,
      "avg_response_time": 245.5,
      "first_check": "2025-01-15T10:30:00Z",
      "last_check": "2025-01-16T10:30:00Z"
    }
  ],
  "message": "Uptime statistics for last 24 hours"
}
```

### System Heartbeat
```json
{
  "success": true,
  "data": [
    {
      "hour": "00:00",
      "status": 1,
      "requests": 1250
    },
    {
      "hour": "01:00",
      "status": 1,
      "requests": 1180
    }
  ],
  "message": "System heartbeat data for last 24 hours"
}
```

### System Health Overview
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 99.5,
    "total_services": 4,
    "healthy_services": 4,
    "last_check": "2025-08-03T19:40:01Z"
  },
  "message": "System health status retrieved successfully"
}
```

### Microservices Status
```json
{
  "success": true,
  "data": [
    {
      "name": "gateway",
      "status": "healthy",
      "uptime": 99.8,
      "last_check": "2025-08-03T19:40:01Z",
      "response_time": 840,
      "url": "https://api.muda.tech/health"
    }
  ],
  "message": "Microservices status retrieved successfully"
}
```

### Performance Metrics
```json
{
  "success": true,
  "data": {
    "cpu_usage": 67,
    "memory_usage": {
      "used": "4.2GB",
      "total": "8GB",
      "percentage": 52.5
    },
    "active_connections": 1247,
    "queue_depth": 23,
    "database_connections": 45,
    "cache_hit_rate": 94.2
  },
  "message": "Performance metrics retrieved successfully"
}
```

## Database Schema

### Tables

- **health_checks**: Stores individual health check results
- **services**: Configuration for monitored services
- **recent_health_status**: View for current service status
- **service_uptime**: View for uptime calculations

### Key Fields

- `status`: 'ok', 'error', or 'timeout'
- `response_time`: Response time in milliseconds
- `response_body`: Actual response from service
- `error_message`: Error details if check failed

## Configuration

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=muda_pay_health
DB_USER=root
DB_PASSWORD=""

# Health Check
HEALTH_CHECK_INTERVAL=300000
HEALTH_CHECK_TIMEOUT=10000

# Logging
LOG_LEVEL=info
```

## Monitoring

The service automatically:

1. **Checks every minute** using cron scheduling
2. **Stores results** in MySQL database
3. **Logs activities** with timestamps and details
4. **Handles errors** gracefully with retry logic
5. **Validates responses** against expected formats

## Logs

Logs are stored in:
- `logs/error.log`: Error-level logs
- `logs/combined.log`: All logs
- Console output (development only)

## Development

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run test     # Run tests
npm run lint     # Lint code
```

### Project Structure

```
src/
├── config/          # Database and app configuration
├── controllers/     # API controllers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utilities (logger, etc.)
└── index.ts         # Application entry point
```

## Testing

Test the API endpoints:

```bash
# Test health monitoring APIs
curl http://localhost:3001/api/health/monitoring
curl http://localhost:3001/api/health/status
curl http://localhost:3001/api/health/uptime?hours=24
curl http://localhost:3001/api/health/history?limit=10

# Test dashboard APIs
curl http://localhost:3001/api/system/health
curl http://localhost:3001/api/system/microservices
curl http://localhost:3001/api/system/performance
curl http://localhost:3001/api/system/live

# Run comprehensive tests
node test-api.js          # Test health monitoring APIs
node test-dashboard-apis.js # Test dashboard APIs
```

## Integration with Dashboard

This API can be integrated with your existing dashboard by:

1. Updating the API client in `muda-pay-dashboard/lib/api.ts`
2. Adding new endpoints for real-time health data
3. Creating WebSocket connections for live updates

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL is running
   - Verify database credentials in `.env`
   - Ensure database exists
   - For local MySQL with no password, use: `mysql -u root`

2. **Health Checks Failing**
   - Verify service URLs are accessible
   - Check network connectivity
   - Review logs for specific errors

3. **High Response Times**
   - Monitor network latency
   - Check service performance
   - Review timeout settings

## License

MIT License - see LICENSE file for details. 