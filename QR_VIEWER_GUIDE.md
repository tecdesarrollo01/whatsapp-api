# 📱 Guía Rápida: Visualizar QR

## El Problema

Cuando llamas a `/api/session/qr`, recibes base64 que no es legible:

```json
{
  "success": true,
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
  "message": "Escanea este código QR con WhatsApp",
  "expiresIn": 60
}
```

## La Solución

Usa la utilidad `qr-viewer` para convertirlo en HTML hermoso e interactivo.

---

## 🚀 Uso Rápido

### Windows (PowerShell)
```powershell
.\scripts\generate-qr-viewer.ps1
# Te pedirá que ingreses el dominio (ej: http://localhost:3000)
```

### Mac/Linux (Bash)
```bash
chmod +x scripts/generate-qr-viewer.sh
./scripts/generate-qr-viewer.sh
# Te pedirá que ingreses el dominio (ej: http://localhost:3000)
```

### Desde Node.js
```bash
# Obtener QR y generar HTML
curl http://localhost:3000/api/session/qr | jq -r '.qr' | xargs -I {} node src/utils/qr-viewer.js {}
```

---

## ✨ Características

- ✅ Interfaz moderna y responsive
- ✅ Instrucciones paso a paso
- ✅ Contador de expiración en tiempo real
- ✅ Botón para copiar base64
- ✅ Advertencias de seguridad
- ✅ Completamente offline (sin conexiones externas)

---

## 📂 Archivos

- `src/utils/qr-viewer.js` - Módulo principal
- `scripts/generate-qr-viewer.sh` - Script Bash
- `scripts/generate-qr-viewer.ps1` - Script PowerShell
- `src/utils/README.md` - Documentación completa

---

**¡Listo para escanear! 📱✨**
