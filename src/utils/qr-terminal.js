/**
 * Utilidad para mostrar QR en terminal con actualización en tiempo real
 * Uso: node src/utils/qr-terminal.js <base64-data>
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logger con pino
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

async function displayQRInTerminal(qrData, expiresIn = 60) {
  // Extraer base64 si viene en formato data:image/png;base64,...
  const base64 = qrData.includes(',') ? qrData.split(',')[1] : qrData;

  // Crear archivo temporal con la imagen base64
  const tempDir = path.join(__dirname, '../../.temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const imagePath = path.join(tempDir, 'qr-temp.png');
  const imageBuffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(imagePath, imageBuffer);

  logger.info('QR temporal guardado en: %s', imagePath);

  let secondsLeft = expiresIn;
  let updateCount = 0;

  const interval = setInterval(async () => {
    try {
      logger.info('QR expira en: %d segundos', secondsLeft);

      secondsLeft--;
      updateCount++;

      if (secondsLeft < 0) {
        clearInterval(interval);
        logger.warn('QR expirado. Genera uno nuevo ejecutando el script nuevamente.');
        
        // Limpiar archivo temporal
        try {
          fs.unlinkSync(imagePath);
          logger.info('Archivo temporal eliminado');
        } catch (e) {
          logger.debug('No se pudo eliminar archivo temporal: %s', e.message);
        }
        process.exit(0);
      }
    } catch (error) {
      logger.error({ err: error }, 'Error mostrando QR en terminal');
      clearInterval(interval);
      process.exit(1);
    }
  }, 1000);
}


// Si se ejecuta desde CLI
if (process.argv[1] === __filename) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    logger.info(`
[INFO] Uso:
  node src/utils/qr-terminal.js "<base64-data>" [expires-in-seconds]

[INFO] Ejemplos:
  # Mostrar QR con expiración de 60 segundos (default)
  node src/utils/qr-terminal.js "iVBORw0KGgoAAAANSUhEUgAAA..."

  # Mostrar QR con expiración de 120 segundos
  node src/utils/qr-terminal.js "iVBORw0KGgoAAAANSUhEUgAAA..." 120
    `);
    process.exit(0);
  }

  const base64Data = args[0];
  const expiresIn = parseInt(args[1]) || 60;

  try {
    logger.info('Iniciando visualización de QR en terminal (expira en %d segundos)', expiresIn);
    displayQRInTerminal(base64Data, expiresIn);
  } catch (error) {
    logger.error({ err: error }, 'Error iniciando QR terminal');
    process.exit(1);
  }
}

export { displayQRInTerminal };
