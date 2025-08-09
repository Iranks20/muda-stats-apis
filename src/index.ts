import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { healthMonitor } from './services/healthMonitor';
import { testConnection } from './config/database';
import healthRoutes from './routes/healthRoutes';
import systemRoutes from './routes/systemRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    host: req.get('Host')
  });
  next();
});

// Root endpoint - API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'MUDA Pay Health Monitoring API',
    version: '1.0.0',
    description: 'Real-time health monitoring system for MUDA Pay microservices',
    status: 'running',
    endpoints: {
      health: {
        url: '/health',
        description: 'Basic health check endpoint',
        method: 'GET'
      },
      system_health: {
        url: '/api/system/health',
        description: 'Complete system health status',
        method: 'GET'
      },
      system_heartbeat: {
        url: '/api/system/heartbeat',
        description: 'System heartbeat data (24hr default)',
        method: 'GET',
        params: '?hours=24'
      },
      microservices: {
        url: '/api/system/microservices',
        description: 'All microservices status',
        method: 'GET'
      },
      live_status: {
        url: '/api/system/live',
        description: 'Real-time system status',
        method: 'GET'
      },
      system_events: {
        url: '/api/system/events',
        description: 'Recent system events',
        method: 'GET'
      }
    },
    documentation: 'https://api.muda.tech/docs',
    support: 'support@muda.tech'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'muda-pay-health-monitor',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    server: {
      nodejs: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    },
    apis: {
      health_monitoring: '/api/health',
      system_monitoring: '/api/system'
    }
  });
});

// API Status endpoint
app.get('/status', async (req, res) => {
  try {
    const { testConnection } = await import('./config/database');
    const dbConnected = await testConnection();
    
    res.json({
      api: 'operational',
      database: dbConnected ? 'connected' : 'disconnected',
      services: {
        health_monitor: 'running',
        system_monitor: 'running',
        database_connection: dbConnected ? 'healthy' : 'unhealthy'
      },
      last_check: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      memory_usage: {
        heap_used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heap_total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    });
  } catch (error) {
    res.status(500).json({
      api: 'degraded',
      database: 'unknown',
      error: 'Status check failed',
      last_check: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/system', systemRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Database connection failed. Exiting...');
      process.exit(1);
    }

    // Start health monitoring
    await healthMonitor.startMonitoring();

    app.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`🚀 MUDA Pay Health Monitor API running on port ${PORT}`);
      logger.info(`📊 Health monitoring started - checking every minute`);
      logger.info(`🔗 API Documentation: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  healthMonitor.stopMonitoring();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  healthMonitor.stopMonitoring();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer(); 