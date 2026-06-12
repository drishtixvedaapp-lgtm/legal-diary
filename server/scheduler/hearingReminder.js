const cron = require("node-cron");
const Case = require("../models/Case");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");

// ─── Shared email sender ──────────────────────────────────────────────────────
const sendHearingReminderEmail = async (singleCase, reminderType) => {

  const client = singleCase.client;
  if (!client?.email) {
    console.log(`⚠️  No email for client of case: ${singleCase.caseTitle}`);
    return false;
  }

  const lawyer      = singleCase.assignedLawyer;
  const lawyerName  = lawyer?.name    || "Your Assigned Lawyer";
  const lawyerPhone = lawyer?.phone   ? ` | ${lawyer.phone}` : "";

  const isToday    = reminderType === "morning";
  const subjectTag = isToday ? "Today" : "Tomorrow";
  const introLine  = isToday
    ? "This is a reminder that your hearing is scheduled for TODAY. Please be present at the court on time."
    : "This is a reminder that your hearing is scheduled for TOMORROW. Please make necessary arrangements.";

  await sendEmail(
    client.email,
    `Hearing Reminder – ${subjectTag} – ${singleCase.caseTitle}`,
    `Dear ${client.name},

${introLine}

━━━━━━━━━━━━━━━━━━━━━━
Case Details
━━━━━━━━━━━━━━━━━━━━━━
Case Title  : ${singleCase.caseTitle}
Case Number : ${singleCase.caseNumber}
Court       : ${singleCase.courtName}
Date        : ${new Date(singleCase.nextHearing).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Time        : ${singleCase.hearingTime || "As scheduled"}
Lawyer      : ${lawyerName}${lawyerPhone}

Contact your lawyer if you have any questions.

Regards,
Legal Diary System`
  );

  return true;
};

// ─── Shared logic to find cases and send, with duplicate guard ────────────────
const processReminders = async (targetDate, reminderType) => {

  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  const cases = await Case.find({
    nextHearing : { $gte: start, $lte: end },
    status      : { $ne: "Closed" },
  })
    .populate("client")
    .populate("assignedLawyer", "name email phone");

  console.log(`📋 [${reminderType}] Found ${cases.length} hearing(s)`);

  for (const singleCase of cases) {

    // Duplicate guard — check if this exact reminderType was already sent today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const alreadySent = await Notification.findOne({
      case     : singleCase._id,
      type     : "email",
      sent     : true,
      message  : { $regex: reminderType, $options: "i" },
      updatedAt: { $gte: todayStart },
    });

    if (alreadySent) {
      console.log(`⏭️  [${reminderType}] Already sent for: ${singleCase.caseTitle}`);
      continue;
    }

    try {
      const sent = await sendHearingReminderEmail(singleCase, reminderType);

      if (sent) {
        console.log(`✅ [${reminderType}] Email sent for: ${singleCase.caseTitle}`);

        // Save a notification record for this specific reminder type
        await Notification.create({
          case        : singleCase._id,
          type        : "email",
          scheduledFor: singleCase.nextHearing,
          message     : `[${reminderType}] Hearing reminder sent for ${singleCase.caseTitle}`,
          sent        : true,
        });
      }
    } catch (err) {
      console.error(`❌ [${reminderType}] Error for ${singleCase.caseTitle}:`, err.message);
    }
  }
};

// ─── Main scheduler ───────────────────────────────────────────────────────────
const startHearingReminder = () => {

  // ── 1. Evening reminder — 8:00 PM, for tomorrow's hearings ──────────────────
  cron.schedule("0 20 * * *", async () => {
    console.log("🌙 [Evening Reminder] Running...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await processReminders(tomorrow, "evening");
    console.log("✅ [Evening Reminder] Done.");
  });

  // ── 2. Morning reminder — 7:00 AM, for today's hearings ─────────────────────
  cron.schedule("0 7 * * *", async () => {
    console.log("🌅 [Morning Reminder] Running...");
    const today = new Date();
    await processReminders(today, "morning");
    console.log("✅ [Morning Reminder] Done.");
  });

  console.log("📅 Hearing reminders scheduled:");
  console.log("   🌙 Evening reminder : 8:00 PM (day before hearing)");
  console.log("   🌅 Morning reminder : 7:00 AM (morning of hearing)");
};

module.exports = startHearingReminder;
