const express = require('express');
const venom = require('venom-bot');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let client = null; // Instância do bot
let isBotReady = false; // Indica se o bot está pronto

async function startBot() {
  try {
    client = await venom.create({
      session: 'bot-session',
      headless: false, // Altere para true se quiser ocultar o navegador
      useChrome: true,
      disableSpins: true,
      mkdirFolderToken: 'true',
      folderNameToken: 'bot-session',
      logQR: true,
    });

    console.log('✅ Bot conectado ao WhatsApp!');
    isBotReady = true;

    setInterval(async () => {
      const isConnected = await client.isConnected();
      if (!isConnected) {
        console.log('⚠️ O bot perdeu a conexão! Escaneie o QR Code novamente.');
        isBotReady = false;
      } else {
        console.log('✅ O bot continua conectado.');
      }
    }, 5000);

  } catch (error) {
    console.error('❌ Erro ao iniciar o bot:', error);
    isBotReady = false;
  }
}

// Inicia o bot quando o servidor iniciar
startBot();

// Rota para fornecer o QR Code ao site
app.get('/qr', (req, res) => {
  if (isBotReady) {
    res.json({ success: true, message: '✅ O bot está pronto! Escaneie o QR Code para conectar.' });
  } else {
    res.status(400).json({ error: '⚠️ O bot ainda não está pronto. Aguarde e tente novamente.' });
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
