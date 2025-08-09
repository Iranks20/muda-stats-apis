# MUDA Pay Health Monitoring System - Technical Specifications

## 📋 **System Overview**

The MUDA Pay Health Monitoring System is a comprehensive, real-time monitoring solution designed to track the health, performance, and availability of microservices infrastructure.

---

## 🏗️ **Architecture Components**

### **Frontend Application**
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Charts**: Recharts for data visualization
- **State Management**: React hooks with custom state management
- **Updates**: Real-time data refresh every 30 seconds

### **Backend API Server**
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0+
- **ORM**: Native MySQL2 with connection pooling
- **Logging**: Winston with structured logging
- **Scheduling**: Node-cron for automated tasks

### **Database Schema**
- **Primary Tables**: `health_checks`, `services`
- **Views**: `recent_health_status`, `service_uptime`
- **Indexes**: Optimized for query performance
- **Storage**: Unlimited historical data retention

---

## 🔧 **Monitoring Configuration**

### **Health Check Parameters**
```yaml
Check Frequency: 5 minutes (300,000ms)
Request Timeout: 10 seconds per service
Retry Logic: 3 attempts with exponential backoff
Response Validation: JSON format verification
Status Codes: HTTP 200-299 considered healthy
```

### **Monitored Services**
```yaml
Gateway Service:
  URL: https://api.muda.tech/health
  Expected: {"status":"ok","service":"gateway"}

Liquidity Rail:
  URL: https://api.muda.tech/v1/rail/health
  Expected: {"status":"ok","service":"liquidity-rail-admin"}

Client Admin:
  URL: https://api.muda.tech/web/health
  Expected: {"status":"ok","service":"client-admin"}

Transaction Processor:
  URL: https://api.muda.tech/v1/health
  Expected: {"status":"ok","service":"wallet"}
```

---

## 📊 **API Endpoints Reference**

### **System Health APIs**
```http
GET /api/system/health
# Returns overall system health status

GET /api/system/heartbeat?hours=24
# Returns system heartbeat data for specified hours

GET /api/system/microservices
# Returns current status of all microservices

GET /api/system/microservices/uptime?hours=24
# Returns uptime statistics for all services
```

### **Performance Monitoring APIs**
```http
GET /api/system/performance
# Returns current performance metrics

GET /api/system/performance/trends?hours=24
# Returns performance trends over time

GET /api/system/requests/stats?date=2024-08-04
# Returns request statistics for specified date

GET /api/system/requests/status-codes?date=2024-08-04
# Returns HTTP status code distribution
```

### **Error Management APIs**
```http
GET /api/system/errors/summary?hours=24
# Returns error summary for specified period

GET /api/system/errors/details?limit=100&service=gateway
# Returns detailed error logs

GET /api/system/events?limit=50
# Returns system events timeline
```

### **Live Monitoring APIs**
```http
GET /api/system/live
# Returns current live system status

GET /health
# Basic health check for the monitoring system itself
```

---

## 📈 **Metrics & Calculations**

### **Uptime Calculation**
```sql
Uptime % = (Successful Checks / Total Checks) × 100

Example:
- Total checks in 24h: 288 (every 5 minutes)
- Successful checks: 287
- Uptime: (287/288) × 100 = 99.65%
```

### **Performance Metrics**
```yaml
Response Time: Average of all successful requests (milliseconds)
Error Rate: (Failed Requests / Total Requests) × 100
Availability: Percentage of time service responds successfully
Throughput: Requests processed per minute (calculated)
```

### **System Health Status**
```yaml
Healthy: Uptime > 99% AND Error Rate < 1%
Warning: Uptime 95-99% OR Error Rate 1-5%
Critical: Uptime < 95% OR Error Rate > 5%
```

---

## 🗄️ **Database Design**

### **Health Checks Table**
```sql
CREATE TABLE health_checks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    service_name VARCHAR(50) NOT NULL,
    service_url VARCHAR(255) NOT NULL,
    status ENUM('ok', 'error', 'timeout') NOT NULL,
    response_time INT, -- milliseconds
    response_body TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Services Table**
```sql
CREATE TABLE services (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) UNIQUE NOT NULL,
    url VARCHAR(255) NOT NULL,
    expected_response TEXT,
    is_active BOOLEAN DEFAULT true,
    check_interval INT DEFAULT 60000, -- milliseconds
    timeout INT DEFAULT 10000, -- milliseconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Performance Views**
```sql
-- Recent health status for dashboard
CREATE VIEW recent_health_status AS
SELECT 
    s.name as service_name,
    s.url as service_url,
    hc.status as current_status,
    hc.response_time,
    hc.created_at as last_check,
    hc.response_body,
    hc.error_message
FROM services s
LEFT JOIN (latest health check subquery) hc
WHERE s.is_active = true;

-- Service uptime calculations
CREATE VIEW service_uptime AS
SELECT 
    service_name,
    COUNT(*) as total_checks,
    COUNT(CASE WHEN status = 'ok' THEN 1 END) as successful_checks,
    ROUND((COUNT(CASE WHEN status = 'ok' THEN 1 END) * 100.0 / COUNT(*)), 2) as uptime_percentage,
    AVG(response_time) as avg_response_time
FROM health_checks 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY service_name;
```

---

## 🔐 **Security & Access Control**

### **API Security**
```yaml
CORS: Configured for dashboard domain
Rate Limiting: 1000 requests per hour per IP
Input Validation: All parameters sanitized
SQL Injection: Parameterized queries only
Authentication: Token-based (when required)
```

### **Data Privacy**
```yaml
PII Data: No personally identifiable information stored
Error Logs: Sanitized before storage
Access Logs: IP addresses logged for security
Retention: Data retained indefinitely for trending
```

### **Network Security**
```yaml
HTTPS: All external communications encrypted
Database: Internal network access only
Monitoring: Isolated from business logic
Firewall: Restricted port access
```

---

## ⚡ **Performance Specifications**

### **System Requirements**
```yaml
Minimum Server Specs:
  CPU: 2 cores, 2.4GHz
  RAM: 4GB
  Storage: 50GB SSD
  Network: 100Mbps

Recommended Server Specs:
  CPU: 4 cores, 3.0GHz
  RAM: 8GB
  Storage: 200GB SSD
  Network: 1Gbps
```

### **Database Performance**
```yaml
Connection Pool: 10 concurrent connections
Query Optimization: All queries use indexes
Data Retention: Automatic cleanup after 1 year
Backup Strategy: Daily automated backups
Performance Monitoring: Built-in query profiling
```

### **API Performance**
```yaml
Response Time: < 200ms for 95% of requests
Throughput: 1000+ requests per minute
Availability: 99.9% uptime target
Monitoring Overhead: < 1ms per service check
Memory Usage: < 500MB under normal load
```

---

## 🚀 **Deployment Requirements**

### **Production Environment**
```yaml
Operating System: Ubuntu 20.04+ or CentOS 8+
Node.js Version: 18.x or higher
MySQL Version: 8.0 or higher
Process Manager: PM2 for production
Reverse Proxy: Nginx recommended
SSL Certificate: Required for HTTPS
```

### **Environment Variables**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=muda_pay_health
DB_USER=monitoring_user
DB_PASSWORD=secure_password

# Server Configuration
PORT=3001
NODE_ENV=production
HEALTH_CHECK_INTERVAL=300000

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/monitoring.log
```

### **Installation Steps**
```bash
1. Clone repository
2. Install dependencies: npm install
3. Configure environment variables
4. Create MySQL database and run schema
5. Build application: npm run build
6. Start with PM2: pm2 start ecosystem.config.js
7. Configure Nginx reverse proxy
8. Set up SSL certificate
```

---

## 📊 **Monitoring & Alerting**

### **System Metrics Tracked**
```yaml
Response Time: Per-service response times
Error Rates: Failure percentages by service
Uptime: Service availability percentages
Performance: CPU, memory, connection metrics
Request Volume: Requests per minute/hour/day
Status Codes: HTTP response code distribution
```

### **Alert Conditions** (Configurable)
```yaml
Critical Alerts:
  - Service down for > 5 minutes
  - Error rate > 10%
  - Response time > 5 seconds

Warning Alerts:
  - Service intermittent failures
  - Error rate > 2%
  - Response time > 2 seconds

Info Alerts:
  - Service recovered
  - Performance degradation
  - Maintenance windows
```

### **Notification Channels** (Future)
```yaml
Email: SMTP configuration
SMS: Twilio integration
Slack: Webhook notifications
Teams: Microsoft Teams integration
PagerDuty: Incident management
Custom: Webhook endpoints
```

---

## 🔧 **Maintenance & Operations**

### **Daily Operations**
```yaml
Health Checks: Automatic every 5 minutes
Data Collection: Continuous
Dashboard Updates: Real-time
Log Rotation: Daily at midnight
Performance Monitoring: Continuous
```

### **Weekly Maintenance**
```yaml
Database Optimization: Index maintenance
Log Cleanup: Remove old logs
Performance Review: Trend analysis
Backup Verification: Restore testing
Security Updates: Dependency updates
```

### **Monthly Reviews**
```yaml
Capacity Planning: Growth analysis
Threshold Tuning: Alert optimization
Performance Baseline: Update standards
Documentation: Update procedures
Training: Team knowledge updates
```

---

## 📞 **Support & Documentation**

### **Documentation Provided**
- ✅ API Reference Guide
- ✅ Database Schema Documentation
- ✅ Installation & Setup Guide
- ✅ Operations Manual
- ✅ Troubleshooting Guide
- ✅ Performance Tuning Guide

### **Support Levels**
```yaml
Level 1: Documentation and self-service
Level 2: Email support within 24 hours
Level 3: Critical issue response within 4 hours
Level 4: On-site assistance (if required)
```

### **Training Materials**
- ✅ Dashboard User Guide
- ✅ Administrator Training
- ✅ API Integration Examples
- ✅ Best Practices Guide
- ✅ Troubleshooting Procedures

---

## 🔮 **Future Roadmap**

### **Phase 2 Enhancements**
```yaml
Predictive Analytics: ML-powered failure prediction
Advanced Alerting: Multi-channel notifications
Performance Optimization: Auto-scaling recommendations
Integration APIs: Third-party tool connections
Mobile Application: Native mobile monitoring
```

### **Phase 3 Advanced Features**
```yaml
Service Dependencies: Inter-service relationship mapping
Chaos Engineering: Fault injection testing
Advanced Analytics: Business impact correlation
Custom Dashboards: User-specific views
API Gateway Integration: Request-level monitoring
```

---

*This technical specification provides comprehensive details for implementation, maintenance, and future development of the MUDA Pay Health Monitoring System.*
