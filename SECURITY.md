# 🔒 Seguridad - WhatsApp API

## ⚠️ Advertencia de Seguridad Principal

Esta API no es oficial de WhatsApp. El uso incumple los Términos de Servicio de WhatsApp y puede resultar en:

1. **Bloqueo temporal** (24-72 horas)
2. **Bloqueo permanente** del número
3. **Pérdida de acceso** a la cuenta de WhatsApp
4. **Riesgo legal** dependiendo de la jurisdicción

**NO hay forma de recuperar un número bloqueado.**

---

## 🛡️ Medidas de Seguridad Implementadas

### 1. Autenticación (API Key)

La API requiere una clave API válida para acceder a endpoints sensibles:

```bash
curl -H "X-API-Key: tu-api-key" http://localhost:3000/api/messages/send
```

**Mejores prácticas:**
- ✅ Genera una clave fuerte (mínimo 32 caracteres)
- ✅ Guárdala en `.env` (nunca en Git)
- ✅ Rota la clave regularmente en producción
- ✅ No la compartas en logs o mensajes
- ✅ Usa HTTPS en producción

### 2. Rate Limiting

La API implementa límites estrictos:

```
General:     100 requests/15 minutos
Mensajes:    10 mensajes/minuto
```

**Por qué:**
- Evitar detección como bot
- Prevenir abuso
- Proteger tu número
- Respetar límites de WhatsApp

### 3. Validación de Entrada

**Número de teléfono:**
- Requiere código de país
- Mínimo 10 dígitos
- Formato internacional

**Mensaje:**
- Mínimo 1 carácter
- Máximo 4096 caracteres
- No se aceptan mensajes vacíos

### 4. Headers de Seguridad

La API usa Helmet.js para configurar headers seguros:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

### 5. CORS Restringido

Por defecto, solo acepta requests de:
```
http://localhost:3000
```

Editable en `.env`:
```env
ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com
```

### 6. Delays Automáticos

Cada mensaje incluye un delay obligatorio:
```
Configuración: MESSAGE_DELAY_SECONDS=3
Mínimo recomendado: 3-5 segundos
```

---

## 🔐 Configuración de Producción

### 1. Variables de Entorno

```bash
# CAMBIAR OBLIGATORIAMENTE
API_KEY=genera-una-clave-segura-de-32-caracteres

# Configurar según tu dominio
ALLOWED_ORIGINS=https://tudominio.com

# Más estricto en producción
MESSAGE_RATE_LIMIT_PER_MINUTE=5
MESSAGE_DELAY_SECONDS=5

# Dirección del servidor
PORT=443  # o tu puerto seguro
```

### 2. HTTPS/SSL

**Con nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.tudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Firewall

- ✅ Abre solo puertos necesarios (80, 443)
- ✅ Restringe acceso a SSH (22)
- ✅ Usa fail2ban para brute force
- ✅ Configura rate limiting en firewall también

### 4. Monitoreo

```bash
# Monitorear logs
tail -f logs/error.log

# Alertar en exceso de errores
grep "WHATSAPP_NOT_READY" logs/*.log | wc -l

# Revisar intentos fallidos
grep "INVALID_API_KEY" logs/*.log
```

---

## 🚫 Lo Que NO Debes Hacer

### ❌ Masivos

```javascript
// ❌ MALO: Enviar 100 mensajes en 1 segundo
for (let i = 0; i < 100; i++) {
  api.sendMessage(number, message);
}

// ✅ BUENO: Con delay
for (let i = 0; i < 100; i++) {
  await api.sendMessage(number, message);
  await sleep(5000); // 5 segundos
}
```

### ❌ Patrones obvios

```javascript
// ❌ MALO: Mismo mensaje a 100 números
numbers.forEach(n => api.sendMessage(n, "PROMOCIÓN!!"));

// ✅ BUENO: Personalizados, ocasionales
api.sendMessage(number, `Hola ${name}, tu código es ${code}`);
```

### ❌ Información Sensible

```javascript
// ❌ MALO: Enviar contraseñas o datos sensibles
api.sendMessage(number, password);

// ✅ BUENO: Enviar códigos seguros
const code = generateSecureCode();
api.sendMessage(number, `Tu código es: ${code}`);
```

### ❌ Números importantes

```javascript
// ❌ MALO: Usar en números de negocios
const phoneNumber = businessNumber;

// ✅ BUENO: Usar números de prueba
const phoneNumber = testNumber;
```

---

## 🔍 Auditoría de Seguridad

### Checklist de Seguridad

- [ ] API Key está en `.env` (no en Git)
- [ ] `.gitignore` excluye `.env`, `.wwebjs_auth/`
- [ ] HTTPS configurado en producción
- [ ] Rate limiting activo
- [ ] CORS restringido a dominios conocidos
- [ ] Monitoreo de logs activado
- [ ] Backups de sesión configurados
- [ ] Plan de rotación de API Key
- [ ] Documentación de acceso actualizada
- [ ] Test de seguridad realizado

### Comandos de Auditoría

```bash
# Buscar credenciales expuestas
grep -r "API_KEY=" . --exclude-dir=node_modules

# Verificar archivos sensibles en Git
git log --all --oneline -- .env

# Revisar permisos de archivos
ls -la | grep "\.env"

# Verificar puertos abiertos
ss -tlnp | grep 3000

# Revisar procesos Node
ps aux | grep "node src/app.js"
```

---

## 🆘 Incidente de Seguridad

Si tu número es bloqueado:

1. **Inmediato:**
   - Para usar la API inmediatamente
   - No intentes escanear QR nuevamente
   - Revisa si el número está completamente bloqueado

2. **Corto plazo (24-48 horas):**
   - A veces es bloqueo temporal
   - Intenta acceder a WhatsApp manualmente
   - Si funciona, puede haber sido detección de bot

3. **Largo plazo:**
   - Si el bloqueo persiste, es permanente
   - Usa un número diferente
   - Analiza qué causó el bloqueo

4. **Preventivo:**
   - Aumenta los delays entre mensajes
   - Reduce la cantidad de mensajes
   - Revisa los logs para patrones sospechosos
   - Implementa límites personalizados por usuario

---

## 📝 Logs y Debugging

### Habilitar debug mode

```bash
# En desarrollo
NODE_ENV=development npm run dev

# Con logs detallados
DEBUG=* npm run dev
```

### Revisar logs importantes

```bash
# Errores de autenticación
grep "WHATSAPP_NOT_READY" logs/*.log

# Números inválidos
grep "INVALID_NUMBER" logs/*.log

# Rate limits
grep "RATE_LIMIT" logs/*.log

# Errores de mensajes
grep "Error enviando" logs/*.log
```

### Formato de logs

```
[timestamp] [level] [context] message
2024-11-24T08:30:45.123Z INFO [WhatsApp] Cliente conectado
2024-11-24T08:31:00.456Z ERROR [Message] Error enviando: Número inválido
2024-11-24T08:31:05.789Z WARN [RateLimit] Límite excedido
```

---

## 🔑 Gestión de Credenciales

### Generación segura de API Key

```bash
# Opción 1: Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: Usando OpenSSL
openssl rand -hex 32

# Opción 3: Usando el script setup.js
node setup.js
```

### Almacenamiento

- ✅ Guardar en `.env` (no en Git)
- ✅ Usar variables de entorno
- ✅ Usar secretos en Docker/K8s
- ✅ Usar bóvedas de secretos (AWS Secrets Manager, etc.)

### Rotación

```bash
# Mensualmente
1. Generar nueva API Key
2. Actualizar en todas las aplicaciones clientes
3. Esperar a que se replique
4. Eliminar API Key antigua
```

---

## 🎯 Cumplimiento Legal

### Responsabilidad

- ✅ Eres responsable de cumplir los Términos de Servicio de WhatsApp
- ✅ La API es solo para propósitos educativos
- ✅ El uso comercial puede violar leyes de telecomunicaciones
- ✅ Los bloqueos son finales y no reversibles

### GDPR / Privacidad

Si almacenas números de teléfono:
- Obtén consentimiento explícito
- Implementa derecho al olvido
- Protege datos en tránsito (HTTPS)
- Completa con leyes locales

### Spam

- ✅ NO envíes spam o contenido no solicitado
- ✅ Respeta las preferencias de usuarios
- ✅ Implementa un sistema de opt-out
- ✅ Cumple con regulaciones anti-spam

---

## 🧪 Testing de Seguridad

### Pruebas básicas

```bash
# Test de API Key
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{"number":"123","message":"test"}'
# Debería devolver 401 Unauthorized

# Test de Rate Limit
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/messages/send \
    -H "X-API-Key: key" \
    -d '{"number":"573001234567","message":"test"}'
  sleep 0.1
done
# El 11to request debería devolver 429 Too Many Requests

# Test de validación
curl -X POST http://localhost:3000/api/messages/send \
  -H "X-API-Key: key" \
  -d '{"number":"invalid","message":""}'
# Debería devolver 400 Bad Request
```

---

## 📞 Soporte de Seguridad

Si encuentras una vulnerabilidad:

1. **NO la publiques públicamente**
2. **NO la exloits**
3. Contacta a los mantenedores privadamente
4. Proporciona detalles técnicos
5. Espera a que se publique un parche

---

**Última actualización:** Noviembre 2024

**Recuerda:** La seguridad es responsabilidad compartida. 🔒
