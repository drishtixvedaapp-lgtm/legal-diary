const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const path     = require("path");
const fs       = require("fs");
const pino     = require("pino");
const http     = require("http");

const AUTH_FOLDER = path.join(__dirname, "../whatsapp_auth");

let sock        = null;
let isConnected = false;
let latestQR    = null;
let pendingMsgs = [];
let qrStarted   = false; // ← prevent starting QR server twice

// ── QR browser server ─────────────────────────────────────────────────────────
const startQRServer = () => {
  if (qrStarted) return; // already started — don't start again
  qrStarted = true;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });

    if (isConnected) {
      res.end(`<html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#f0fdf4">
        <h2 style="color:#15803d">✅ WhatsApp Connected!</h2>
        <p>Messages will be sent from the lawyer's number automatically.</p>
        <p style="color:#64748b">You can close this tab.</p>
      </body></html>`);
      return;
    }

    if (!latestQR) {
      res.end(`<html><head><meta http-equiv="refresh" content="2"></head>
        <body style="font-family:sans-serif;text-align:center;padding:60px">
          <h2>⏳ Generating QR Code...</h2>
          <p>Auto-refreshing, please wait...</p>
        </body></html>`);
      return;
    }

    res.end(`<html>
      <head><meta http-equiv="refresh" content="25">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
      </head>
      <body style="font-family:sans-serif;text-align:center;padding:40px;background:#f8fafc">
        <h2 style="color:#0f2744">📱 Scan with WhatsApp</h2>
        <p style="color:#64748b">WhatsApp → Settings → Linked Devices → Link a Device</p>
        <div id="qr" style="display:inline-block;padding:20px;background:#fff;
             border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.1);margin:20px"></div>
        <p style="color:#94a3b8;font-size:13px">Refreshes every 25 seconds</p>
        <script>
          new QRCode(document.getElementById("qr"), {
            text: ${JSON.stringify(latestQR)},
            width: 280, height: 280,
            colorDark: "#000", colorLight: "#fff",
          });
        </script>
      </body></html>`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log("📱 QR page: http://localhost:5001/qr");
    }
  });

  server.listen(5001, () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📱 Open in browser to scan QR:");
    console.log("   http://localhost:5001/qr");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  });
};

// ── Start WhatsApp ────────────────────────────────────────────────────────────
const startWhatsApp = async () => {
  if (!fs.existsSync(AUTH_FOLDER))
    fs.mkdirSync(AUTH_FOLDER, { recursive: true });

  startQRServer(); // start browser QR server once

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version }          = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth  : state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      latestQR = qr;
      console.log("📱 QR ready — open http://localhost:5001/qr in browser");
    }

    if (connection === "open") {
      isConnected = true;
      latestQR    = null;
      console.log("✅ WhatsApp connected! Messages from lawyer's number.");

      for (const { phone, message } of pendingMsgs) {
        await sendWhatsAppMessage(phone, message);
      }
      pendingMsgs = [];
    }

    if (connection === "close") {
      isConnected = false;
      const code  = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log("⚠️  Disconnected — reconnecting in 5s...");
        setTimeout(startWhatsApp, 5000);
      } else {
        console.log("❌ Logged out — delete whatsapp_auth/ and restart");
      }
    }
  });
};

// ── Send message (phone or group) ─────────────────────────────────────────────
const sendWhatsAppMessage = async (toPhone, message) => {
  try {
    if (!sock || !isConnected) {
      pendingMsgs.push({ phone: toPhone, message });
      console.log(`⏳ Queued message to ${toPhone} — will send when connected`);
      return false;
    }

    let jid;

    // Group ID ends with @g.us — use as-is
    if (toPhone.endsWith("@g.us")) {
      jid = toPhone;
    } else {
      // Individual phone number — normalize
      let phone = toPhone.replace(/[\s\-()]/g, "");
      if (phone.startsWith("+")) phone = phone.slice(1);
      if (phone.startsWith("0")) phone = "91" + phone.slice(1);
      if (phone.length === 10)   phone = "91" + phone;
      jid = `${phone}@s.whatsapp.net`;
    }

    await sock.sendMessage(jid, { text: message });
    console.log(`✅ WhatsApp sent → ${jid}`);
    return true;
  } catch (err) {
    console.error(`❌ WhatsApp failed → ${toPhone}:`, err.message);
    return false;
  }
};

const getWhatsAppStatus = () => ({ connected: isConnected, hasQR: !!latestQR });

module.exports = { startWhatsApp, sendWhatsAppMessage, getWhatsAppStatus };