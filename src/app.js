import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.routes.js';
import { generalLimiter } from './middlewares/rate-limit.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Confiar en el proxy (Render / Nginx / etc.) para que express-rate-limit
// pueda leer correctamente la IP del cliente desde X-Forwarded-For
// y evitar ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1);

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
  console.error('❌ Error no manejado:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// ============ GRACEFUL SHUTDOWN ============
const server = app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════╗
║   WhatsApp API escuchando en :${PORT}      ║
║   Servidor listo para recibir requests   ║
╚═════════════════════════════════════════╝

⚠️  ADVERTENCIA CRÍTICA:
WhatsApp NO permite bots o clientes no oficiales.
El uso de esta API puede resultar en:
- Bloqueo temporal o permanente del número
- Pérdida de acceso a WhatsApp
- No hay garantía de que el número no será bloqueado

Para minimizar riesgos:
✓ NO enviar más de 10-15 mensajes por minuto
✓ NO enviar mensajes masivos
✓ NO usar en producción con números importantes
✓ Implementar delays entre mensajes (mínimo 3-5 segundos)
✓ Usar números de prueba, nunca números comerciales críticos

Para más información, consulta el README.md
  `);
});

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  console.log('\n⏹️  Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Cerrando servidor por SIGTERM...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

export default app;
