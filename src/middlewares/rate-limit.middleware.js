import rateLimit from 'express-rate-limit';

// Límite general de la API
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos por defecto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Demasiadas peticiones, intenta más tarde',
    warning: '⚠️ Usar WhatsApp Web.js puede resultar en bloqueo de tu número'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Límite estricto para envío de mensajes (CRÍTICO)
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: parseInt(process.env.MESSAGE_RATE_LIMIT_PER_MINUTE || '10'),
  message: {
    success: false,
    error: 'Límite de mensajes excedido. Máximo 10 por minuto.',
    code: 'RATE_LIMIT_EXCEEDED',
    warning: '⚠️ Enviar muchos mensajes puede bloquear tu número. Reduce la frecuencia de envío.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
