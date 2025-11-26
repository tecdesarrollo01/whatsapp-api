#!/bin/bash

# Script para generar QR viewer desde respuesta de API
# Uso: ./scripts/generate-qr-viewer.sh

# Pedir dominio por pantalla
read -p "📱 Ingresa el dominio de la API (ej: http://localhost:3000): " API_URL

# Validar que no esté vacío
if [ -z "$API_URL" ]; then
    echo "❌ Error: Debes ingresar un dominio"
    exit 1
fi

OUTPUT_FILE="${1:-qr-viewer.html}"

echo "🔄 Obteniendo QR desde $API_URL/api/session/qr..."

# Obtener respuesta JSON
RESPONSE=$(curl -s "$API_URL/api/session/qr")

# Extraer base64
BASE64=$(echo "$RESPONSE" | jq -r '.qr // empty')

if [ -z "$BASE64" ]; then
    echo "❌ Error: No se pudo obtener el QR. Respuesta:"
    echo "$RESPONSE"
    exit 1
fi

# Generar HTML
node src/utils/qr-viewer.js "$BASE64" "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ QR Viewer generado exitosamente"
    echo "📂 Abre en tu navegador:"
    echo "   file://$(pwd)/$OUTPUT_FILE"
    echo ""
    echo "💡 O abre directamente con:"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   open $OUTPUT_FILE"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "   xdg-open $OUTPUT_FILE"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "   start $OUTPUT_FILE"
    fi
fi
