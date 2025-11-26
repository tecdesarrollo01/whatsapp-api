FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Variables de entorno para Puppeteer y fix para SSL en Windows Docker
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NODE_ENV=production \
    NODE_OPTIONS=--openssl-legacy-provider

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copiar código fuente
COPY . .

# Crear directorio para sesión de WhatsApp
RUN mkdir -p .wwebjs_auth && chmod 777 .wwebjs_auth

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Comando de inicio
CMD ["node", "src/app.js"]
