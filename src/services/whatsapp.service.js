import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import { execSync } from 'child_process';
import logger from '../logger.js';

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.qrCode = null;
    this.lastMessageTime = 0;
  }

  getChromiumPath() {
    try {
      // Check if PUPPETEER_EXECUTABLE_PATH is already set
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        const path = process.env.PUPPETEER_EXECUTABLE_PATH;
        logger.info({ path }, 'Usando PUPPETEER_EXECUTABLE_PATH configurado');
        return path;
      }

      // Try to find Chromium in common Docker locations
      if (process.env.NODE_ENV === 'production') {
        try {
          const path = execSync("find /ms-playwright -name 'chrome' -type f 2>/dev/null | head -1").toString().trim();
          if (path) {
            logger.info({ path }, '✅ Found Chromium for Docker/Playwright');
            return path;
          }
          logger.warn('No se encontró Chromium en /ms-playwright, se usará autodetección');
        } catch (e) {
          logger.warn({ err: e }, 'Error buscando Chromium en /ms-playwright, se usará autodetección');
        }
      }

      return undefined; // Let Puppeteer auto-detect
    } catch (error) {
      logger.warn({ err: error }, '⚠️ Error detecting Chromium path');
      return undefined;
    }
  }

  async initialize() {
    const chromiumPath = this.getChromiumPath();
    const puppeteerConfig = {
      headless: true,
      timeout: 180000, // Aumentar timeout a 180 segundos
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--ignore-certificate-errors',
        '--disable-web-resources',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--allow-no-sandbox-job',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings'
      ],
      ignoreHTTPSErrors: true,
      protocolTimeout: 180000
    };

    if (chromiumPath) {
      puppeteerConfig.executablePath = chromiumPath;
    }

    logger.info({ chromiumPath, puppeteerConfig }, 'Inicializando cliente de WhatsApp');

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_SESSION_PATH
      }),
      puppeteer: puppeteerConfig
    });

    // Evento: QR generado
    this.client.on('qr', async (qr) => {
      try {
        logger.info('Evento QR recibido desde WhatsApp, generando base64...');
        this.qrCode = await qrcode.toDataURL(qr);
        logger.info('✅ QR generado - Escanea con WhatsApp');
      } catch (error) {
        logger.error({ err: error }, '❌ Error generando QR');
      }
    });

    // Evento: Cliente conectado
    this.client.on('ready', () => {
      this.isReady = true;
      logger.info({ info: this.client.info }, '✅ Cliente de WhatsApp conectado');
      if (this.client.info) {
        logger.info({ pushname: this.client.info.pushname }, '📱 Conectado como');
      }
    });

    // Evento: Cliente desconectado
    this.client.on('disconnected', (reason) => {
      this.isReady = false;
      this.qrCode = null;
      logger.warn({ reason }, '❌ Cliente desconectado');
    });

    // Evento: Error
    this.client.on('error', (error) => {
      logger.error({ err: error }, '❌ Error en cliente WhatsApp (evento error)');
    });

    try {
      logger.debug('Llamando client.initialize()...');
      await this.client.initialize();
      logger.info('client.initialize() completado sin excepciones');
    } catch (error) {
      logger.error({ err: error }, '❌ Error inicializando cliente');
      throw error;
    }
  }

  async sendMessage(number, message) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está conectado');
    }

    if (!number || !message) {
      throw new Error('Número y mensaje son requeridos');
    }

    if (message.length > 4096) {
      throw new Error('El mensaje no puede exceder 4096 caracteres');
    }

    // Validar formato del número (debe incluir código de país)
    if (!/^\d{10,}$/.test(number.replace(/\D/g, ''))) {
      throw new Error('Número inválido. Debe incluir código de país (ej: 573001234567)');
    }

    // Implementar delay de 3 segundos
    const delayMs = parseInt(process.env.MESSAGE_DELAY_SECONDS || '3') * 1000;
    const timeSinceLastMessage = Date.now() - this.lastMessageTime;

    if (timeSinceLastMessage < delayMs) {
      const waitTime = delayMs - timeSinceLastMessage;
      await this.delay(waitTime);
    }

    this.lastMessageTime = Date.now();

    try {
      const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
      const result = await this.client.sendMessage(chatId, message);

      return {
        messageId: result.id._serialized || result.id,
        timestamp: Date.now(),
        to: number
      };
    } catch (error) {
      throw new Error(`Error enviando mensaje: ${error.message}`);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isReady: this.isReady,
      hasQR: !!this.qrCode,
      info: this.isReady ? this.client.info : null,
      connectedAs: this.isReady && this.client.info ? this.client.info.pushname : null
    };
  }

  getQR() {
    return this.qrCode;
  }

  async logout() {
    try {
      if (this.client) {
        await this.client.logout();
        await this.client.destroy();
      }
      this.isReady = false;
      this.qrCode = null;
      logger.info('✅ Sesión de WhatsApp cerrada');
    } catch (error) {
      logger.error({ err: error }, '❌ Error al cerrar sesión');
      throw error;
    }
  }
}

export default new WhatsAppService();
