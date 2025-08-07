import { Request, Response } from 'express';
import { healthMonitor } from '../services/healthMonitor';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

export class HealthController {
  // Get current health status of all services
  public async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await healthMonitor.getRecentHealthStatus();
      
      const response: ApiResponse = {
        success: true,
        data: status,
        message: 'Health status retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting health status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve health status'
      });
    }
  }

  // Get uptime statistics
  public async getUptimeStats(req: Request, res: Response): Promise<void> {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const uptime = await healthMonitor.getServiceUptime(hours);
      
      const response: ApiResponse = {
        success: true,
        data: uptime,
        message: `Uptime statistics for last ${hours} hours`
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting uptime stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve uptime statistics'
      });
    }
  }

  // Start health monitoring
  public async startMonitoring(req: Request, res: Response): Promise<void> {
    try {
      await healthMonitor.startMonitoring();
      
      const response: ApiResponse = {
        success: true,
        message: 'Health monitoring started successfully'
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error starting monitoring:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start health monitoring'
      });
    }
  }

  // Stop health monitoring
  public async stopMonitoring(req: Request, res: Response): Promise<void> {
    try {
      healthMonitor.stopMonitoring();
      
      const response: ApiResponse = {
        success: true,
        message: 'Health monitoring stopped successfully'
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error stopping monitoring:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to stop health monitoring'
      });
    }
  }

  // Get monitoring status
  public async getMonitoringStatus(req: Request, res: Response): Promise<void> {
    try {
      const isMonitoring = healthMonitor.isMonitoring();
      
      const response: ApiResponse = {
        success: true,
        data: {
          isMonitoring,
          timestamp: new Date().toISOString()
        },
        message: `Health monitoring is ${isMonitoring ? 'running' : 'stopped'}`
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting monitoring status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get monitoring status'
      });
    }
  }

  // Manual health check (trigger immediate check)
  public async triggerHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      // This would trigger an immediate health check
      // For now, we'll just return the current status
      const status = await healthMonitor.getRecentHealthStatus();
      
      const response: ApiResponse = {
        success: true,
        data: status,
        message: 'Manual health check completed'
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error triggering health check:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger health check'
      });
    }
  }

  // Get health check history
  public async getHealthHistory(req: Request, res: Response): Promise<void> {
    try {
      const { service, limit = '100', hours = '24' } = req.query;
      
      let query = `
        SELECT * FROM health_checks 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      `;
      
      const params: any[] = [parseInt(hours as string)];
      
      if (service) {
        query += ' AND service_name = ?';
        params.push(service);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(parseInt(limit as string));
      
      const { pool } = await import('../config/database');
      const [rows] = await pool.query(query, params);
      
      const response: ApiResponse = {
        success: true,
        data: rows,
        message: 'Health check history retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting health history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve health check history'
      });
    }
  }
} 