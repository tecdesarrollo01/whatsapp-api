# 📚 Ejemplos de Uso - API WhatsApp

## 🚀 Quick Start (5 minutos)

### 1. Instalar y ejecutar
```bash
npm install
npm run dev
```

### 2. Iniciar sesión (en otra terminal)
```bash
# Iniciar cliente
curl -X POST http://localhost:3000/api/session/start

# Obtener QR (guardar como qr.json)
curl http://localhost:3000/api/session/qr > qr.json

# Ver estado
curl http://localhost:3000/api/session/status
```

### 2b. Visualizar QR en HTML legible (Windows/Mac/Linux)

**Opción 1: Usar el script PowerShell (Windows)**
```powershell
.\scripts\generate-qr-viewer.ps1
# Te pedirá el dominio (ej: http://localhost:3000)
# Se abrirá automáticamente en tu navegador
```

**Opción 2: Usar el script Bash (Mac/Linux)**
```bash
chmod +x scripts/generate-qr-viewer.sh
./scripts/generate-qr-viewer.sh
# Te pedirá el dominio (ej: http://localhost:3000)
# Se abrirá automáticamente en tu navegador
```

**Opción 3: Desde Node.js directamente**
```bash
# Obtener QR y convertir a HTML
curl http://localhost:3000/api/session/qr | jq -r '.qr' | xargs -I {} node src/utils/qr-viewer.js {}

# O especificar archivo de salida
curl http://localhost:3000/api/session/qr | jq -r '.qr' | xargs -I {} node src/utils/qr-viewer.js {} mi-qr.html
```

**Opción 4: Desde JavaScript**
```javascript
const { createQRViewer } = require('./src/utils/qr-viewer');

// Obtener QR de la API
const response = await fetch('http://localhost:3000/api/session/qr');
const { qr } = await response.json();

// Generar HTML
const filePath = createQRViewer(qr, 'mi-qr.html');
console.log(`QR guardado en: ${filePath}`);
```

### 3. Enviar primer mensaje
```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "X-API-Key: tu-api-key-super-secreta-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "573001234567",
    "message": "Mi primer mensaje por API 🎉"
  }'
```

---

## 💻 Ejemplos por Lenguaje

### cURL / Bash

#### Script para enviar múltiples mensajes
```bash
#!/bin/bash

API_KEY="tu-api-key-super-secreta-aqui"
API_URL="http://localhost:3000/api"

# Array de números
NUMBERS=("573001234567" "573009876543" "573015550000")
MESSAGE="Hola, mensaje automático desde Bash"

for number in "${NUMBERS[@]}"; do
  echo "Enviando a $number..."
  curl -X POST "$API_URL/messages/send" \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"number\": \"$number\", \"message\": \"$MESSAGE\"}"

  # Esperar 4 segundos entre mensajes (más del delay de 3s)
  sleep 4
done

echo "✅ Listo"
```

#### Monitoreo continuo de estado
```bash
#!/bin/bash

API_URL="http://localhost:3000/api"

echo "Monitoreando estado de WhatsApp..."
while true; do
  STATUS=$(curl -s "$API_URL/session/status" | jq '.data.isConnected')
  TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

  if [ "$STATUS" = "true" ]; then
    echo "[$TIMESTAMP] ✅ Conectado"
  else
    echo "[$TIMESTAMP] ❌ Desconectado"
  fi

  sleep 10
done
```

---

### JavaScript/Node.js

#### Cliente simple
```javascript
const API_URL = 'http://localhost:3000/api';
const API_KEY = 'tu-api-key-super-secreta-aqui';

async function initSession() {
  const response = await fetch(`${API_URL}/session/start`, {
    method: 'POST'
  });
  const data = await response.json();
  console.log('Sesión iniciada:', data.message);
}

async function getQR() {
  const response = await fetch(`${API_URL}/session/qr`);
  const data = await response.json();

  if (data.qr) {
    console.log('QR disponible (base64):', data.qr.substring(0, 50) + '...');
    // En frontend: mostrar con: <img src={data.qr} />
  } else {
    console.log('QR aún no disponible, intenta nuevamente');
  }

  return data;
}

async function sendMessage(number, message) {
  const response = await fetch(`${API_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ number, message })
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ Mensaje enviado:', data.data.messageId);
  } else {
    console.error('❌ Error:', data.error);
  }

  return data;
}

async function getStatus() {
  const response = await fetch(`${API_URL}/session/status`);
  const data = await response.json();
  console.log('Estado:', data.data);
  return data;
}

async function logout() {
  const response = await fetch(`${API_URL}/session/logout`, {
    method: 'POST'
  });
  const data = await response.json();
  console.log('Sesión cerrada:', data.message);
}

// Uso
(async () => {
  await initSession();
  await new Promise(r => setTimeout(r, 2000)); // Esperar 2s
  await getQR();

  // Esperar a que escanee (implementar con UI real)
  await new Promise(r => setTimeout(r, 30000)); // 30s

  const status = await getStatus();

  if (status.data.isConnected) {
    await sendMessage('573001234567', 'Hola desde Node.js');
  }
})();
```

#### Clase reutilizable
```javascript
class WhatsAppAPI {
  constructor(apiKey, baseUrl = 'http://localhost:3000/api') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.requiresAuth && { 'X-API-Key': this.apiKey })
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    return await response.json();
  }

  async init() {
    return this.request('/session/start', { method: 'POST' });
  }

  async getQR() {
    return this.request('/session/qr');
  }

  async getStatus() {
    return this.request('/session/status');
  }

  async logout() {
    return this.request('/session/logout', { method: 'POST' });
  }

  async sendMessage(number, message) {
    return this.request('/messages/send', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ number, message })
    });
  }

  async waitForConnection(maxWaitMs = 60000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getStatus();
      if (status.data?.isConnected) {
        return true;
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    return false;
  }
}

// Uso
const whatsapp = new WhatsAppAPI('tu-api-key-super-secreta-aqui');

(async () => {
  await whatsapp.init();
  const isConnected = await whatsapp.waitForConnection();

  if (isConnected) {
    const result = await whatsapp.sendMessage(
      '573001234567',
      'Usando clase WhatsAppAPI'
    );
    console.log(result);
  }
})();
```

---

### React

#### Hook personalizado
```javascript
import { useState, useCallback, useEffect } from 'react';

const useWhatsAppAPI = (apiKey) => {
  const [state, setState] = useState({
    qr: null,
    isConnected: false,
    loading: false,
    error: null,
    connectedAs: null
  });

  const API_URL = 'http://localhost:3000/api';

  const request = useCallback(async (endpoint, options = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.auth && { 'X-API-Key': apiKey })
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      return await response.json();
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, [apiKey]);

  const initSession = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await request('/session/start', { method: 'POST' });
    } catch (error) {
      console.error('Error iniciando sesión:', error);
    }
  }, [request]);

  const getQR = useCallback(async () => {
    const data = await request('/session/qr');
    if (data.qr) {
      setState(prev => ({ ...prev, qr: data.qr }));
    }
    return data;
  }, [request]);

  const checkStatus = useCallback(async () => {
    const data = await request('/session/status');
    setState(prev => ({
      ...prev,
      isConnected: data.data?.isConnected || false,
      connectedAs: data.data?.connectedAs || null
    }));
    return data;
  }, [request]);

  const sendMessage = useCallback(async (number, message) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await request('/messages/send', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ number, message })
      });
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  }, [request]);

  const logout = useCallback(async () => {
    const result = await request('/session/logout', { method: 'POST' });
    setState(prev => ({
      ...prev,
      qr: null,
      isConnected: false,
      connectedAs: null
    }));
    return result;
  }, [request]);

  // Monitorear estado cada 5 segundos
  useEffect(() => {
    if (state.isConnected) {
      const interval = setInterval(() => {
        checkStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [state.isConnected, checkStatus]);

  return {
    ...state,
    initSession,
    getQR,
    checkStatus,
    sendMessage,
    logout
  };
};

// Componente de uso
function WhatsAppChat() {
  const API_KEY = 'tu-api-key-super-secreta-aqui';
  const {
    qr,
    isConnected,
    loading,
    error,
    connectedAs,
    initSession,
    getQR,
    sendMessage
  } = useWhatsAppAPI(API_KEY);

  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    if (!qr && !isConnected) {
      const interval = setInterval(getQR, 2000);
      return () => clearInterval(interval);
    }
  }, [qr, isConnected, getQR]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!number || !message) return;

    const result = await sendMessage(number, message);
    if (result.success) {
      setMessage('');
      setNumber('');
    }
  };

  return (
    <div className="whatsapp-chat">
      <h1>WhatsApp Chat API</h1>

      {isConnected ? (
        <div className="connected">
          <p>✅ Conectado como: {connectedAs}</p>
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Número (573001234567)"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={loading}
            />
            <textarea
              placeholder="Mensaje"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !number || !message}>
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      ) : (
        <div className="qr-container">
          {qr ? (
            <>
              <p>Escanea este QR con WhatsApp:</p>
              <img src={qr} alt="QR Code" />
            </>
          ) : (
            <p>Cargando QR...</p>
          )}
        </div>
      )}

      <p className="warning">
        ⚠️ Usar WhatsApp Web.js puede resultar en bloqueo de tu número
      </p>
    </div>
  );
}

export default WhatsAppChat;
```

---

### Python

#### Cliente básico
```python
import requests
import time
import json
from typing import Optional

class WhatsAppAPIClient:
    def __init__(self, api_key: str, base_url: str = 'http://localhost:3000/api'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()

    def _make_request(self, method: str, endpoint: str,
                     auth_required: bool = False, **kwargs):
        url = f'{self.base_url}{endpoint}'
        headers = kwargs.get('headers', {})

        if auth_required:
            headers['X-API-Key'] = self.api_key

        headers['Content-Type'] = 'application/json'
        kwargs['headers'] = headers

        response = self.session.request(method, url, **kwargs)
        return response.json()

    def init_session(self):
        return self._make_request('POST', '/session/start')

    def get_qr(self):
        return self._make_request('GET', '/session/qr')

    def get_status(self):
        return self._make_request('GET', '/session/status')

    def logout(self):
        return self._make_request('POST', '/session/logout')

    def send_message(self, number: str, message: str):
        data = {'number': number, 'message': message}
        return self._make_request('POST', '/messages/send',
                                auth_required=True,
                                json=data)

    def wait_for_connection(self, timeout: int = 60):
        start_time = time.time()

        while time.time() - start_time < timeout:
            status = self.get_status()
            if status['data']['isConnected']:
                return True
            time.sleep(1)

        return False


# Uso
def main():
    client = WhatsAppAPIClient('tu-api-key-super-secreta-aqui')

    print('Iniciando sesión...')
    client.init_session()

    print('Esperando QR...')
    for i in range(10):
        qr_data = client.get_qr()
        if qr_data.get('qr'):
            print(f'QR disponible: {qr_data["qr"][:50]}...')
            break
        time.sleep(1)

    print('Esperando conexión...')
    if client.wait_for_connection():
        status = client.get_status()
        print(f'✅ Conectado como: {status["data"]["connectedAs"]}')

        result = client.send_message(
            '573001234567',
            'Hola desde Python 🐍'
        )
        print(result)
    else:
        print('❌ Timeout esperando conexión')


if __name__ == '__main__':
    main()
```

#### Script para enviar múltiples mensajes
```python
import csv
import time
from client import WhatsAppAPIClient

def send_bulk_messages(csv_file: str, api_key: str):
    """Envía mensajes desde un CSV"""
    client = WhatsAppAPIClient(api_key)

    # Verificar conexión primero
    status = client.get_status()
    if not status['data']['isConnected']:
        print('❌ No estás conectado. Ejecuta initSession primero.')
        return

    # Leer CSV
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for idx, row in enumerate(reader, 1):
            number = row['numero']
            message = row['mensaje']

            print(f'[{idx}] Enviando a {number}...')

            result = client.send_message(number, message)

            if result['success']:
                print(f'    ✅ Enviado: {result["data"]["messageId"]}')
            else:
                print(f'    ❌ Error: {result["error"]}')

            # Esperar 4 segundos
            time.sleep(4)

    print('✅ Listo')

# CSV esperado:
# numero,mensaje
# 573001234567,Hola desde CSV
# 573009876543,Otro mensaje
```

---

### JavaScript en Frontend

#### Component Vue.js
```vue
<template>
  <div class="whatsapp-api-panel">
    <div v-if="!isConnected" class="qr-section">
      <h2>Conectar WhatsApp</h2>
      <p v-if="!qr" class="loading">Cargando QR...</p>
      <img v-else :src="qr" alt="QR Code" class="qr-image" />
    </div>

    <div v-else class="chat-section">
      <h2>✅ {{ connectedAs }}</h2>

      <form @submit.prevent="handleSend">
        <input
          v-model="number"
          type="text"
          placeholder="Número (573001234567)"
          :disabled="sending"
        />
        <textarea
          v-model="message"
          placeholder="Mensaje"
          :disabled="sending"
        />
        <button :disabled="sending || !number || !message">
          {{ sending ? 'Enviando...' : 'Enviar' }}
        </button>
      </form>

      <p v-if="error" class="error">❌ {{ error }}</p>
      <p v-if="success" class="success">✅ Mensaje enviado</p>
    </div>

    <p class="warning">
      ⚠️ Usar WhatsApp Web.js puede resultar en bloqueo de tu número
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiKey: 'tu-api-key',
      qr: null,
      isConnected: false,
      connectedAs: null,
      number: '',
      message: '',
      sending: false,
      error: null,
      success: false
    };
  },

  mounted() {
    this.init();
  },

  methods: {
    async init() {
      await fetch('http://localhost:3000/api/session/start', {
        method: 'POST'
      });
      this.pollQR();
    },

    async pollQR() {
      const interval = setInterval(async () => {
        const response = await fetch('http://localhost:3000/api/session/qr');
        const data = await response.json();

        if (data.qr) {
          this.qr = data.qr;
        }

        if (this.isConnected) {
          clearInterval(interval);
        }
      }, 2000);

      this.checkStatus();
    },

    async checkStatus() {
      const response = await fetch('http://localhost:3000/api/session/status');
      const data = await response.json();

      this.isConnected = data.data.isConnected;
      this.connectedAs = data.data.connectedAs;

      if (!this.isConnected) {
        setTimeout(() => this.checkStatus(), 5000);
      }
    },

    async handleSend() {
      this.sending = true;
      this.error = null;
      this.success = false;

      try {
        const response = await fetch(
          'http://localhost:3000/api/messages/send',
          {
            method: 'POST',
            headers: {
              'X-API-Key': this.apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              number: this.number,
              message: this.message
            })
          }
        );

        const data = await response.json();

        if (data.success) {
          this.success = true;
          this.number = '';
          this.message = '';
        } else {
          this.error = data.error;
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.sending = false;
      }
    }
  }
};
</script>

<style scoped>
.whatsapp-api-panel {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.qr-image {
  width: 200px;
  height: 200px;
}

textarea {
  min-height: 100px;
}

button {
  background: #25d366;
  color: white;
  padding: 0.5rem 1rem;
}

.warning {
  color: #f57c00;
  font-size: 0.9rem;
}
</style>
```

---

## 📞 Casos de Uso

### 1. Sistema de notificaciones
```javascript
async function notifyUser(userId, message) {
  const user = await getUserFromDB(userId);
  return whatsappAPI.sendMessage(user.whatsappNumber, message);
}

// Enviar notificación de pedido
await notifyUser('user123', 'Tu pedido #5432 ha sido confirmado');
```

### 2. Autenticación por WhatsApp
```javascript
async function sendAuthCode(phoneNumber) {
  const code = generateOTP();
  await whatsappAPI.sendMessage(phoneNumber, `Código: ${code}`);
  return code;
}
```

### 3. Alertas de sistema
```javascript
async function alertAdmin(severity, message) {
  const adminNumber = '573001234567';
  const alert = `[${severity.toUpperCase()}] ${message} - ${new Date().toISOString()}`;
  return whatsappAPI.sendMessage(adminNumber, alert);
}
```

---

**¡Happy Messaging! 📱✨**
