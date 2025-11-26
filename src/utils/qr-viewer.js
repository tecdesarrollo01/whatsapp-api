/**
 * Utilidad para convertir respuesta QR base64 a HTML legible
 * Uso: node src/utils/qr-viewer.js <base64-data>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';

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

function createQRViewer(qrData, outputPath = 'qr-viewer.html') {
  // Extraer base64 si viene en formato data:image/png;base64,...
  const base64 = qrData.includes(',') ? qrData.split(',')[1] : qrData;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp QR Code Viewer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        
        .header {
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        .qr-container {
            background: #f5f5f5;
            border-radius: 15px;
            padding: 20px;
            margin: 30px 0;
            display: inline-block;
        }
        
        .qr-container img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
        }
        
        .info {
            background: #f0f7ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
        }
        
        .info p {
            color: #333;
            font-size: 14px;
            margin: 8px 0;
            line-height: 1.6;
        }
        
        .info strong {
            color: #667eea;
        }
        
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
        }
        
        .warning p {
            color: #856404;
            font-size: 13px;
            line-height: 1.6;
        }
        
        .instructions {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
        }
        
        .instructions p {
            color: #2e7d32;
            font-size: 13px;
            line-height: 1.8;
            margin: 8px 0;
        }
        
        .instructions ol {
            margin-left: 20px;
            color: #2e7d32;
            font-size: 13px;
        }
        
        .instructions li {
            margin: 8px 0;
        }
        
        .timer {
            font-size: 12px;
            color: #999;
            margin-top: 15px;
        }
        
        .copy-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 15px;
            transition: background 0.3s;
        }
        
        .copy-btn:hover {
            background: #764ba2;
        }
        
        .copy-btn:active {
            transform: scale(0.98);
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📱 WhatsApp QR Code</h1>
            <p>Escanea este código con tu teléfono</p>
        </div>
        
        <div class="qr-container">
            <img src="data:image/png;base64,${base64}" alt="WhatsApp QR Code" id="qrImage">
        </div>
        
        <div class="info">
            <p><strong>✅ Estado:</strong> QR generado correctamente</p>
            <p><strong>⏱️ Expira en:</strong> 60 segundos</p>
            <p><strong>🔄 Acción:</strong> Abre WhatsApp en tu teléfono y escanea este código</p>
        </div>
        
        <div class="instructions">
            <p><strong>📋 Pasos para conectar:</strong></p>
            <ol>
                <li>Abre WhatsApp en tu teléfono</li>
                <li>Ve a Configuración → Dispositivos vinculados</li>
                <li>Toca "Vincular un dispositivo"</li>
                <li>Apunta la cámara a este código QR</li>
                <li>Espera a que se conecte (puede tardar 10-30 segundos)</li>
            </ol>
        </div>
        
        <div class="warning">
            <p>
                <strong>⚠️ Advertencia importante:</strong><br>
                Usar WhatsApp Web.js puede resultar en bloqueo de tu número de teléfono. 
                Usa esta herramienta solo para propósitos de prueba y desarrollo. 
                No la uses para spam o actividades no autorizadas.
            </p>
        </div>
        
        <button class="copy-btn" onclick="copyBase64()">📋 Copiar Base64</button>
        
        <div class="timer">
            ⏳ Generado: ${new Date().toLocaleString('es-ES')}
        </div>
        
        <div class="footer">
            <p>WhatsApp API - QR Viewer</p>
        </div>
    </div>
    
    <script>
        function copyBase64() {
            const base64 = '${base64}';
            navigator.clipboard.writeText(base64).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = '✅ Copiado al portapapeles';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            }).catch(err => {
                alert('Error al copiar: ' + err);
            });
        }
        
        // Auto-refresh si expira
        let secondsLeft = 60;
        setInterval(() => {
            secondsLeft--;
            if (secondsLeft <= 0) {
                document.querySelector('.timer').innerHTML = '❌ QR expirado. Recarga la página para generar uno nuevo.';
                document.querySelector('#qrImage').style.opacity = '0.5';
            }
        }, 1000);
    </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
  return outputPath;
}

// Si se ejecuta desde CLI
if (process.argv[1] === __filename) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    logger.info(`
[INFO] Uso:
  node src/utils/qr-viewer.js "<base64-data>" [output-path]

[INFO] Ejemplos:
  # Usar base64 directo
  node src/utils/qr-viewer.js "iVBORw0KGgoAAAANSUhEUgAAA..." 
  
  # Especificar archivo de salida
  node src/utils/qr-viewer.js "iVBORw0KGgoAAAANSUhEUgAAA..." my-qr.html
  
  # Desde respuesta curl (guardar JSON primero)
  curl http://localhost:3000/api/session/qr > qr-response.json
  node src/utils/qr-viewer.js "$(jq -r '.qr' qr-response.json)"
    `);
    process.exit(0);
  }
  
  const base64Data = args[0];
  const outputPath = args[1] || 'qr-viewer.html';
  
  try {
    const filePath = createQRViewer(base64Data, outputPath);
    logger.info('QR Viewer creado: %s', filePath);
    logger.info('Abre en tu navegador: file://%s', path.resolve(filePath));
  } catch (error) {
    logger.error({ err: error }, 'Error creando QR Viewer');
    process.exit(1);
  }
}

export { createQRViewer };
