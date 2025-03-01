const express = require('express');
const venom = require('venom-bot');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let client = null; // Instância do bot
let isBotReady = false; // Indica se o bot está pronto
let qrCodeBase64 = ''; // Armazena o QR Code em Base64

async function startBot() {
  try {
    client = await venom.create(
      'bot-session',
      (base64Qr, asciiQR) => {
        console.log('📷 Novo QR Code gerado!');
        qrCodeBase64 = base64Qr; // Salva o QR Code
      },
      undefined,
      {
        headless: true,
        // Em vez de usar "useChrome: false", definimos o caminho para o executável do Chrome/Chromium.
        // Verifique se a variável de ambiente CHROME_BIN está definida ou informe o caminho padrão.
        executablePath: process.env.CHROME_BIN || '/usr/bin/chromium-browser',
        disableSpins: true,
        mkdirFolderToken: true,
        folderNameToken: 'bot-session',
        logQR: false,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    );

    console.log('✅ Bot conectado ao WhatsApp!');
    isBotReady = true;
  } catch (error) {
    console.error('❌ Erro ao iniciar o bot:', error);
    isBotReady = false;
  }
}

// Inicia o bot quando o servidor iniciar
startBot();

// Rota para obter o QR Code
app.get('/qr', (req, res) => {
  if (qrCodeBase64) {
    res.json({ success: true, qrCode: qrCodeBase64 });
  } else {
    res.status(400).json({ error: '⚠️ QR Code ainda não gerado' });
  }
});

// Endpoint para enviar mensagens
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!isBotReady || !client) {
    return res.status(500).json({ error: '⚠️ O bot ainda não está pronto. Aguarde e tente novamente.' });
  }

  try {
    await client.sendText(`${number}@c.us`, message);
    res.json({ success: true, message: '✅ Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.toString() });
  }
});

// Configura a porta para rodar corretamente no Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
  console.log(`🌍 Acesse via: http://localhost:${PORT} (se local) ou ${process.env.RAILWAY_STATIC_URL || 'Railway URL aqui'}`);
});
