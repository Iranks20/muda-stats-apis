const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔧 Testing Database Connection');
  console.log('================================');

  // Log all environment variables related to database
  console.log('\n📋 Environment Variables:');
  console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
  console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
  console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
  console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? `SET (${process.env.DB_PASSWORD.length} chars)` : 'NOT SET');

  // Configuration being used
  const config = {
    host: process.env.DB_HOST || 'stage-mudax.cn4csa73ps6o.us-east-1.rds.amazonaws.com',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'muda_pay_health',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || '5#v-r;yeFh',
  };

  console.log('\n🔧 Actual Configuration Used:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('Database:', config.database);
  console.log('User:', config.user);
  console.log('Password:', config.password ? `[${config.password.length} chars] ${config.password.substring(0, 3)}***` : 'NOT SET');

  console.log('\n🔗 Testing Connection...');

  try {
    // Test basic connection
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection created successfully');

    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query executed successfully:');
    console.log('   Test Result:', rows[0].test);
    // console.log('   Current Database:', rows[0].current_database);
    // console.log('   MySQL Version:', rows[0].mysql_version);

    // Test if our target database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('\n📊 Available Databases:');
    databases.forEach(db => {
      console.log('  -', Object.values(db)[0]);
    });

    // Check if our target database exists
    const targetDbExists = databases.some(db => Object.values(db)[0] === config.database);
    console.log(`\n🎯 Target database '${config.database}' ${targetDbExists ? 'EXISTS' : 'DOES NOT EXIST'}`);

    // Test table creation permissions
    await connection.execute(`USE ${config.database}`);
    console.log(`✅ Successfully switched to database '${config.database}'`);

    // Show existing tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Existing Tables:');
    if (tables.length === 0) {
      console.log('   No tables found');
    } else {
      tables.forEach(table => {
        console.log('  -', Object.values(table)[0]);
      });
    }

    await connection.end();
    console.log('\n✅ Database connection test completed successfully!');
    return true;

  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('Error Code:', error.code);
    console.error('Error Number:', error.errno);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
    console.error('Host Info:', error.address);
    console.error('Port:', error.port);
    console.error('Fatal:', error.fatal);

    console.error('\n🔍 Troubleshooting Steps:');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  1. ❌ ACCESS DENIED - Check username and password');
      console.error('  2. Verify the user has permissions for this database');
      console.error('  3. Check if the user is allowed to connect from this IP');
      console.error('  4. Try connecting with a MySQL client to verify credentials');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.error('  1. ❌ HOST NOT FOUND - Check the hostname/IP address');
      console.error('  2. Verify DNS resolution');
      console.error('  3. Check network connectivity');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('  1. ❌ CONNECTION REFUSED - Check if MySQL server is running');
      console.error('  2. Verify the port number (usually 3306)');
      console.error('  3. Check firewall settings');
    }

    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('  1. ❌ DATABASE NOT FOUND - The database does not exist');
      console.error('  2. Create the database first or check the database name');
    }

    console.error('\n💡 Quick Fixes to Try:');
    console.error('  1. Create .env file with correct credentials');
    console.error('  2. Verify AWS RDS security groups allow your IP');
    console.error('  3. Check if the RDS instance is publicly accessible');
    console.error('  4. Try connecting without specifying a database first');
    
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 All database tests passed!');
      process.exit(0);
    } else {
      console.log('\n💥 Database tests failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
