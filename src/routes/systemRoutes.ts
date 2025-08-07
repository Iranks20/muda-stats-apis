import { Router } from 'express';
import { SystemController } from '../controllers/systemController';

const router = Router();
const systemController = new SystemController();

// 1. System Health Overview APIs
router.get('/heartbeat', systemController.getSystemHeartbeat);
router.get('/health', systemController.getSystemHealth);

// 2. Microservices Health APIs
router.get('/microservices', systemController.getMicroservicesStatus);
router.get('/microservices/uptime', systemController.getMicroservicesUptime);

// 3. System Events APIs
router.get('/events', systemController.getSystemEvents);

// 4. Request Logs APIs
router.get('/requests/stats', systemController.getRequestStats);
router.get('/requests/status-codes', systemController.getStatusCodeDistribution);

// 5. Performance Metrics APIs
router.get('/performance', systemController.getPerformanceMetrics);
router.get('/performance/trends', systemController.getPerformanceTrends);

// 6. Error Analysis APIs
router.get('/errors/summary', systemController.getErrorSummary);
router.get('/errors/details', systemController.getErrorDetails);

// 7. Live System Status API
router.get('/live', systemController.getLiveSystemStatus);

export default router; 