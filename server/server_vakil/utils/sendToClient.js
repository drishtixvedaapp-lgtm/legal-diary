/**
 * Sends WhatsApp messages to:
 * 1. Client's phone numbers (primary + secondary)
 * 2. WhatsApp group (if case has a group ID set)
 * Always sends English first, then native language if different
 */
const { sendWhatsAppMessage } = require("./whatsappClient");
const { buildWAMessages }     = require("./buildWAMessage");

// Send a pre-built message to all client phones
const sendWhatsAppToClient = async (client, messages) => {
  const msgArray = Array.isArray(messages) ? messages : [messages];

  const phones = [
    client.phone,
    client.phone2?.trim() || null,
  ].filter(Boolean);

  if (phones.length === 0) return false;

  let anySent = false;

  for (const phone of phones) {
    for (const message of msgArray) {
      try {
        const sent = await sendWhatsAppMessage(phone, message);
        if (sent) anySent = true;
        if (msgArray.length > 1) await new Promise(r => setTimeout(r, 1500));
      } catch(e) {
        console.error(`❌ WhatsApp failed → ${phone}:`, e.message);
      }
    }
  }

  return anySent;
};

// Build messages and send to client phones + group if set
const sendWAToClient = async (type, client, caseDoc, lawyerName, lawyerPhone) => {
  if (!client.phone && !caseDoc.whatsappGroupId) return false;

  let anySent = false;

  try {
    const messages = buildWAMessages(type, client, caseDoc, lawyerName, lawyerPhone);

    // Send to individual client phones
    if (client.phone) {
      const sent = await sendWhatsAppToClient(client, messages);
      if (sent) anySent = true;
    }

    // Send to WhatsApp group if case has one set
    if (caseDoc.whatsappGroupId && caseDoc.whatsappGroupId.trim()) {
      // For groups, only send English (so everyone can read it)
      const groupMsg = messages[0]; // English is always first
      try {
        const sent = await sendWhatsAppMessage(caseDoc.whatsappGroupId, groupMsg);
        if (sent) {
          console.log(`💬 WhatsApp group message sent → ${caseDoc.whatsappGroupId}`);
          anySent = true;
        }
      } catch(e) {
        console.error("❌ WhatsApp group failed:", e.message);
      }
    }

  } catch(e) {
    console.error("❌ sendWAToClient error:", e.message);
  }

  return anySent;
};

module.exports = { sendWhatsAppToClient, sendWAToClient };