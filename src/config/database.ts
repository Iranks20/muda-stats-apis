import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: PoolOptions = {
  host: "ec2-51-20-250-164.eu-north-1.compute.amazonaws.com",
  port: parseInt('3306'),
  database: "muda_pay_health",
  user: "admin",
  password:"admin",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(dbConfig);

pool.on('connection', (connection) => {
  console.log('Connected to MySQL database');
});

export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1 as test');
    connection.release();
    return true;
  } catch (error: any) {
    console.error('Database connection failed:', error);
    return false;
  }
}; 