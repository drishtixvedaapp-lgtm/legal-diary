const mongoose =
require("mongoose");

const hearingOutcomeSchema =
new mongoose.Schema({

  caseId: {
    type:
      mongoose.Schema.Types.ObjectId,
    ref: "Case",
    required: true,
  },

  hearingDate: {
    type: Date,
    required: true,
  },

  outcome: {
    type: String,
    required: true,
  },

  judgeRemarks: {
    type: String,
  },

  nextHearing: {
    type: Date,
  },

  createdBy: {
    type:
      mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

}, {
  timestamps: true,
});

module.exports =
mongoose.model(
  "HearingOutcome",
  hearingOutcomeSchema
);