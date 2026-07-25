const HearingOutcome = require("../models/HearingOutcome");
const TimelineEvent = require("../models/TimelineEvent");
const Case = require("../models/Case");
const Client = require("../models/Client");
const User = require("../models/User");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");

// ─── CREATE OUTCOME ───────────────────────────────────────────────────────────
const createOutcome = async (req, res) => {
  try {

    const outcome = await HearingOutcome.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const caseDoc = await Case.findById(outcome.caseId);

    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    let emailSubject = "";
    let emailIntro = "";
    let shouldSendEmail = false;

    // JUDGMENT DELIVERED
    if (outcome.outcome === "Judgment Delivered") {
      caseDoc.stage = "Judgment";
      emailSubject = `Judgment Delivered – ${caseDoc.caseTitle}`;
      emailIntro = "The judgment has been delivered for your case.";
      shouldSendEmail = true;
    }

    // CASE DISPOSED
    if (outcome.outcome === "Case Disposed") {
      caseDoc.status = "Closed";
      caseDoc.stage = "Closed";
      caseDoc.closedAt = new Date();
      emailSubject = `Case Closed – ${caseDoc.caseTitle}`;
      emailIntro = "Your case has been disposed and officially closed.";
      shouldSendEmail = true;
    }

    // NEXT HEARING SET (rescheduled)
    if (outcome.nextHearing) {
      caseDoc.nextHearing = outcome.nextHearing;

      // Create a new notification for the next hearing
      try {
        await Notification.create({
          case: caseDoc._id,
          type: "email",
          scheduledFor: outcome.nextHearing,
          message: `Next hearing scheduled for ${caseDoc.caseTitle} after outcome: ${outcome.outcome}`,
          sent: false,
        });
        console.log("✅ Notification created for next hearing");
      } catch (e) {
        console.error("❌ Notification create failed:", e.message);
      }

      // If no specific outcome email, send a "next hearing scheduled" email
      if (!shouldSendEmail) {
        emailSubject = `Next Hearing Scheduled – ${caseDoc.caseTitle}`;
        emailIntro = `Your previous hearing has been completed (${outcome.outcome}) and your next hearing has been scheduled.`;
        shouldSendEmail = true;
      }
    }

    await caseDoc.save();

    // Create Timeline Event
    await TimelineEvent.create({
      caseId: outcome.caseId,
      eventType: "HEARING_OUTCOME",
      title: "Hearing Completed",
      description: outcome.outcome,
    });

    // Send Email to Client
    if (shouldSendEmail) {
      try {
        const client = await Client.findById(caseDoc.client);
        const lawyer = await User.findById(caseDoc.assignedLawyer).select("name email phone");
        const lawyerName = lawyer?.name || "Your Assigned Lawyer";
        const lawyerContact = lawyer?.phone ? ` | ${lawyer.phone}` : "";

        if (client?.email) {
          const nextHearingLine = outcome.nextHearing
            ? `Next Hearing  : ${new Date(outcome.nextHearing).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
            : "No further hearings scheduled at this time.";

          const judgeRemarksLine = outcome.judgeRemarks
            ? `Judge Remarks : ${outcome.judgeRemarks}`
            : "";

          await sendEmail(
            client.email,
            emailSubject,
            `Dear ${client.name},

${emailIntro}

━━━━━━━━━━━━━━━━━━━━━━
Hearing Outcome Details
━━━━━━━━━━━━━━━━━━━━━━
Case Title    : ${caseDoc.caseTitle}
Case Number   : ${caseDoc.caseNumber}
Court         : ${caseDoc.courtName}
Hearing Date  : ${new Date(outcome.hearingDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Outcome       : ${outcome.outcome}
${judgeRemarksLine ? judgeRemarksLine + "\n" : ""}${nextHearingLine}
Lawyer        : ${lawyerName}${lawyerContact}

Please contact your lawyer if you have any questions.

Regards,
VakilSummons System`
          );

          console.log(`✅ Outcome email sent to ${client.email}`);
        } else {
          console.log("⚠️  Client email not found, skipping email.");
        }
      } catch (e) {
        console.error("❌ Outcome email error:", e.message);
      }
    }

    res.status(201).json({
      message: "Outcome Saved Successfully",
      outcome,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ─── GET OUTCOMES BY CASE ─────────────────────────────────────────────────────
const getOutcomesByCase = async (req, res) => {
  try {
    const outcomes = await HearingOutcome.find({
      caseId: req.params.caseId,
    })
      .populate("createdBy", "name email")
      .sort({ hearingDate: -1 });

    res.status(200).json(outcomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOutcome,
  getOutcomesByCase,
};
