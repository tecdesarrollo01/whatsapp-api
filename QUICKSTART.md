# ⚡ Quick Start - 5 Minutos

## 🚨 Antes que nada: ADVERTENCIA

**WhatsApp NO permite bots.** Puedes ser bloqueado permanentemente.

- ✅ Usa solo para propósitos de prueba
- ✅ Usa un número de prueba, NO tu número real
- ✅ NO envíes mensajes masivos

---

## ✅ Paso 1: Preparar el ambiente

```bash
# Clonar o descargar el proyecto
cd /ruta/a/whatsapp-api

# Instalar dependencias
npm install
```

## ✅ Paso 2: Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env (IMPORTANTE: cambiar API_KEY)
# Abrir con tu editor favorito y editar:
# API_KEY=cambia-esto-por-algo-seguro
```

## ✅ Paso 3: Iniciar servidor

### Terminal 1 - Servidor
```bash
npm run dev
# Deberías ver:
# ╔═════════════════════════════════════════╗
# ║   WhatsApp API escuchando en :3000      ║
```

### Terminal 2 - Conectar WhatsApp

#### 1. Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/session/start
```

#### 2. Obtener QR
```bash
curl http://localhost:3000/api/session/qr
```

Guarda el resultado en un archivo `qr.json` y abre el contenido del campo `qr` en tu navegador (es base64).

Alternativamente, en Node.js:
```javascript
const response = await fetch('http://localhost:3000/api/session/qr');
const data = await response.json();
console.log(data.qr); // Copia esto a: https://codebeautify.org/base64-to-image
```

#### 3. Escanear QR
- Abre tu teléfono con WhatsApp
- Ve a: **Ajustes → Dispositivos vinculados → Vincular un dispositivo**
- Escanea el QR

#### 4. Verificar conexión
```bash
curl http://localhost:3000/api/session/status
# Deberías ver: "isConnected": true
```

## ✅ Paso 4: Enviar primer mensaje

```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "X-API-Key: cambia-esto-por-algo-seguro" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "573001234567",
    "message": "¡Primer mensaje desde API!"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Mensaje enviado correctamente",
  "data": {
    "messageId": "3EB0...",
    "timestamp": 1700000000,
    "to": "573001234567"
  }
}
```

---

## 🐳 Opción: Usar Docker

### Sin docker-compose
```bash
# Construir imagen
docker build -t whatsapp-api .

# Ejecutar
docker run -p 3000:3000 \
  -e API_KEY=tu-api-key \
  -v $(pwd)/wwebjs_auth:/app/.wwebjs_auth \
  whatsapp-api
```

### Con docker-compose
```bash
# Editar .env
nano .env

# Ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## 🔑 API Key (IMPORTANTE)

La API Key protege tus endpoints. **Cámbiala en producción**.

En el archivo `.env`:
```env
API_KEY=tu-api-key-super-secreta-aqui
```

Luego inclúyela en cada request:
```bash
curl -H "X-API-Key: tu-api-key-super-secreta-aqui" ...
```

---

## 📞 Formato de número

El número debe incluir el código de país:

```
✅ Correcto:
- 573001234567    (Colombia)
- 5215551234567   (México)
- 541145551234    (Argentina)
- 5491234567890   (Argentina)

❌ Incorrecto:
- 3001234567      (Falta código de país)
- +573001234567   (No usar + en la API)
```

---

## ✨ Endpoints básicos

```
# Sin autenticación
POST   /api/session/start       → Iniciar sesión
GET    /api/session/qr          → Obtener QR
GET    /api/session/status      → Ver estado
POST   /api/session/logout      → Cerrar sesión
GET    /api/health              → Verificar que está vivo

# Con API Key en header
POST   /api/messages/send       → Enviar mensaje
GET    /api/messages/status     → Estado de mensajería
```

---

## 🐛 Problemas comunes

### "Cliente no está conectado"
```
→ Aún no escaneaste el QR
→ Solución: Ejecuta /api/session/start y /api/session/qr
```

### "Número inválido"
```
→ Falta código de país
→ Solución: Usa formato 573001234567 (con código)
```

### "Límite excedido"
```
→ Enviaste más de 10 mensajes en 1 minuto
→ Solución: Espera 1 minuto, luego intenta de nuevo
```

### "QR expirado"
```
→ El QR solo dura ~60 segundos
→ Solución: Llama a /api/session/qr nuevamente
```

### Contenedor Docker no inicia
```bash
→ Ver logs:
docker-compose logs -f whatsapp-api

→ Reconstruir:
docker-compose build --no-cache
```

---

## 📚 Siguiente paso

Leer **README.md** para:
- Documentación completa
- Mejores prácticas
- Ejemplos en otros lenguajes
- Configuración de producción
- Troubleshooting detallado

Leer **EJEMPLOS.md** para:
- Ejemplos de JavaScript/React/Python
- Scripts para casos de uso reales
- Clases reutilizables
- Integración con bases de datos

---

## 🎯 Checklist de implementación

- [ ] Dependencias instaladas (`npm install`)
- [ ] `.env` configurado con API_KEY personalizada
- [ ] Servidor ejecutándose (`npm run dev`)
- [ ] QR escaneado en WhatsApp
- [ ] Estado conectado (`/api/session/status` = true)
- [ ] Primer mensaje enviado
- [ ] Entendidas las advertencias de bloqueo

---

## ⚠️ ÚLTIMA ADVERTENCIA

Si WhatsApp detecta actividad de bot:
1. Recibirás un aviso en la app
2. Luego bloqueará temporalmente el número
3. Después puede ser bloqueo permanente
4. No hay forma de recuperar un número bloqueado

**Usa responsablemente. 🙏**

---

**Listo para empezar? 🚀**

Ejecuta en terminal:
```bash
npm run dev
```

Y luego en otra:
```bash
curl -X POST http://localhost:3000/api/session/start
```

¡Que disfrutes! 🎉
