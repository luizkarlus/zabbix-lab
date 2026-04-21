const express = require("express");
const cors = require("cors");
const wppconnect = require("@wppconnect-team/wppconnect");

const app = express();
const PORT = 8000;

app.use(cors());

let client = null;
let isClientReady = false;

// 🔥 FUNÇÃO ASYNC (CORRETO)
async function startSession() {
  console.log("🔄 Iniciando sessão do WhatsApp...");

  try {
    const whatsappClient = await wppconnect.create({
      session: "zabbix-default-session",
      headless: true,
      executablePath: "/usr/bin/google-chrome-stable",
      userDataDir: "./tokens",
      puppeteerOptions: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--single-process",
          "--no-zygote"
        ]
      },
      catchQR: (base64Qr, asciiQR) => {
        console.log("📲 Escaneie o QR Code:\n", asciiQR);
      },
      statusFind: (status) => {
        console.log(`📡 Status da sessão: ${status}`);
        isClientReady = status === "inChat";
      }
    });

    client = whatsappClient;
    isClientReady = true;

    console.log("✅ WhatsApp conectado!");

  } catch (error) {
    console.error("❌ Erro ao conectar sessão:", error);
    isClientReady = false;
  }
}

// 🔥 CHAMA A FUNÇÃO
startSession();

// Rota de status
app.get("/status", (req, res) => {
  if (!client || !isClientReady) {
    return res.status(503).json({ status: "DISCONNECTED" });
  }
  res.json({ status: "CONNECTED" });
});

// Rota de grupos
app.get("/groups", async (req, res) => {
  if (!client || !isClientReady) {
    return res.status(503).json({ error: "Cliente não está pronto" });
  }

  try {
    const chats = await client.listChats();

    const groups = chats
      .filter(chat => chat.isGroup)
      .map(group => ({
        id: group.id._serialized,
        name: group.name,
        participants: group.groupMetadata?.participants?.length || 0
      }));

    res.json(groups);

  } catch (error) {
    console.error("Erro ao listar grupos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Rota de envio
app.get("/send", async (req, res) => {
  const { number, message } = req.query;

  if (!number || !message) {
    return res.status(400).json({ error: "Parâmetros obrigatórios" });
  }

  if (!client || !isClientReady) {
    return res.status(503).json({ error: "Cliente não pronto" });
  }

  try {
    const recipient = `${number}@c.us`;
    await client.sendText(recipient, message);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start API
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});