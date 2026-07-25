const cron         = require("node-cron");
const Case         = require("../models/Case");
const Notification = require("../models/Notification");
const { sendEmail, eveningReminderEmail, morningReminderEmail } = require("../utils/sendEmail");
const { sendWAToClient } = require("../utils/sendToClient");

// ── Send email + WhatsApp for one case ───────────────────────────────────────
const sendReminders = async (singleCase, type) => {
  const client = singleCase.client;
  const lawyer  = singleCase.assignedLawyer;

  if (!client) return false;

  const lawyerName  = lawyer?.name  || "Your Assigned Lawyer";
  const lawyerPhone = lawyer?.phone || null;
  const isEvening   = type === "evening";
  let   anySent     = false;

  // ── Email ─────────────────────────────────────────────────────────────────
  if (client.email) {
    try {
      const payload = {
        clientName: client.name,      caseTitle  : singleCase.caseTitle,
        caseNumber: singleCase.caseNumber, courtName: singleCase.courtName,
        date: new Date(singleCase.nextHearing).toLocaleDateString("en-IN", {
          weekday:"long", year:"numeric", month:"long", day:"numeric",
        }),
        time: singleCase.hearingTime || "As scheduled",
        lawyerName, lawyerPhone,
      };

      await sendEmail(
        client.email,
        isEvening
          ? `Hearing Tomorrow – ${singleCase.caseTitle}`
          : `Your Hearing Is Today – ${singleCase.caseTitle}`,
        `Dear ${client.name}, your hearing for ${singleCase.caseTitle} is ${isEvening ? "tomorrow" : "today"}.`,
        isEvening ? eveningReminderEmail(payload) : morningReminderEmail(payload)
      );
      console.log(`📧 Email → ${client.email}`);
      anySent = true;
    } catch(e) { console.error("❌ Email:", e.message); }
  }

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  if (client.phone) {
    try {
      const msg  = buildWAMessage(type, client, singleCase, lawyerName, lawyerPhone);
      const sent = await sendWhatsAppToClient(client, msg);
      if (sent) {
        console.log(`💬 WhatsApp → ${client.phone}`);
        anySent = true;
      }
    } catch(e) { console.error("❌ WhatsApp:", e.message); }
  }

  if (!client.email && !client.phone) {
    console.log(`⚠️  No contact info for: ${client.name}`);
  }

  return anySent;
};

// ── Process all hearings for a target date ────────────────────────────────────
const processReminders = async (targetDate, type) => {
  const start = new Date(targetDate); start.setHours(0,0,0,0);
  const end   = new Date(targetDate); end.setHours(23,59,59,999);

  const cases = await Case.find({
    nextHearing: { $gte: start, $lte: end },
    status     : { $ne: "Closed" },
  })
    .populate("client")
    .populate("assignedLawyer", "name phone");

  console.log(`📋 [${type}] ${cases.length} hearing(s) for ${targetDate.toDateString()}`);

  for (const singleCase of cases) {
    // Duplicate guard
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const alreadySent = await Notification.findOne({
      case     : singleCase._id,
      type     : "email",
      sent     : true,
      message  : { $regex: type, $options: "i" },
      updatedAt: { $gte: todayStart },
    });

    if (alreadySent) {
      console.log(`⏭️  [${type}] Already sent — ${singleCase.caseTitle}`);
      continue;
    }

    try {
      const sent = await sendReminders(singleCase, type);
      if (sent) {
        await Notification.create({
          case        : singleCase._id,
          type        : "email",
          scheduledFor: singleCase.nextHearing,
          message     : `[${type}] Reminder sent for ${singleCase.caseTitle}`,
          sent        : true,
        });
        console.log(`✅ [${type}] Done — ${singleCase.caseTitle}`);
      }
    } catch(err) {
      console.error(`❌ [${type}] ${singleCase.caseTitle}:`, err.message);
    }
  }
};

// ── Register cron jobs ────────────────────────────────────────────────────────
const startHearingReminder = () => {
  // 🌙 8:00 PM — evening (day before)
  cron.schedule("0 20 * * *", async () => {
    console.log("🌙 [Evening Reminder] Running...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await processReminders(tomorrow, "evening");
    console.log("✅ [Evening Reminder] Done.");
  });

  // 🌅 7:00 AM — morning (day of)
  cron.schedule("0 7 * * *", async () => {
    console.log("🌅 [Morning Reminder] Running...");
    await processReminders(new Date(), "morning");
    console.log("✅ [Morning Reminder] Done.");
  });

  console.log("📅 Reminders: 🌙 8PM (evening) + 🌅 7AM (morning) — Email + WhatsApp");
};

module.exports = startHearingReminder;