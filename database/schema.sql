-- MUDA Pay Health Monitoring Database Schema (MySQL)

-- Create database (run this separately)
-- CREATE DATABASE muda_pay_health;

-- Use the database
USE muda_pay_health;

-- Health check results table
CREATE TABLE health_checks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    service_name VARCHAR(50) NOT NULL,
    service_url VARCHAR(255) NOT NULL,
    status ENUM('ok', 'error', 'timeout') NOT NULL,
    response_time INT, -- in milliseconds
    response_body TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Service configuration table
CREATE TABLE services (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) UNIQUE NOT NULL,
    url VARCHAR(255) NOT NULL,
    expected_response TEXT,
    is_active BOOLEAN DEFAULT true,
    check_interval INT DEFAULT 60000, -- in milliseconds
    timeout INT DEFAULT 10000, -- in milliseconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default services
INSERT INTO services (name, url, expected_response) VALUES
    ('gateway', 'https://api.muda.tech/health', '{"status":"ok","service":"gateway"}'),
    ('liquidity-rail', 'https://api.muda.tech/v1/rail/health', '{"status":"ok","service":"liquidity-rail-admin"}'),
    ('client-admin', 'https://api.muda.tech/web/health', '{"status":"ok","service":"client-admin"}'),
    ('wallet', 'https://api.muda.tech/v1/health', '{"status":"ok","service":"wallet"}');

-- Create indexes for better performance
CREATE INDEX idx_health_checks_service_name ON health_checks(service_name);
CREATE INDEX idx_health_checks_created_at ON health_checks(created_at);
CREATE INDEX idx_health_checks_status ON health_checks(status);

-- Create view for recent health status
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
LEFT JOIN (
    SELECT h1.*
    FROM health_checks h1
    INNER JOIN (
        SELECT service_name, MAX(created_at) as max_created_at
        FROM health_checks
        GROUP BY service_name
    ) h2 ON h1.service_name = h2.service_name AND h1.created_at = h2.max_created_at
) hc ON s.name = hc.service_name
WHERE s.is_active = true;

-- Create view for uptime calculation
CREATE VIEW service_uptime AS
SELECT 
    service_name,
    COUNT(*) as total_checks,
    COUNT(CASE WHEN status = 'ok' THEN 1 END) as successful_checks,
    ROUND(
        (COUNT(CASE WHEN status = 'ok' THEN 1 END) * 100.0 / COUNT(*)), 
        2
    ) as uptime_percentage,
    AVG(response_time) as avg_response_time,
    MIN(created_at) as first_check,
    MAX(created_at) as last_check
FROM health_checks 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY service_name; 