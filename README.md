# 🚨 API REST de WhatsApp con Node.js

## ⚠️ ADVERTENCIA CRÍTICA - LÉEME PRIMERO

**WhatsApp NO permite bots o clientes no oficiales.** El uso de esta librería puede resultar en:

- ❌ **Bloqueo temporal o permanente** de tu número de WhatsApp
- ❌ **Pérdida de acceso** a WhatsApp
- ❌ **No hay garantía** de que el número no será bloqueado

### 🛡️ Recomendaciones para minimizar riesgo de bloqueo

1. **NO enviar más de 10-15 mensajes por minuto**
2. **NO enviar mensajes masivos** (aunque la API lo permita)
3. **NO usar en producción** con números comerciales críticos
4. **Implementar delays** entre mensajes (mínimo 3-5 segundos) ✅ Ya incluido
5. **Usar números de prueba**, nunca números principales
6. **Evitar patrones de bot obvios** (respuestas instantáneas, textos idénticos)
7. **NO conectar/desconectar** frecuentemente
8. **Monitorear la actividad** y ser consciente del límite de la API

**💡 Uso recomendado:** Notificaciones ocasionales, alertas, confirmaciones. **NO para envío masivo de marketing.**

---

## 📋 Requisitos

- Node.js 18+ ([descargar](https://nodejs.org/))
- npm o yarn
- Para Docker: Docker Desktop ([descargar](https://www.docker.com/products/docker-desktop))

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
git clone <url-del-repo>
cd whatsapp-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

**Editar `.env`:**

```env
# Puerto del servidor
PORT=3000

# API Key para proteger endpoints (CAMBIAR OBLIGATORIAMENTE)
API_KEY=tu-api-key-super-secreta-aqui

# Orígenes CORS permitidos
ALLOWED_ORIGINS=http://localhost:3000

# Configuración de WhatsApp
WHATSAPP_SESSION_PATH=./.wwebjs_auth
WHATSAPP_TIMEOUT=60000

# Rate Limiting
MESSAGE_RATE_LIMIT_PER_MINUTE=10
MESSAGE_DELAY_SECONDS=3
```

## ▶️ Ejecutar

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

### Con Docker

```bash
# Construir imagen
docker build -t whatsapp-api .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e API_KEY=tu-api-key \
  -v $(pwd)/wwebjs_auth:/app/.wwebjs_auth \
  whatsapp-api

# O con docker-compose (recomendado)
docker-compose up -d
```

## 📡 API Endpoints

### 1. Gestión de Sesión

#### Iniciar sesión
```bash
POST /api/session/start
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Sesión iniciada. Genera el QR con /api/session/qr"
}
```

#### Obtener QR
```bash
GET /api/session/qr
```
**Respuesta (primer intento, esperando escaneo):**
```json
{
  "success": true,
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "message": "Escanea este código QR con WhatsApp",
  "expiresIn": 60,
  "warning": "⚠️ Usar WhatsApp Web.js puede resultar en bloqueo de tu número"
}
```

**Respuesta (ya conectado):**
```json
{
  "success": true,
  "message": "Ya estás conectado",
  "data": {
    "isConnected": true,
    "connectedAs": "Tu Nombre"
  }
}
```

#### Verificar estado
```bash
GET /api/session/status
```

#### Cerrar sesión
```bash
POST /api/session/logout
```

### 2. Envío de Mensajes

#### Enviar mensaje
```bash
POST /api/messages/send
X-API-Key: tu-api-key-super-secreta-aqui
Content-Type: application/json

{
  "number": "573001234567",
  "message": "Hola, este es un mensaje de prueba"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Mensaje enviado correctamente",
  "data": {
    "messageId": "3EB0XXXXX",
    "timestamp": 1700000000,
    "to": "573001234567"
  },
  "warning": "⚠️ No envíes mensajes masivos. Riesgo de bloqueo."
}
```

**Respuesta de error (no conectado):**
```json
{
  "success": false,
  "error": "Cliente de WhatsApp no está conectado",
  "code": "WHATSAPP_NOT_READY",
  "warning": "⚠️ Conecta primero usando /api/session/start y /api/session/qr"
}
```

**Respuesta de error (rate limit):**
```json
{
  "success": false,
  "error": "Límite de mensajes excedido. Máximo 10 por minuto.",
  "code": "RATE_LIMIT_EXCEEDED",
  "warning": "⚠️ Enviar muchos mensajes puede bloquear tu número"
}
```

### 3. Health Check
```bash
GET /api/health
```

---

## 🧪 Ejemplos de Uso

### Con cURL

#### 1. Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/session/start
```

#### 2. Obtener QR (esperar con curl)
```bash
curl http://localhost:3000/api/session/qr
```

#### 3. Enviar mensaje
```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "X-API-Key: tu-api-key-super-secreta-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "573001234567",
    "message": "Hola desde la API"
  }'
```

### Con JavaScript/Fetch

```javascript
// Iniciar sesión
await fetch('http://localhost:3000/api/session/start', {
  method: 'POST'
});

// Esperar a que esté listo
let qrReady = false;
while (!qrReady) {
  const response = await fetch('http://localhost:3000/api/session/qr');
  if (response.status === 200) {
    const data = await response.json();
    console.log('QR:', data.qr); // Mostrar en frontend
    qrReady = true;
  }
  await new Promise(r => setTimeout(r, 1000)); // Esperar 1 segundo
}

// Enviar mensaje
const result = await fetch('http://localhost:3000/api/messages/send', {
  method: 'POST',
  headers: {
    'X-API-Key': 'tu-api-key-super-secreta-aqui',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    number: '573001234567',
    message: 'Hola desde JavaScript'
  })
});

const data = await result.json();
console.log('Resultado:', data);
```

### Con Python

```python
import requests
import time

# Iniciar sesión
response = requests.post('http://localhost:3000/api/session/start')
print(response.json())

# Obtener QR
while True:
    response = requests.get('http://localhost:3000/api/session/qr')
    if response.status_code == 200:
        data = response.json()
        print(f"QR: {data['qr'][:50]}...")
        break
    time.sleep(1)

# Enviar mensaje
response = requests.post(
    'http://localhost:3000/api/messages/send',
    headers={
        'X-API-Key': 'tu-api-key-super-secreta-aqui',
        'Content-Type': 'application/json'
    },
    json={
        'number': '573001234567',
        'message': 'Hola desde Python'
    }
)

print(response.json())
```

---

## 🔒 Seguridad

### API Key
- ✅ Todos los endpoints de mensajería requieren `X-API-Key`
- ✅ Los endpoints de sesión son públicos (necesarios para escanear QR)
- ✅ **Cambiar `API_KEY` en `.env` en producción**

### Rate Limiting
- ✅ 100 requests por 15 minutos (general)
- ✅ 10 mensajes por minuto (estricto)
- ✅ 3 segundos de delay entre mensajes automático

### CORS
- ✅ Configurable en `ALLOWED_ORIGINS`
- ✅ Por defecto: `http://localhost:3000`

### Headers de Seguridad
- ✅ Helmet.js activo (HSTS, CSP, etc.)
- ✅ CORS protegido
- ✅ JSON parsing limitado (10MB)

---

## 📊 Validaciones

### Número de teléfono
- ✅ Debe incluir código de país (ej: `573001234567` para Colombia)
- ✅ Mínimo 10 dígitos
- ✅ No necesita espacios ni caracteres especiales

### Mensaje
- ✅ No puede estar vacío
- ✅ Máximo 4096 caracteres
- ✅ Soporta emojis y caracteres especiales

### Respuestas
- ✅ Todas incluyen warning sobre bloqueos
- ✅ Códigos de error estandarizados
- ✅ Información útil para debugging

---

## 🔧 Estructura del Proyecto

```
whatsapp-api/
├── src/
│   ├── services/
│   │   └── whatsapp.service.js      # Lógica de WhatsApp
│   ├── controllers/
│   │   ├── session.controller.js     # Endpoints de sesión
│   │   └── message.controller.js     # Endpoints de mensajes
│   ├── middlewares/
│   │   ├── auth.middleware.js        # Validación de API Key
│   │   └── rate-limit.middleware.js  # Rate limiting
│   ├── routes/
│   │   └── api.routes.js             # Definición de rutas
│   └── app.js                         # Aplicación principal
├── .wwebjs_auth/                     # Sesión (auto-generado)
├── .env                              # Variables de entorno
├── .env.example                      # Template
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🐛 Troubleshooting

### Error: "Cliente no está listo"
**Causa:** Aún no ha completado el escaneo del QR
**Solución:**
1. Ejecuta `POST /api/session/start`
2. Obtén el QR con `GET /api/session/qr`
3. Escanea con tu teléfono
4. Espera 5-10 segundos
5. Intenta enviar el mensaje nuevamente

### Error: "Número inválido"
**Causa:** El número no incluye código de país
**Solución:**
- Usa formato internacional: `+573001234567` o `573001234567`
- Mínimo 10 dígitos
- Ej: Colombia=57, México=52, Argentina=54

### Error: "Límite de mensajes excedido"
**Causa:** Alcanzaste el rate limit
**Solución:**
- Espera 1 minuto para resetear el contador
- No envíes más de 10 mensajes por minuto
- Implementa delays en tu código cliente

### El QR caduca y no se puede escanear
**Causa:** El QR tiene validez limitada
**Solución:**
1. Recarga el QR con `GET /api/session/qr`
2. Ten el teléfono con WhatsApp abierto
3. Escanea rápidamente

### Contenedor Docker no inicia
**Causa:** Posiblemente faltan dependencias de Chromium
**Solución:**
```bash
# Verificar logs
docker-compose logs -f whatsapp-api

# Reconstruir imagen
docker-compose build --no-cache
docker-compose up -d
```

---

## 📝 Logs

### Ver logs en desarrollo
```bash
npm run dev
```

### Ver logs en Docker
```bash
docker-compose logs -f whatsapp-api
```

---

## ⚡ Mejores Prácticas

### Para evitar bloqueos
1. **Espaciar mensajes:** Mínimo 3-5 segundos entre mensajes
2. **Límite diario:** No más de 100-200 mensajes por día
3. **Patrones naturales:** Evita enviar mensajes idénticos repetidamente
4. **Monitorear:** Revisa la aplicación de WhatsApp regularmente
5. **Backup:** Ten otro número como backup en caso de bloqueo

### Para la API
1. **Almacenar sesión:** Usa la persistencia incluida (`.wwebjs_auth/`)
2. **Reintentos:** Implementa reintentos con backoff exponencial
3. **Logs:** Monitorea los logs de la API
4. **Alertas:** Configura alertas si la conexión se pierde

---

## 🚀 Producción

### Configuración recomendada
```env
PORT=3000
API_KEY=genera-una-api-key-segura-de-32-caracteres
ALLOWED_ORIGINS=https://tudominio.com
NODE_ENV=production
MESSAGE_RATE_LIMIT_PER_MINUTE=5
MESSAGE_DELAY_SECONDS=5
```

### Con nginx (reverse proxy)
```nginx
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Certificado SSL
```bash
# Usar Let's Encrypt con Certbot
sudo certbot certonly --standalone -d api.tudominio.com
```

---

## 📚 Documentación

- **whatsapp-web.js:** https://docs.wwebjs.dev/
- **Express.js:** https://expressjs.com/
- **WhatsApp API oficial:** https://www.whatsapp.com/business/api (no recomendado para este proyecto)

---

## ⚖️ Legal

Este proyecto usa `whatsapp-web.js`, que **NO es oficial de WhatsApp**.

**Términos de servicio de WhatsApp:**
- Prohibido crear bots o clientes no oficiales
- WhatsApp se reserva el derecho de bloquear números
- Uso bajo tu propio riesgo

**Úsalo responsablemente y solo para propósitos legítimos.**

---

## 🤝 Contribuciones

Este es un proyecto educativo. Si deseas mejorar:
1. Haz fork del proyecto
2. Crea una rama para tu feature
3. Commit con mensajes descriptivos
4. Push a la rama
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa la sección **Troubleshooting**
2. Checa los logs de la aplicación
3. Verifica las variables de `.env`
4. Abre un issue en el repositorio

**⚠️ Recuerda:** Este proyecto es para propósitos educativos y de prueba. **NO lo uses para spam o marketing masivo.**

---

**Última actualización:** Noviembre 2024
**Versión:** 1.0.0
**Estado:** Beta
