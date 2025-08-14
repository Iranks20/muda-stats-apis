const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugMicroservices() {
  console.log('🔧 Debugging Microservices Query');
  console.log('================================');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'muda_pay_health',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Test 1: Check if services table has data
    console.log('\n📋 Test 1: Checking services table...');
    const [services] = await connection.query('SELECT * FROM services WHERE is_active = true');
    console.log(`Found ${services.length} active services:`);
    services.forEach(service => {
      console.log(`  - ${service.name}: ${service.url}`);
    });

    // Test 2: Check if recent_health_status view exists and has data
    console.log('\n📋 Test 2: Checking recent_health_status view...');
    const [recentStatus] = await connection.query('SELECT * FROM recent_health_status');
    console.log(`Found ${recentStatus.length} recent status records:`);
    recentStatus.forEach(status => {
      console.log(`  - ${status.service_name}: ${status.current_status}`);
    });

    // Test 3: Check if health_checks table has data
    console.log('\n📋 Test 3: Checking health_checks table...');
    const [healthChecks] = await connection.query('SELECT COUNT(*) as count FROM health_checks');
    console.log(`Total health checks: ${healthChecks[0].count}`);

    // Test 4: Run the actual microservices query
    console.log('\n📋 Test 4: Running microservices query...');
    const [statusRows] = await connection.query(
      `SELECT 
        s.name,
        s.url,
        rhs.current_status as status,
        rhs.response_time,
        rhs.last_check,
        rhs.response_body,
        rhs.error_message
      FROM services s
      LEFT JOIN recent_health_status rhs ON s.name = rhs.service_name
      WHERE s.is_active = true
      ORDER BY s.name`
    );
    console.log(`Query returned ${statusRows.length} rows:`);
    statusRows.forEach(row => {
      console.log(`  - ${row.name}: ${row.status || 'unknown'}`);
    });

    // Test 5: Run the uptime query
    console.log('\n📋 Test 5: Running uptime query...');
    const [uptimeRows] = await connection.query(
      `SELECT 
        service_name,
        COUNT(*) as total_checks,
        COUNT(CASE WHEN status = 'ok' THEN 1 END) as successful_checks,
        ROUND(
          (COUNT(CASE WHEN status = 'ok' THEN 1 END) * 100.0 / COUNT(*)), 
          2
        ) as uptime_percentage
      FROM health_checks 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY service_name`
    );
    console.log(`Uptime query returned ${uptimeRows.length} rows:`);
    uptimeRows.forEach(row => {
      console.log(`  - ${row.service_name}: ${row.uptime_percentage}%`);
    });

    await connection.end();
    console.log('\n✅ Debug completed successfully!');

  } catch (error) {
    console.error('\n❌ Debug failed:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
}

debugMicroservices();

