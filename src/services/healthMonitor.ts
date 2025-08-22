import axios, { AxiosResponse } from 'axios';
import cron from 'node-cron';
import { pool } from '../config/database';
import { HealthCheckResult, Service } from '../types';
import logger from '../utils/logger';

export class HealthMonitor {
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  constructor() {
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    try {
      const [result] = await pool.query('SELECT COUNT(*) as count FROM services');
      const count = (result as any)[0].count;
      if (parseInt(count) === 0) {
        await this.insertDefaultServices();
      }
    } catch (error) {
      logger.error('Failed to initialize services:', error);
    }
  }

  private async insertDefaultServices(): Promise<void> {
    const defaultServices = [
      {
        name: 'gateway',
        url: 'https://api.muda.tech/health',
        expected_response: '{"status":"ok","service":"gateway"}'
      },
      {
        name: 'liquidity-rail',
        url: 'https://api.muda.tech/v1/rail/health',
        expected_response: '{"status":"ok","service":"liquidity-rail-admin"}'
      },
      {
        name: 'client-admin',
        url: 'https://api.muda.tech/web/health',
        expected_response: '{"status":"ok","service":"client-admin"}'
      },
      {
        name: 'wallet',
        url: 'https://api.muda.tech/v1/health',
        expected_response: '{"status":"ok","service":"wallet"}'
      }
    ];

    for (const service of defaultServices) {
      await pool.query(
        'INSERT INTO services (name, url, expected_response) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = name',
        [service.name, service.url, service.expected_response]
      );
    }
    logger.info('Default services initialized');
  }

  public async startMonitoring(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Health monitoring is already running');
      return;
    }

    await this.performHealthChecks();

    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      await this.performHealthChecks();
    });

    this.isRunning = true;
    logger.info('Health monitoring started - checking every 5 minutes');
  }

  public stopMonitoring(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    logger.info('Health monitoring stopped');
  }

  private async performHealthChecks(): Promise<void> {
    try {
      const services = await this.getActiveServices();
      
      for (const service of services) {
        await this.checkServiceHealth(service);
      }
    } catch (error) {
      logger.error('Error performing health checks:', error);
    }
  }

  private async getActiveServices(): Promise<Service[]> {
    const [rows] = await pool.query('SELECT * FROM services WHERE is_active = true ORDER BY name');
    return rows as Service[];
  }

  private async checkServiceHealth(service: Service): Promise<void> {
    const startTime = Date.now();
    let status: 'ok' | 'error' | 'timeout' = 'error';
    let responseBody: string | undefined;
    let errorMessage: string | undefined;
    let responseTime: number | undefined;

    try {
      const timeout = service.timeout || 10000;
      const response: AxiosResponse = await axios.get(service.url, {
        timeout,
        headers: {
          'User-Agent': 'MUDA-Pay-Health-Monitor/1.0'
        }
      });

      responseTime = Date.now() - startTime;
      responseBody = JSON.stringify(response.data);

      if (response.status === 200 && responseBody === service.expected_response) {
        status = 'ok';
        logger.info(`✅ ${service.name}: Healthy (${responseTime}ms)`);
      } else {
        status = 'error';
        errorMessage = `Unexpected response: ${responseBody}`;
        logger.warn(`⚠️ ${service.name}: Unexpected response (${responseTime}ms)`);
      }
    } catch (error: any) {
      responseTime = Date.now() - startTime;
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        status = 'timeout';
        errorMessage = 'Request timeout';
        logger.error(`⏰ ${service.name}: Timeout (${responseTime}ms)`);
      } else {
        status = 'error';
        errorMessage = error.message || 'Request failed';
        logger.error(`❌ ${service.name}: Error - ${errorMessage} (${responseTime}ms)`);
      }
    }

    await this.storeHealthCheckResult({
      service_name: service.name,
      service_url: service.url,
      status,
      response_time: responseTime,
      response_body: responseBody,
      error_message: errorMessage
    });
  }

  private async storeHealthCheckResult(result: Omit<HealthCheckResult, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO health_checks 
         (service_name, service_url, status, response_time, response_body, error_message) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          result.service_name,
          result.service_url,
          result.status,
          result.response_time,
          result.response_body,
          result.error_message
        ]
      );
    } catch (error) {
      logger.error('Failed to store health check result:', error);
    }
  }

  public async getRecentHealthStatus(): Promise<any[]> {
    try {
      const [rows] = await pool.query('SELECT * FROM recent_health_status ORDER BY service_name');
      return rows as any[];
    } catch (error) {
      logger.error('Failed to get recent health status:', error);
      return [];
    }
  }

  public async getServiceUptime(hours: number = 24): Promise<any[]> {
    try {
      const [rows] = await pool.query(
        `SELECT 
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
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        GROUP BY service_name
        ORDER BY service_name`,
        [hours]
      );
      return rows as any[];
    } catch (error) {
      logger.error('Failed to get service uptime:', error);
      return [];
    }
  }

  public isMonitoring(): boolean {
    return this.isRunning;
  }
}

export const healthMonitor = new HealthMonitor(); 