const Case           = require("../models/Case");
const Client         = require("../models/Client");
const User           = require("../models/User");
const Notification   = require("../models/Notification");
const TimelineEvent  = require("../models/TimelineEvent");
const CaseNote       = require("../models/CaseNote");
const CaseDocument   = require("../models/CaseDocument");
const HearingOutcome = require("../models/HearingOutcome");

const { sendEmail, newCaseEmail, hearingUpdatedEmail } = require("../utils/sendEmail");
const { sendWAToClient } = require("../utils/sendToClient");

// ── Helper: send both email + WhatsApp ───────────────────────────────────────
const sendReminders = async (caseDoc, type) => {
  try {
    const client = caseDoc.client ? await Client.findById(caseDoc.client) : null;
    const lawyer  = await User.findById(caseDoc.assignedLawyer).select("name phone");

    // Need at least a client or a group to send to
    if (!client && !caseDoc.whatsappGroupId) return;

    const lawyerName  = lawyer?.name  || "Your Assigned Lawyer";
    const lawyerPhone = lawyer?.phone || null;

    // For group-only cases with no client, just send to group
    if (!client && caseDoc.whatsappGroupId) {
      try {
        const { sendWAToClient } = require("../utils/sendToClient");
        await sendWAToClient(type, {}, caseDoc, lawyerName, lawyerPhone);
      } catch(e) { console.error("❌ Group WhatsApp:", e.message); }
      return;
    }

    const emailPayload = {
      to         : client?.email,
      clientName : client?.name || "Client",
      caseTitle  : caseDoc.caseTitle,
      caseNumber : caseDoc.caseNumber,
      courtName  : caseDoc.courtName,
      date       : new Date(caseDoc.nextHearing).toLocaleDateString("en-IN", {
                     weekday:"long", year:"numeric", month:"long", day:"numeric",
                   }),
      time       : caseDoc.hearingTime || "As scheduled",
      lawyerName,
      lawyerPhone,
    };

    // Email — only if client exists and has email
    if (client?.email) {
      try {
        if (type === "newCase") {
          await sendEmail(
            client.email,
            `New Hearing Scheduled – ${caseDoc.caseTitle}`,
            `Dear ${client.name}, your hearing is on ${emailPayload.date}.`,
            newCaseEmail(emailPayload)
          );
        } else {
          await sendEmail(
            client.email,
            `Hearing Date Updated – ${caseDoc.caseTitle}`,
            `Dear ${client.name}, your hearing has been rescheduled to ${emailPayload.date}.`,
            hearingUpdatedEmail(emailPayload)
          );
        }
        console.log(`📧 Email sent → ${client.email}`);
      } catch(e) { console.error("❌ Email:", e.message); }
    }

    // WhatsApp — to client phones + group if set
    if (client?.phone || caseDoc.whatsappGroupId) {
      try {
        await sendWAToClient(type, client || {}, caseDoc, lawyerName, lawyerPhone);
      } catch(e) { console.error("❌ WhatsApp:", e.message); }
    }

  } catch(e) {
    console.error("❌ sendReminders error:", e.message);
  }
};

// ── CREATE CASE ───────────────────────────────────────────────────────────────
const createCase = async (req, res) => {
  try {
    const newCase = await Case.create({
      ...req.body,
      client        : req.body.client || null,  // convert "" to null
      assignedLawyer: req.user._id,
      createdBy     : req.user._id,
    });

    try {
      await Notification.create({
        case: newCase._id, type: "email",
        scheduledFor: newCase.nextHearing,
        message: `New hearing scheduled for ${newCase.caseTitle}`,
        sent: false,
      });
    } catch(e) { console.error("❌ Notification:", e.message); }

    try {
      await TimelineEvent.create({
        caseId: newCase._id, eventType: "HEARING", title: "Case Created",
        description: `First hearing on ${new Date(newCase.nextHearing).toLocaleDateString()}`,
      });
    } catch(e) { console.error("❌ Timeline:", e.message); }

    await sendReminders(newCase, "newCase");

    res.status(201).json(newCase);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL CASES ─────────────────────────────────────────────────────────────
const getCases = async (req, res) => {
  try {
    let cases;
    if (req.user.role === "admin") {
      cases = await Case.find()
        .populate("client").populate("assignedLawyer").sort({ createdAt: -1 });
    } else {
      cases = await Case.find({ assignedLawyer: req.user._id })
        .populate("client").sort({ createdAt: -1 });
    }
    res.status(200).json(cases);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET SINGLE CASE ───────────────────────────────────────────────────────────
const getCaseById = async (req, res) => {
  try {
    const singleCase = await Case.findById(req.params.id)
      .populate("client").populate("assignedLawyer");
    if (!singleCase) return res.status(404).json({ message: "Case not found" });
    res.status(200).json(singleCase);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE CASE ───────────────────────────────────────────────────────────────
const updateCase = async (req, res) => {
  try {
    const existing = await Case.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Case not found" });

    const oldDate     = existing.nextHearing ? new Date(existing.nextHearing).toDateString() : null;
    const newDate     = req.body.nextHearing  ? new Date(req.body.nextHearing).toDateString()  : null;
    const dateChanged = newDate && oldDate !== newDate;

    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { ...req.body, client: req.body.client || null },
      { new: true }
    );

    if (dateChanged) {
      try {
        await Notification.create({
          case: updated._id, type: "email",
          scheduledFor: updated.nextHearing,
          message: `Hearing date updated for ${updated.caseTitle}`,
          sent: false,
        });
        await TimelineEvent.create({
          caseId: updated._id, eventType: "HEARING",
          title: "Hearing Date Updated",
          description: `Rescheduled to ${new Date(updated.nextHearing).toLocaleDateString()}`,
        });
      } catch(e) { console.error("❌ Notification/Timeline:", e.message); }

      await sendReminders(updated, "updated");
    }

    res.status(200).json(updated);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE CASE (cascade) ─────────────────────────────────────────────────────
const deleteCase = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });

    await Promise.all([
      CaseNote.deleteMany(      { caseId: req.params.id }),
      CaseDocument.deleteMany(  { caseId: req.params.id }),
      HearingOutcome.deleteMany({ caseId: req.params.id }),
      Notification.deleteMany(  { case:   req.params.id }),
      TimelineEvent.deleteMany( { caseId: req.params.id }),
    ]);

    await caseDoc.deleteOne();
    res.status(200).json({ message: "Case and all associated data deleted successfully" });
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET CLOSED CASES ──────────────────────────────────────────────────────────
const getClosedCases = async (req, res) => {
  try {
    const cases = await Case.find({ status: "Closed" })
      .populate("client").populate("assignedLawyer").sort({ closedAt: -1 });
    res.status(200).json(cases);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCase, getCases, getCaseById, updateCase, deleteCase, getClosedCases };