import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: PoolOptions = {
  host: process.env.DB_HOST || 'stage-mudax.cn4csa73ps6o.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'muda_pay_health',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '5#v-r;yeFh',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Log database configuration (without password for security)
console.log('🔧 Database Configuration:');
console.log('  Host:', dbConfig.host);
console.log('  Port:', dbConfig.port);
console.log('  Database:', dbConfig.database);
console.log('  User:', dbConfig.user);
console.log('  Password:', dbConfig.password ? `[${dbConfig.password.length} chars] ${dbConfig.password.substring(0, 3)}***` : 'NOT SET');
console.log('  Connection Limit:', dbConfig.connectionLimit);

// Log environment variables being used
console.log('🌍 Environment Variables:');
console.log('  DB_HOST:', process.env.DB_HOST || 'NOT SET (using default)');
console.log('  DB_PORT:', process.env.DB_PORT || 'NOT SET (using default)');
console.log('  DB_NAME:', process.env.DB_NAME || 'NOT SET (using default)');
console.log('  DB_USER:', process.env.DB_USER || 'NOT SET (using default)');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? `SET (${process.env.DB_PASSWORD.length} chars)` : 'NOT SET (using default)');

export const pool = mysql.createPool(dbConfig);

// Test database connection
pool.on('connection', (connection) => {
  console.log('Connected to MySQL database');
});

export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔗 Attempting database connection...');
    const connection = await pool.getConnection();
    console.log('✅ Database connection pool created successfully');
    
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Database query executed successfully:', rows);
    
    connection.release();
    console.log('✅ Database connection released');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed with detailed error:');
    console.error('  Error Code:', error.code);
    console.error('  Error Number:', error.errno);
    console.error('  SQL State:', error.sqlState);
    console.error('  SQL Message:', error.sqlMessage);
    console.error('  Full Error:', error);
    
    // Additional troubleshooting info
    console.error('🔍 Troubleshooting Information:');
    console.error('  - Check if the database server is running');
    console.error('  - Verify network connectivity to the host');
    console.error('  - Confirm user credentials and permissions');
    console.error('  - Check if the database exists');
    console.error('  - Verify firewall settings allow connections');
    
    return false;
  }
}; 