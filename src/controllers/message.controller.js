import whatsappService from '../services/whatsapp.service.js';

const WARNING = '⚠️ No envíes mensajes masivos. Riesgo de bloqueo. Lee la documentación.';

export const sendMessage = async (req, res) => {
  try {
    const { number, message } = req.body;

    // Validaciones básicas
    if (!number || !message) {
      return res.status(400).json({
        success: false,
        error: 'El número y el mensaje son requeridos',
        code: 'MISSING_FIELDS',
        warning: WARNING
      });
    }

    if (typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El mensaje no puede estar vacío',
        code: 'EMPTY_MESSAGE',
        warning: WARNING
      });
    }

    if (message.length > 4096) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje excede 4096 caracteres',
        code: 'MESSAGE_TOO_LONG',
        warning: WARNING
      });
    }

    // Enviar mensaje
    const result = await whatsappService.sendMessage(number, message);

    return res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: result,
      warning: WARNING
    });
  } catch (error) {
    console.error('❌ Error en sendMessage:', error);

    // Determinar tipo de error
    let statusCode = 500;
    let code = 'INTERNAL_ERROR';

    if (error.message.includes('no está conectado')) {
      statusCode = 503;
      code = 'WHATSAPP_NOT_READY';
    } else if (error.message.includes('Número inválido')) {
      statusCode = 400;
      code = 'INVALID_NUMBER';
    } else if (error.message.includes('requeridos')) {
      statusCode = 400;
      code = 'MISSING_FIELDS';
    }

    return res.status(statusCode).json({
      success: false,
      error: error.message,
      code: code,
      warning: WARNING
    });
  }
};

export const getStatus = async (req, res) => {
  try {
    const status = whatsappService.getStatus();

    return res.status(200).json({
      success: true,
      data: status,
      warning: '⚠️ Usar WhatsApp Web.js puede resultar en bloqueo de tu número'
    });
  } catch (error) {
    console.error('❌ Error en getStatus:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener estado',
      code: 'STATUS_ERROR'
    });
  }
};
