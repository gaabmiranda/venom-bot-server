const express = require('express');
const venom = require('venom-bot');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let client = null; // Armazena a instância do bot
let isBotReady = false; // Indica se o bot está pronto

async function startBot() {
  try {
    client = await venom.create(
      'bot-session',
      (base64Qr, asciiQR) => {
        console.log('📷 Novo QR Code gerado! Escaneie para conectar.');
      },
      undefined,
      {
        headless: true, // O Railway não suporta navegador visível
        useChrome: false, // Trocar para false para evitar erros de compatibilidade
        disableSpins: true,
        mkdirFolderToken: 'bot-session', // ❌ Antes estava `true`, agora é uma string
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
    isBotReady = true; // Marca o bot como pronto para enviar mensagens

    // Verifica a conexão do bot a cada 5 segundos
    setInterval(async () => {
      const isConnected = await client.isConnected();
      if (!isConnected) {
        console.log('⚠️ O bot perdeu a conexão! Escaneie o QR Code novamente.');
        isBotReady = false; // Marca que o bot não está pronto
      }
    }, 5000);

  } catch (error) {
    console.error('❌ Erro ao iniciar o bot:', error);
    isBotReady = false;
  }
}

// Inicia o bot ao rodar o servidor
startBot();

// **Nova Rota Para Obter o QR Code**
app.get('/qr', (req, res) => {
  if (isBotReady) {
    res.json({ success: true, message: '✅ O bot está pronto! Escaneie o QR Code para conectar.' });
  } else {
    console.log('⚠️ Tentativa de acessar /qr enquanto o bot não está pronto.');
    res.status(400).json({ error: '⚠️ O bot ainda não está pronto. Aguarde e tente novamente.' });
  }
});

// **Endpoint para enviar mensagens pelo WhatsApp**
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!isBotReady || !client) {
    console.log('⚠️ Tentativa de envio de mensagem enquanto o bot não estava pronto.');
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

// **Inicia a API na porta correta no Railway**
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
