const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
{
  caseNumber: {
    type: String,
    required: true,
    unique: true,
  },

  caseTitle: {
    type: String,
    required: true,
  },

  courtName: {
    type: String,
    required: true,
  },

  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },

  assignedLawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  nextHearing: {
    type: Date,
    required: true,
  },

  hearingTime: {
    type: String,
  },

  hearingType: {
    type: String,
    default: "Arguments",
  },

  caseType: {
    type: String,
    enum: [
      "Civil",
      "Criminal",
      "Constitutional / Writ",
      "Family",
      "Consumer",
      "Labour / Employment",
      "Taxation",
      "Revenue / Land",
      "Commercial",
    ],
    default: "Civil",
  },

  stage: {
    type: String,
    default: "Filing",
  },

  status: {
    type: String,
    enum: ["Active", "Pending", "Closed"],
    default: "Active",
  },

  closedAt: {
    type: Date,
  },

  notes: {
    type: String,
  },
},
{
  timestamps: true,
}
);

module.exports =
mongoose.model("Case", caseSchema);