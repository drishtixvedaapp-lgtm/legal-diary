require("dotenv").config();

const TEST_PHONE = "9392869484"; // your number

const { startWhatsApp, sendWhatsAppMessage, getWhatsAppStatus } = require("./utils/whatsappClient");

(async () => {
  console.log("Starting WhatsApp...");
  await startWhatsApp();

  // Wait for connection — check every second for up to 30 seconds
  console.log("Waiting for WhatsApp to connect...");
  let waited = 0;
  while (!getWhatsAppStatus().connected && waited < 30) {
    await new Promise(r => setTimeout(r, 1000));
    waited++;
    process.stdout.write(`\r⏳ Waiting... ${waited}s`);
  }

  console.log("");

  if (!getWhatsAppStatus().connected) {
    console.log("❌ Not connected after 30s.");
    console.log("   → Open http://localhost:5001/qr and scan QR first");
    process.exit(1);
  }

  console.log(`✅ Connected! Sending to ${TEST_PHONE}...`);

  const sent = await sendWhatsAppMessage(
    TEST_PHONE,
    `⚖️ *Legal Diary — Test Message*

This is a test from Legal Diary.
WhatsApp reminders are working! ✅

🌙 8:00 PM reminder — day before hearing
🌅 7:00 AM reminder — morning of hearing

— Legal Diary System`
  );

  if (sent) {
    console.log("✅ Message sent! Check WhatsApp on your phone.");
  } else {
    console.log("❌ Send failed.");
  }

  setTimeout(() => process.exit(0), 2000);
})();
