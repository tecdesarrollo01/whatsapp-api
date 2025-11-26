import logger from '../logger.js';

export const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    logger.warn({ hasApiKey: !!apiKey }, 'Solicitud con API Key inválida o faltante');
    return res.status(401).json({
      success: false,
      error: 'API Key inválida o faltante',
      code: 'INVALID_API_KEY',
      warning: '⚠️ Usar WhatsApp Web.js puede resultar en bloqueo de tu número'
    });
  }

  logger.debug('API Key válida, continuando con la solicitud');
  next();
};
