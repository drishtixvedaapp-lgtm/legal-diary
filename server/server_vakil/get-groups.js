/**
 * Lists all WhatsApp groups the lawyer is part of
 * Run WHILE SERVER IS STOPPED: node get-groups.js
 * Copy the Group ID you want and add it to the case
 * Delete after use
 */
require("dotenv").config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const path = require("path");
const pino = require("pino");

const AUTH_FOLDER = path.join(__dirname, "whatsapp_auth");

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

  sock.ev.on("connection.update", async ({ connection }) => {
    if (connection === "open") {
      console.log("✅ Connected — fetching groups...\n");

      // Get all chats and filter groups
      const groups = await sock.groupFetchAllParticipating();

      const list = Object.values(groups);
      console.log(`Found ${list.length} group(s):\n`);
      console.log("═══════════════════════════════════════════════════════");

      list.forEach((g, i) => {
        console.log(`${i + 1}. ${g.subject}`);
        console.log(`   Group ID : ${g.id}`);
        console.log(`   Members  : ${g.participants?.length || 0}`);
        console.log("───────────────────────────────────────────────────────");
      });

      console.log("\nCopy the Group ID of the group you want to use.");
      console.log("Add it to the case in the 'WhatsApp Group ID' field.\n");

      process.exit(0);
    }
  });

  // Timeout after 15 seconds
  setTimeout(() => {
    console.log("❌ Could not connect. Make sure server is stopped and whatsapp_auth/ exists.");
    process.exit(1);
  }, 15000);
})();