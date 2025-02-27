const express = require('express');
const venom = require('venom-bot');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let client = null; // Instância do bot
let qrCodeBase64 = ''; // Armazena o QR Code em Base64

async function startBot() {
  venom
    .create(
      'bot-session',
      (base64Qr, asciiQR) => {
        console.log('📷 Novo QR Code gerado! Escaneie para conectar.');
        qrCodeBase64 = base64Qr; // Salva o QR Code para exibição via API
      }
    )
    .then((bot) => {
      client = bot;
      console.log('✅ Bot conectado ao WhatsApp!');
    })
    .catch((error) => {
      console.error('❌ Erro ao iniciar o bot:', error);
    });
}

// Inicia o bot assim que o servidor for iniciado
startBot();

// **Nova Rota Para Obter o QR Code**
app.get('/qr', (req, res) => {
  if (qrCodeBase64) {
    res.json({ success: true, qrCode: qrCodeBase64 });
  } else {
    res.status(400).json({ error: '⚠️ QR Code ainda não gerado. Aguarde alguns segundos e tente novamente.' });
  }
});

// **Endpoint para enviar mensagens**
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!client) {
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

// **Configura a porta para rodar corretamente no Railway**
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
