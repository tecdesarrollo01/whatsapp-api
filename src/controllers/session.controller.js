import whatsappService from '../services/whatsapp.service.js';
import logger from '../logger.js';

const WARNING = '⚠️ Usar WhatsApp Web.js puede resultar en bloqueo de tu número. Usa solo para propósitos de prueba.';

export const startSession = async (req, res) => {
  try {
    logger.info('POST /api/session/start recibido');
    const status = whatsappService.getStatus();

    logger.debug({ status }, 'Estado actual antes de iniciar sesión');

    if (status.isReady) {
      return res.status(200).json({
        success: true,
        message: 'Sesión ya está activa',
        data: status,
        warning: WARNING
      });
    }

    // Inicializar cliente en background (sin esperar)
    logger.info('Iniciando cliente de WhatsApp en background');
    whatsappService.initialize(); // No usar await

    return res.status(202).json({
      success: true,
      message: 'Inicializando sesión. Consulta el QR con /api/session/qr',
      data: {
        isReady: false,
        hasQR: false,
        isInitializing: true
      },
      warning: WARNING
    });
  } catch (error) {
    logger.error({ err: error }, '❌ Error iniciando sesión en startSession');
    return res.status(500).json({
      success: false,
      error: 'Error iniciando sesión: ' + error.message,
      code: 'SESSION_INIT_ERROR',
      warning: WARNING
    });
  }
};

export const getQR = async (req, res) => {
  try {
    const qrCode = whatsappService.getQR();
    const status = whatsappService.getStatus();

    if (status.isReady) {
      return res.status(200).json({
        success: true,
        message: 'Ya estás conectado',
        data: {
          isConnected: true,
          connectedAs: status.connectedAs
        },
        warning: WARNING
      });
    }

    if (!qrCode) {
      return res.status(202).json({
        success: true,
        message: 'QR aún no está disponible. Intenta nuevamente en unos segundos.',
        code: 'QR_NOT_READY',
        warning: WARNING
      });
    }

    return res.status(200).json({
      success: true,
      qr: qrCode,
      message: 'Escanea este código QR con WhatsApp',
      expiresIn: 60,
      warning: WARNING
    });
  } catch (error) {
    logger.error({ err: error }, 'Error obteniendo QR');
    return res.status(500).json({
      success: false,
      error: 'Error obteniendo QR',
      code: 'QR_ERROR',
      warning: WARNING
    });
  }
};

export const getSessionStatus = async (req, res) => {
  try {
    const status = whatsappService.getStatus();

    return res.status(200).json({
      success: true,
      data: {
        isConnected: status.isReady,
        connectedAs: status.connectedAs,
        info: status.info
      },
      warning: WARNING
    });
  } catch (error) {
    logger.error({ err: error }, 'Error obteniendo estado');
    return res.status(500).json({
      success: false,
      error: 'Error obteniendo estado',
      code: 'STATUS_ERROR'
    });
  }
};

export const logout = async (req, res) => {
  try {
    await whatsappService.logout();

    return res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente',
      warning: WARNING
    });
  } catch (error) {
    logger.error({ err: error }, 'Error cerrando sesión');
    return res.status(500).json({
      success: false,
      error: 'Error cerrando sesión: ' + error.message,
      code: 'LOGOUT_ERROR',
      warning: WARNING
    });
  }
};
