import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'muda_pay_health',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(dbConfig);

// Test database connection
pool.on('connection', (connection) => {
  console.log('Connected to MySQL database');
});

export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT NOW()');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}; 