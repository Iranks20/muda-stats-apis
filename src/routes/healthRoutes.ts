import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router = Router();
const healthController = new HealthController();

// Health monitoring routes
router.get('/status', healthController.getHealthStatus);
router.get('/uptime', healthController.getUptimeStats);
router.get('/monitoring', healthController.getMonitoringStatus);
router.get('/history', healthController.getHealthHistory);

// Control routes
router.post('/start', healthController.startMonitoring);
router.post('/stop', healthController.stopMonitoring);
router.post('/check', healthController.triggerHealthCheck);

export default router; 