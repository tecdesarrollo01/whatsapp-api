# Script PowerShell para generar QR viewer desde respuesta de API
# Uso: .\scripts\generate-qr-viewer.ps1

# Pedir dominio por pantalla
$ApiUrl = Read-Host "[*] Ingresa el dominio de la API (ej: http://localhost:3000)"

# Validar que no este vacio
if ([string]::IsNullOrWhiteSpace($ApiUrl)) {
    Write-Host "[ERROR] Debes ingresar un dominio" -ForegroundColor Red
    exit 1
}

$OutputFile = "qr-viewer.html"

Write-Host "[*] Obteniendo QR desde $ApiUrl/api/session/qr..." -ForegroundColor Cyan

try {
    # Obtener respuesta JSON
    $response = Invoke-WebRequest -Uri "$ApiUrl/api/session/qr" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    
    $base64 = $json.qr
    
    if (-not $base64) {
        Write-Host "[ERROR] No se pudo obtener el QR. Respuesta:" -ForegroundColor Red
        Write-Host $response.Content
        exit 1
    }
    
    # Generar HTML
    Write-Host "[*] Generando HTML..." -ForegroundColor Cyan
    & node src/utils/qr-viewer.js $base64 $OutputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[OK] QR Viewer generado exitosamente" -ForegroundColor Green
        Write-Host "[*] Abre en tu navegador:" -ForegroundColor Green
        Write-Host "   file://$(Resolve-Path $OutputFile)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "[*] O abre directamente con:" -ForegroundColor Green
        Write-Host "   start $OutputFile" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "[ERROR] Error: $_" -ForegroundColor Red
    exit 1
}
