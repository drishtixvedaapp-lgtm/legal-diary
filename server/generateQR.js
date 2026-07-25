/**
 * Run this once to see the QR code visually in terminal
 * node generateQR.js
 */
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const qrcode   = require("qrcode-terminal");
const path     = require("path");
const fs       = require("fs");
const pino     = require("pino");

const AUTH_FOLDER = path.join(__dirname, "whatsapp_auth");
if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, { recursive: true });

(async () => {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth  : state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (qr) {
      console.log("\n📱 Scan this QR code with WhatsApp:\n");
      qrcode.generate(qr, { small: true });
      console.log("\nGo to WhatsApp → Settings → Linked Devices → Link a Device\n");
    }
    if (connection === "open") {
      console.log("✅ WhatsApp connected successfully!");
      console.log("✅ Auth saved — now start your server normally with: npm run dev");
      process.exit(0);
    }
    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log("❌ Logged out — delete whatsapp_auth folder and try again");
        process.exit(1);
      }
    }
  });
})();
