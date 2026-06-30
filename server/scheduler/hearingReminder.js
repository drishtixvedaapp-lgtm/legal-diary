const cron = require("node-cron");
const Case = require("../models/Case");
const Notification = require("../models/Notification");

// ── Correct import — sendEmail.js exports an object ──────────────────────────
const { sendEmail, eveningReminderEmail, morningReminderEmail } = require("../utils/sendEmail");

// ─── Send one reminder email ──────────────────────────────────────────────────
const sendReminderEmail = async (singleCase, type) => {
  const client = singleCase.client;
  const lawyer  = singleCase.assignedLawyer;

  if (!client?.email) {
    console.log(`⚠️  No client email — skipping: ${singleCase.caseTitle}`);
    return false;
  }

  const payload = {
    clientName  : client.name,
    caseTitle   : singleCase.caseTitle,
    caseNumber  : singleCase.caseNumber,
    courtName   : singleCase.courtName,
    date        : new Date(singleCase.nextHearing).toLocaleDateString("en-IN", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  }),
    time        : singleCase.hearingTime || "As scheduled",
    lawyerName  : lawyer?.name  || "Your Assigned Lawyer",
    lawyerPhone : lawyer?.phone || null,
  };

  const isEvening   = type === "evening";
  const subjectLine = isEvening
    ? `Hearing Tomorrow – ${singleCase.caseTitle}`
    : `Your Hearing Is Today – ${singleCase.caseTitle}`;

  const plainText = isEvening
    ? `Dear ${payload.clientName}, your hearing for ${payload.caseTitle} is tomorrow (${payload.date}).`
    : `Dear ${payload.clientName}, your hearing for ${payload.caseTitle} is TODAY (${payload.date}).`;

  await sendEmail(
    client.email,
    subjectLine,
    plainText,
    isEvening ? eveningReminderEmail(payload) : morningReminderEmail(payload)
  );

  return true;
};

// ─── Core logic — find cases and send ────────────────────────────────────────
const processReminders = async (targetDate, type) => {
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  const cases = await Case.find({
    nextHearing : { $gte: start, $lte: end },
    status      : { $ne: "Closed" },
  })
    .populate("client")
    .populate("assignedLawyer", "name phone");

  console.log(`📋 [${type}] ${cases.length} hearing(s) found for ${targetDate.toDateString()}`);

  for (const singleCase of cases) {
    // Duplicate guard
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

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
      const sent = await sendReminderEmail(singleCase, type);

      if (sent) {
        console.log(`✅ [${type}] Email sent — ${singleCase.caseTitle} → ${singleCase.client.email}`);
        await Notification.create({
          case        : singleCase._id,
          type        : "email",
          scheduledFor: singleCase.nextHearing,
          message     : `[${type}] Reminder sent for ${singleCase.caseTitle}`,
          sent        : true,
        });
      }
    } catch (err) {
      console.error(`❌ [${type}] ${singleCase.caseTitle}:`, err.message);
    }
  }
};

// ─── Register cron jobs ───────────────────────────────────────────────────────
const startHearingReminder = () => {

  // 🌙 8:00 PM — evening reminder (day before hearing)
  cron.schedule("0 20 * * *", async () => {
    console.log("🌙 [Evening Reminder] Running...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await processReminders(tomorrow, "evening");
    console.log("✅ [Evening Reminder] Done.");
  });

  // 🌅 7:00 AM — morning reminder (day of hearing)
  cron.schedule("0 7 * * *", async () => {
    console.log("🌅 [Morning Reminder] Running...");
    await processReminders(new Date(), "morning");
    console.log("✅ [Morning Reminder] Done.");
  });

  console.log("📅 Hearing reminders scheduled:");
  console.log("   🌙 Evening reminder : 8:00 PM (day before hearing)");
  console.log("   🌅 Morning reminder : 7:00 AM (morning of hearing)");
};

module.exports = startHearingReminder;
