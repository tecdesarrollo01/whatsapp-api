import { Router } from 'express';
import {
  startSession,
  getQR,
  getSessionStatus,
  logout
} from '../controllers/session.controller.js';
import {
  sendMessage,
  getStatus
} from '../controllers/message.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { messageLimiter } from '../middlewares/rate-limit.middleware.js';
import logger from '../logger.js';

const router = Router();

// ============ RUTAS DE SESIÓN ============
// No requieren autenticación para iniciar sesión (pero sí para enviar mensajes)

// POST /api/session/start - Iniciar sesión
router.post('/session/start', startSession);

// GET /api/session/qr - Obtener QR en base64
router.get('/session/qr', getQR);

// GET /api/session/status - Estado de conexión
router.get('/session/status', getSessionStatus);

// POST /api/session/logout - Cerrar sesión
router.post('/session/logout', logout);

// ============ RUTAS DE MENSAJES ============
// Requieren API Key

// POST /api/messages/send - Enviar mensaje
router.post(
  '/messages/send',
  authMiddleware,
  messageLimiter,
  sendMessage
);

// GET /api/messages/status - Estado de mensajería
router.get(
  '/messages/status',
  authMiddleware,
  getStatus
);

// ============ RUTA HEALTH CHECK ============
router.get('/health', (req, res) => {
  logger.debug('GET /api/health recibido');
  res.status(200).json({
    success: true,
    message: 'API de WhatsApp está funcionando',
    timestamp: new Date().toISOString()
  });
});

export default router;
