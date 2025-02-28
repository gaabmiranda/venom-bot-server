const express = require('express');
const venom = require('venom-bot');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let client = null; // Instância do bot
let isBotReady = false; // Indica se o bot está pronto
let qrCodeBase64 = ''; // Armazena o QR Code
let messages = {}; // Armazena as conversas

async function startBot() {
  try {
    client = await venom.create(
      'bot-session',
      (base64Qr, asciiQR) => {
        console.log('📷 Novo QR Code gerado! Escaneie para conectar.');
        qrCodeBase64 = base64Qr; // Armazena QR Code para exibição
      },
      undefined,
      {
        headless: false,
        useChrome: true, // Força o uso do navegador instalado externamente
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        disableSpins: true,
        mkdirFolderToken: 'bot-session',
        folderNameToken: 'bot-session',
        logQR: false,
        puppeteerOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        }
      }
    );

    console.log('✅ Bot conectado ao WhatsApp!');
    isBotReady = true;

    // Captura mensagens recebidas e as armazena
    client.onMessage(async (message) => {
      console.log(`📩 Nova mensagem de ${message.from}: ${message.body}`);

      if (!messages[message.from]) {
        messages[message.from] = [];
      }
      messages[message.from].push({
        type: 'received',
        text: message.body,
        timestamp: new Date()
      });
    });

    // Mantém a conexão ativa; se perder, tenta reconectar
    setInterval(async () => {
      const isConnected = await client.isConnected();
      if (!isConnected) {
        console.log('⚠️ O bot perdeu a conexão! Tentando reconectar...');
        isBotReady = false;
        await startBot();
      }
    }, 5000);

  } catch (error) {
    console.error('❌ Erro ao iniciar o bot:', error);
    isBotReady = false;
  }
}

// Inicia o bot ao rodar o servidor
startBot();

// Rota para visualizar o QR Code
app.get('/qr', (req, res) => {
  if (qrCodeBase64) {
    res.send(`
      <html>
        <body style="display:flex; justify-content:center; align-items:center; height:100vh;">
          <img src="${qrCodeBase64}" alt="QR Code" style="width:300px; height:300px;">
        </body>
      </html>
    `);
  } else {
    res.status(400).json({ error: '⚠️ O bot ainda não está pronto ou o QR Code expirou. Tente novamente.' });
  }
});

// Endpoint para enviar mensagens pelo WhatsApp
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!isBotReady || !client) {
    return res.status(500).json({ error: '⚠️ O bot ainda não está pronto. Aguarde e tente novamente.' });
  }

  try {
    await client.sendText(`${number}@c.us`, message);

    // Armazena mensagem enviada
    if (!messages[number]) {
      messages[number] = [];
    }
    messages[number].push({
      type: 'sent',
      text: message,
      timestamp: new Date()
    });

    res.json({ success: true, message: '✅ Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.toString() });
  }
});

// Endpoint para listar todas as conversas
app.get('/conversations', (req, res) => {
  res.json(messages);
});

// Endpoint para buscar mensagens de um contato específico
app.get('/conversations/:number', (req, res) => {
  const number = req.params.number;
  if (messages[number]) {
    res.json(messages[number]);
  } else {
    res.status(404).json({ error: 'Nenhuma conversa encontrada para este número.' });
  }
});

// Inicia a API na porta definida pelo Railway ou na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
