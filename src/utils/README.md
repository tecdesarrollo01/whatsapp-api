# 🛠️ Utilidades - WhatsApp API

## QR Viewer (`qr-viewer.js`)

Convierte el base64 del QR devuelto por la API en un HTML legible y hermoso.

### ¿Por qué?

La respuesta de `/api/session/qr` devuelve el QR en formato base64:

```json
{
  "success": true,
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
  "message": "Escanea este código QR con WhatsApp",
  "expiresIn": 60
}
```

Esta utilidad lo convierte en un HTML interactivo con:
- ✨ Interfaz moderna y responsive
- 📱 Instrucciones paso a paso
- ⏱️ Contador de expiración
- 📋 Botón para copiar base64
- ⚠️ Advertencias de seguridad

### Uso

#### Opción 1: Desde CLI (Node.js)

```bash
# Uso básico (genera qr-viewer.html)
node src/utils/qr-viewer.js "iVBORw0KGgoAAAANSUhEUgAAA..."

# Especificar archivo de salida
node src/utils/qr-viewer.js "iVBORw0KGgoAAAANSUhEUgAAA..." mi-qr.html
```

#### Opción 2: Desde Bash/PowerShell (recomendado)

**Windows:**
```powershell
.\scripts\generate-qr-viewer.ps1
# Te pedirá que ingreses el dominio (ej: http://localhost:3000)
```

**Mac/Linux:**
```bash
./scripts/generate-qr-viewer.sh
# Te pedirá que ingreses el dominio (ej: http://localhost:3000)
```

Estos scripts automáticamente:
1. Te piden el dominio por pantalla
2. Obtienen el QR de la API
3. Extraen el base64
4. Generan el HTML
5. Abren el archivo en tu navegador

#### Opción 3: Desde JavaScript

```javascript
const { createQRViewer } = require('./src/utils/qr-viewer');

// Con base64 directo
const filePath = createQRViewer('iVBORw0KGgoAAAANSUhEUgAAA...');

// O desde respuesta de API
const response = await fetch('http://localhost:3000/api/session/qr');
const { qr } = await response.json();
const filePath = createQRViewer(qr, 'custom-qr.html');

console.log(`✅ QR guardado en: ${filePath}`);
```

### Ejemplo completo

```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Iniciar sesión
curl -X POST http://localhost:3000/api/session/start

# Terminal 3: Generar QR viewer (Windows)
.\scripts\generate-qr-viewer.ps1

# O (Mac/Linux)
./scripts/generate-qr-viewer.sh

# ✅ Se abrirá automáticamente en tu navegador
```

### Características

- **Responsive**: Funciona en desktop, tablet y móvil
- **Offline**: El HTML es completamente autónomo (no requiere internet)
- **Interactivo**: Contador de expiración en tiempo real
- **Accesible**: Instrucciones claras en español
- **Seguro**: El base64 se embebe en el HTML, sin conexiones externas

### Archivos

- `src/utils/qr-viewer.js` - Módulo principal
- `scripts/generate-qr-viewer.sh` - Script Bash para Mac/Linux
- `scripts/generate-qr-viewer.ps1` - Script PowerShell para Windows

### Troubleshooting

**Error: "No se pudo obtener el QR"**
- Asegúrate de que el servidor está corriendo: `npm start`
- Verifica que ya llamaste a `/api/session/start`

**El QR no se ve**
- Abre el archivo HTML directamente en tu navegador
- Verifica que el base64 es válido

**Script no se ejecuta (Windows)**
```powershell
# Permitir scripts en PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**¡Listo para escanear! 📱✨**
