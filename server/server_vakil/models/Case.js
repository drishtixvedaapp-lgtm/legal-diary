const mongoose = require("mongoose");

const partySchema = new mongoose.Schema({
  name:    { type: String, required: true },
  address: { type: String },
}, { _id: false });

const caseSchema = new mongoose.Schema({

  // ── Case Identity ────────────────────────────────────────────────────────
  caseNumber: { type: String, required: true, unique: true },

  // Case type prefix — RP, FA, A, CC, AEA, WP, OS, etc.
  casePrefix: {
    type: String,
    enum: ["A","FA","RP","CC","AEA","WP","OS","CS","CRP","EP","AS","MA","SA","IA","Other"],
    default: "A",
  },

  caseType: {
    type: String,
    enum: [
      "Civil", "Criminal", "Constitutional / Writ", "Family",
      "Consumer", "Labour / Employment", "Taxation", "Revenue / Land", "Commercial",
    ],
    default: "Civil",
  },

  // ── Forum / Court ────────────────────────────────────────────────────────
  courtName: { type: String, required: true },

  forum: {
    type: String,
    enum: [
      "District Consumer Forum",
      "State Consumer Commission",
      "National Consumer Commission (NCDRC)",
      "High Court",
      "Supreme Court",
      "District Court",
      "Sessions Court",
      "Family Court",
      "Labour Court",
      "Tribunal",
      "Other",
    ],
    default: "District Court",
  },

  // ── Parties ──────────────────────────────────────────────────────────────

  // Which side does the lawyer represent?
  lawyerRepresents: {
    type: String,
    enum: ["Appellant / Petitioner / Complainant", "Respondent / Defendant / Opposite Party"],
    required: true,
  },

  // Our client (the main party we represent — linked to Client model)
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: false,
    default: null,
  },

  // Additional parties on OUR side (co-appellants, co-complainants etc.)
  ourParties: [partySchema],

  // Opposite parties (respondents or appellants on the other side)
  oppositeParties: [partySchema],

  // Opposite counsel name
  oppositeCounsel: { type: String },

  // ── Hearing Details ──────────────────────────────────────────────────────
  nextHearing: { type: Date, required: true },
  hearingTime: { type: String },
  // ── Case Title (auto-generated or custom) ────────────────────────────────
  caseTitle: { type: String, required: true },

  // ── Stage & Status ───────────────────────────────────────────────────────
  stage:  { type: String, default: "" },
  status: { type: String, enum: ["Active","Pending","Closed"], default: "Active" },

  // ── Assignment ───────────────────────────────────────────────────────────
  assignedLawyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  closedAt: { type: Date },
  notes:    { type: String },

  // WhatsApp group ID — if set, reminders go to this group instead of/in addition to client
  whatsappGroupId: { type: String, default: "" },

}, { timestamps: true });

module.exports = mongoose.model("Case", caseSchema);