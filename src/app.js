import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.routes.js';
import { generalLimiter } from './middlewares/rate-limit.middleware.js';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Confiar en el proxy (Render / Nginx / etc.) para que express-rate-limit
// pueda leer correctamente la IP del cliente desde X-Forwarded-For
// y evitar ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1);

// Logger de requests HTTP
app.use((req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  logger.info({ method, url: originalUrl }, 'Incoming request');

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info({
      method,
      url: originalUrl,
      statusCode: res.statusCode,
      durationMs
    }, 'Request completed');
  });

  next();
});

// ============ MIDDLEWARES DE SEGURIDAD ============
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"]
    }
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// ============ MIDDLEWARES DE PARSEO ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============ ARCHIVOS ESTÁTICOS ============
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============ RATE LIMITING GENERAL ============
app.use(generalLimiter);

// ============ RUTAS ============
app.use('/api', apiRoutes);

// ============ RUTA DE BIENVENIDA ============
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WhatsApp API v1.0',
    endpoints: {
      session: {
        start: 'POST /api/session/start',
        qr: 'GET /api/session/qr',
        status: 'GET /api/session/status',
        logout: 'POST /api/session/logout'
      },
      messages: {
        send: 'POST /api/messages/send',
        status: 'GET /api/messages/status'
      },
      health: 'GET /api/health'
    },
    warning: '⚠️ WhatsApp NO permite bots o clientes no oficiales. Úsalo responsablemente.',
    documentation: 'Ver README.md para más información'
  });
});

// ============ MANEJO DE ERRORES 404 ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// ============ MANEJO DE ERRORES GLOBAL ============
app.use((error, req, res, next) => {
  logger.error({ err: error }, 'Error no manejado');
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// ============ GRACEFUL SHUTDOWN ============
const server = app.listen(PORT, () => {
  logger.info(`WhatsApp API escuchando en puerto ${PORT}`);
  logger.warn(`ADVERTENCIA CRÍTICA: WhatsApp NO permite bots o clientes no oficiales. El uso de esta API puede resultar en bloqueo del número.`);
});

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  logger.info('Cerrando servidor por SIGINT...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  logger.info('Cerrando servidor por SIGTERM...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

export default app;
