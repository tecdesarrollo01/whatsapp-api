export const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'API Key inválida o faltante',
      code: 'INVALID_API_KEY',
      warning: '⚠️ Usar WhatsApp Web.js puede resultar en bloqueo de tu número'
    });
  }

  next();
};
