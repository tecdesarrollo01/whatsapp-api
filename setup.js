#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function generateApiKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

async function run() {
  console.log(`
╔════════════════════════════════════════════╗
║   WhatsApp API - Setup Inicial            ║
║   Sigue las instrucciones para configurar  ║
╚════════════════════════════════════════════╝
  `);

  console.log('\n⚠️  ADVERTENCIA CRÍTICA:');
  console.log('WhatsApp NO permite bots. Riesgo de bloqueo permanente.\n');

  const envPath = path.join(__dirname, '.env');
  const examplePath = path.join(__dirname, '.env.example');

  // Si .env ya existe
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  Ya existe un .env. ¿Quieres sobrescribir? (s/n): ');
    if (overwrite.toLowerCase() !== 's') {
      console.log('✅ Setup cancelado');
      rl.close();
      return;
    }
  }

  // Generar API Key
  console.log('\n🔑 Generando API Key segura...');
  const apiKey = await generateApiKey();
  console.log(`✅ API Key generada: ${apiKey}`);

  // Solicitar puerto
  const port = await question('\n📡 ¿Puerto para el servidor? (Por defecto 3000): ');
  const finalPort = port || '3000';

  // Solicitar orígenes CORS
  const origins = await question('\n🔒 ¿Orígenes CORS permitidos? (Por defecto http://localhost:3000): ');
  const finalOrigins = origins || 'http://localhost:3000';

  // Solicitar delay de mensajes
  const delay = await question('\n⏱️  ¿Delay entre mensajes en segundos? (Por defecto 3): ');
  const finalDelay = delay || '3';

  // Solicitar límite de mensajes por minuto
  const rateLimit = await question('\n📊 ¿Límite de mensajes por minuto? (Por defecto 10): ');
  const finalRateLimit = rateLimit || '10';

  // Leer .env.example
  let envContent = fs.readFileSync(examplePath, 'utf-8');

  // Reemplazar valores
  envContent = envContent
    .replace(/API_KEY=.*/g, `API_KEY=${apiKey}`)
    .replace(/PORT=.*/g, `PORT=${finalPort}`)
    .replace(/ALLOWED_ORIGINS=.*/g, `ALLOWED_ORIGINS=${finalOrigins}`)
    .replace(/MESSAGE_DELAY_SECONDS=.*/g, `MESSAGE_DELAY_SECONDS=${finalDelay}`)
    .replace(/MESSAGE_RATE_LIMIT_PER_MINUTE=.*/g, `MESSAGE_RATE_LIMIT_PER_MINUTE=${finalRateLimit}`);

  // Escribir .env
  fs.writeFileSync(envPath, envContent, 'utf-8');

  console.log('\n✅ Archivo .env creado\n');
  console.log('📋 Configuración resumida:');
  console.log(`   Puerto: ${finalPort}`);
  console.log(`   API Key: ${apiKey}`);
  console.log(`   CORS: ${finalOrigins}`);
  console.log(`   Delay mensajes: ${finalDelay}s`);
  console.log(`   Rate limit: ${finalRateLimit} msg/min`);

  console.log('\n📚 Próximos pasos:');
  console.log('   1. Inicia el servidor: npm run dev');
  console.log('   2. Abre otra terminal: curl -X POST http://localhost:3000/api/session/start');
  console.log('   3. Obtén el QR: curl http://localhost:3000/api/session/qr');
  console.log('   4. Escanea con WhatsApp');
  console.log('   5. ¡Envía tu primer mensaje!');

  console.log('\n📖 Documentación:');
  console.log('   - Inicio rápido: cat QUICKSTART.md');
  console.log('   - Documentación completa: cat README.md');
  console.log('   - Ejemplos de código: cat EJEMPLOS.md');

  console.log('\n✨ ¡Setup completado! Disfruta la API\n');

  rl.close();
}

run().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
